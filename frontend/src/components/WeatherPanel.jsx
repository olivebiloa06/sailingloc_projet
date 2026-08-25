import { useEffect, useState } from "react";

// Codes météo WMO renvoyés par Open-Meteo — voir
// https://open-meteo.com/en/docs#weather_variable_documentation
const WEATHER_INFO = {
  0: { label: "Ciel dégagé", icon: "☀️" },
  1: { label: "Plutôt dégagé", icon: "🌤️" },
  2: { label: "Partiellement nuageux", icon: "⛅" },
  3: { label: "Couvert", icon: "☁️" },
  45: { label: "Brouillard", icon: "🌫️" },
  48: { label: "Brouillard givrant", icon: "🌫️" },
  51: { label: "Bruine légère", icon: "🌦️" },
  53: { label: "Bruine", icon: "🌦️" },
  55: { label: "Bruine dense", icon: "🌦️" },
  61: { label: "Pluie légère", icon: "🌧️" },
  63: { label: "Pluie", icon: "🌧️" },
  65: { label: "Forte pluie", icon: "🌧️" },
  71: { label: "Neige légère", icon: "🌨️" },
  73: { label: "Neige", icon: "🌨️" },
  75: { label: "Forte neige", icon: "❄️" },
  80: { label: "Averses", icon: "🌦️" },
  81: { label: "Averses fortes", icon: "🌧️" },
  82: { label: "Averses violentes", icon: "⛈️" },
  95: { label: "Orage", icon: "⛈️" },
  96: { label: "Orage avec grêle", icon: "⛈️" },
  99: { label: "Orage violent", icon: "⛈️" },
};

function weatherInfo(code) {
  return WEATHER_INFO[code] || { label: "Conditions variables", icon: "🌥️" };
}

function uvLabel(uv) {
  if (uv < 3) return "Faible";
  if (uv < 6) return "Modéré";
  if (uv < 8) return "Élevé";
  if (uv < 11) return "Très élevé";
  return "Extrême";
}

// Heuristique simple : vent fort et/ou risque de pluie élevé dégradent la
// navigation. Pas une prévision marine officielle (pas de données de houle
// dans Open-Meteo gratuit) — indicatif seulement, à affiner si un jour on
// branche une source météo marine dédiée.
function navigationConditions(windKmh, precipProbability) {
  if (windKmh < 15 && precipProbability < 30) return { label: "Excellente", tone: "text-green-400" };
  if (windKmh < 25 && precipProbability < 60) return { label: "Bonne", tone: "text-green-300" };
  if (windKmh < 35) return { label: "Moyenne", tone: "text-yellow-300" };
  return { label: "Déconseillée", tone: "text-red-400" };
}

const DAY_LABELS = ["DIM.", "LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM."];

export default function WeatherPanel({ latitude, longitude, locationName }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    let cancelled = false;
    setData(null);
    setError(false);

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,sunrise,sunset,precipitation_probability_max,uv_index_max` +
      `&timezone=auto`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("weather fetch failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  if (latitude == null || longitude == null) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center rounded-2xl bg-navy p-6 text-center text-sm text-white/60">
        Clique sur un bateau de la carte pour voir la météo de sa zone.
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center rounded-2xl bg-navy p-6 text-center text-sm text-white/60">
        Météo indisponible pour le moment.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center rounded-2xl bg-navy p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  const { current, daily } = data;
  const weather = weatherInfo(current.weather_code);
  const nav = navigationConditions(current.wind_speed_10m, daily.precipitation_probability_max[0]);
  const sunset = new Date(daily.sunset[0]).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const sunrise = new Date(daily.sunrise[0]).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-full flex-col rounded-2xl bg-navy p-6 text-white">
      <p className="flex items-center gap-1.5 text-sm text-white/70">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.7a1 1 0 0 0 1.4 0C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
        </svg>
        {locationName} — Aujourd'hui
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-5xl font-bold">{Math.round(current.temperature_2m)}°C</span>
        <span className="text-5xl" aria-hidden>{weather.icon}</span>
      </div>
      <p className="text-white/80">{weather.label}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Vent</p>
          <p className="mt-1 text-lg font-semibold">{Math.round(current.wind_speed_10m)} km/h</p>
          <p className="text-xs text-white/50">{(current.wind_speed_10m / 1.852).toFixed(1)} nœuds</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">UV</p>
          <p className="mt-1 text-lg font-semibold">{Math.round(daily.uv_index_max[0])}</p>
          <p className="text-xs text-white/50">{uvLabel(daily.uv_index_max[0])}</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Coucher</p>
          <p className="mt-1 text-lg font-semibold">{sunset}</p>
          <p className="text-xs text-white/50">Lever {sunrise}</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Précipitations</p>
          <p className="mt-1 text-lg font-semibold">{Math.round(daily.precipitation_probability_max[0])}%</p>
          <p className="text-xs text-white/50">Probable</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm">
        <span className="text-white/70">Conditions de navigation</span>
        <span className={`font-semibold ${nav.tone}`}>{nav.label} ★</span>
      </div>

      <div className="mt-5">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/50">
          Prévisions 7 jours
        </p>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
          {daily.time.slice(0, 7).map((date, i) => {
            const info = weatherInfo(daily.weather_code[i]);
            return (
              <div key={date} className="rounded-lg bg-white/10 py-2">
                <p className="text-white/50">{DAY_LABELS[new Date(date).getDay()]}</p>
                <p className="mt-1 text-base" aria-hidden>{info.icon}</p>
                <p className="mt-1 font-semibold">{Math.round(daily.temperature_2m_max[i])}°</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
