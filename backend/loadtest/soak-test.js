// Test d'endurance sur 24h — envoie un trafic modéré et constant (pas un pic
// de charge, l'objectif est la stabilité dans la durée : fuite mémoire,
// dégradation progressive de la latence, connexions qui ne se referment pas
// bien...), par rounds successifs, et journalise chaque round dans un
// fichier JSONL pour pouvoir analyser la tendance après coup.
//
// Ce script ne s'arrête pas tout seul avant la durée demandée : à lancer en
// arrière-plan et à laisser tourner. Il ne se substitue pas à un vrai test
// d'endurance en conditions réelles (variation de charge, redémarrages,
// déploiements) mais donne un signal fiable de dérive dans le temps.
//
// Usage :
//   node loadtest/soak-test.js                        # 24h, 20 connexions, contre localhost:5000
//   SOAK_DURATION_HOURS=0.02 node loadtest/soak-test.js   # ~1 min, pour vérifier que ça tourne
//   TARGET_URL=https://sailingloc-backend.onrender.com SOAK_DURATION_HOURS=24 node loadtest/soak-test.js
//
// Pour un vrai run de 24h : nohup node loadtest/soak-test.js > soak.out 2>&1 &

const fs = require("fs");
const path = require("path");
const autocannon = require("autocannon");

const TARGET_URL = process.env.TARGET_URL || "http://localhost:5000";
const CONNECTIONS = Number(process.env.SOAK_CONNECTIONS) || 20;
const ROUND_DURATION_SEC = Number(process.env.SOAK_ROUND_SECONDS) || 60;
const TOTAL_DURATION_HOURS = Number(process.env.SOAK_DURATION_HOURS) || 24;
const TOTAL_DURATION_MS = TOTAL_DURATION_HOURS * 60 * 60 * 1000;

const ROUTES = ["/api/boats", "/api/reviews", "/api/articles"];

const LOG_DIR = path.join(__dirname, "logs");
fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, `soak-${new Date().toISOString().replace(/[:.]/g, "-")}.jsonl`);

function runRound() {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url: TARGET_URL,
        connections: CONNECTIONS,
        duration: ROUND_DURATION_SEC,
        requests: ROUTES.map((path) => ({ method: "GET", path })),
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    autocannon.track(instance, { renderProgressBar: false });
  });
}

// Compare la moyenne des `n` premiers rounds à celle des `n` derniers pour
// détecter une dérive (latence qui grimpe, erreurs qui apparaissent avec le
// temps — signe classique de fuite mémoire ou de fuite de connexions).
function detectDrift(rounds) {
  const n = Math.min(5, Math.floor(rounds.length / 2));
  if (n < 2) return null;

  const first = rounds.slice(0, n);
  const last = rounds.slice(-n);
  const avg = (arr, key) => arr.reduce((sum, r) => sum + r[key], 0) / arr.length;

  const firstLatency = avg(first, "avgLatencyMs");
  const lastLatency = avg(last, "avgLatencyMs");
  const firstErrors = avg(first, "errors");
  const lastErrors = avg(last, "errors");

  return {
    latencyDriftPercent: firstLatency > 0 ? ((lastLatency - firstLatency) / firstLatency) * 100 : 0,
    firstErrors,
    lastErrors,
  };
}

async function main() {
  const startedAt = Date.now();
  const endAt = startedAt + TOTAL_DURATION_MS;

  console.log(`Cible : ${TARGET_URL}`);
  console.log(`Durée totale : ${TOTAL_DURATION_HOURS}h — rounds de ${ROUND_DURATION_SEC}s à ${CONNECTIONS} connexions`);
  console.log(`Journal : ${LOG_FILE}\n`);

  const rounds = [];
  let roundIndex = 0;

  while (Date.now() < endAt) {
    roundIndex += 1;
    const result = await runRound();

    const entry = {
      round: roundIndex,
      timestamp: new Date().toISOString(),
      elapsedMinutes: Math.round((Date.now() - startedAt) / 60000),
      avgLatencyMs: result.latency.average,
      p99LatencyMs: result.latency.p99,
      avgReqPerSec: result.requests.average,
      errors: result.errors + result.timeouts + result.non2xx,
      totalRequests: result.requests.total,
    };

    rounds.push(entry);
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");

    const flag = entry.errors > 0 ? " ⚠️ erreurs" : "";
    console.log(
      `[round ${roundIndex} · ${entry.elapsedMinutes}min] latence moy. ${entry.avgLatencyMs.toFixed(1)}ms · ` +
        `p99 ${entry.p99LatencyMs}ms · ${entry.avgReqPerSec.toFixed(0)} req/s · ${entry.totalRequests} requêtes${flag}`
    );

    // Point de contrôle toutes les ~2h (ou tous les 20 rounds sur un run court).
    if (roundIndex % 20 === 0) {
      const drift = detectDrift(rounds);
      if (drift) {
        console.log(
          `  → tendance latence sur cette fenêtre : ${drift.latencyDriftPercent >= 0 ? "+" : ""}${drift.latencyDriftPercent.toFixed(1)}%` +
            (drift.lastErrors > drift.firstErrors ? " — les erreurs augmentent, à surveiller." : "")
        );
      }
    }
  }

  const drift = detectDrift(rounds);
  console.log(`\n=== Fin du test d'endurance (${rounds.length} rounds sur ${TOTAL_DURATION_HOURS}h) ===`);
  console.log(`Journal complet : ${LOG_FILE}`);
  if (drift) {
    console.log(
      `Dérive de latence entre le début et la fin du run : ${drift.latencyDriftPercent >= 0 ? "+" : ""}${drift.latencyDriftPercent.toFixed(1)}%`
    );
    if (drift.latencyDriftPercent > 20) {
      console.log("⚠️  Dérive significative (>20%) — signe possible de fuite mémoire ou de connexions non libérées.");
    } else {
      console.log("✅ Pas de dérive significative détectée.");
    }
  }
}

main().catch((err) => {
  console.error("Échec du test d'endurance :", err.message);
  process.exit(1);
});
