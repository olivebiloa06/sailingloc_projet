// Test de montée en charge — tape des routes publiques en lecture (les plus
// consultées en usage réel : liste des bateaux, avis, articles) avec un
// nombre de connexions concurrentes croissant, et rapporte la latence et le
// débit à chaque palier.
//
// Usage :
//   node loadtest/load-test.js
//   TARGET_URL=https://sailingloc-backend.onrender.com node loadtest/load-test.js
//   LOADTEST_DURATION=30 LOADTEST_STEPS=10,50,100,200 node loadtest/load-test.js
//
// Le serveur backend doit déjà tourner (npm run dev / npm start) et pointer
// vers une base contenant des données (npm run seed), sinon les routes
// répondent vite mais avec des listes vides — peu représentatif d'un usage
// réel.

const autocannon = require("autocannon");

const TARGET_URL = process.env.TARGET_URL || "http://localhost:5000";
const DURATION = Number(process.env.LOADTEST_DURATION) || 15; // secondes par palier
const STEPS = (process.env.LOADTEST_STEPS || "10,50,100,200")
  .split(",")
  .map((n) => Number(n.trim()))
  .filter((n) => n > 0);

const ROUTES = ["/api/boats", "/api/reviews", "/api/articles"];

function runStep(connections) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url: TARGET_URL,
        connections,
        duration: DURATION,
        requests: ROUTES.map((path) => ({ method: "GET", path })),
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    autocannon.track(instance, { renderProgressBar: true });
  });
}

function formatResult(connections, result) {
  const errorRate = result.errors + result.timeouts + result.non2xx;
  return [
    `\n=== ${connections} connexions simultanées (${DURATION}s) ===`,
    `Requêtes/s      : moyenne ${result.requests.average.toFixed(1)}, min ${result.requests.min}, max ${result.requests.max}`,
    `Latence (ms)    : moyenne ${result.latency.average.toFixed(1)}, p50 ${result.latency.p50}, p99 ${result.latency.p99}, max ${result.latency.max}`,
    `Débit           : ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`,
    `Total requêtes  : ${result.requests.total}`,
    `Codes non-2xx   : ${result.non2xx}  Erreurs socket : ${result.errors}  Timeouts : ${result.timeouts}`,
    errorRate > 0 ? "⚠️  Des erreurs ou timeouts sont apparus à ce palier." : "✅ Aucune erreur à ce palier.",
  ].join("\n");
}

async function main() {
  console.log(`Cible : ${TARGET_URL} — routes testées : ${ROUTES.join(", ")}`);
  console.log(`Paliers : ${STEPS.join(", ")} connexions, ${DURATION}s chacun.\n`);

  const summary = [];

  for (const connections of STEPS) {
    const result = await runStep(connections);
    console.log(formatResult(connections, result));
    summary.push({
      connections,
      avgLatencyMs: result.latency.average,
      p99LatencyMs: result.latency.p99,
      avgReqPerSec: result.requests.average,
      errors: result.errors + result.timeouts + result.non2xx,
    });
  }

  console.log("\n=== Résumé ===");
  console.table(summary);

  const firstFailing = summary.find((s) => s.errors > 0);
  if (firstFailing) {
    console.log(
      `\n⚠️  Le service commence à renvoyer des erreurs à partir de ${firstFailing.connections} connexions simultanées.`
    );
  } else {
    console.log(`\n✅ Aucune erreur détectée jusqu'à ${STEPS[STEPS.length - 1]} connexions simultanées.`);
  }
}

main().catch((err) => {
  console.error("Échec du test de charge :", err.message);
  process.exit(1);
});
