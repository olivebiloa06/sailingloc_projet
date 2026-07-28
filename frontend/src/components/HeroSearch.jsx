import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Recherche de réservation déplacée du header vers le hero de l'accueil —
// seul endroit où elle vit désormais. La date n'est pas encore exploitée par
// la liste de bateaux (le filtrage par disponibilité se fait aujourd'hui à
// la réservation, pas à la recherche) : elle est transmise quand même dans
// l'URL, prête à être utilisée le jour où /boats saura la lire.
export default function HeroSearch({ className = "", style }) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [personnes, setPersonnes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (destination) params.set("localisation", destination);
    if (date) params.set("date", date);
    if (personnes) params.set("capacite", personnes);

    navigate(`/boats?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={style}
      className={`flex w-[92%] max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_30px_60px_-20px_rgba(6,27,46,0.45)] sm:flex-row sm:items-stretch ${className}`}
    >
      <label className="flex flex-1 flex-col px-5 py-3 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Destination
        </span>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Où navigues-tu ?"
          className="bg-transparent text-sm text-navy placeholder:text-gray-400 focus:outline-none"
        />
      </label>

      <div className="h-px w-full bg-gray-200 sm:h-auto sm:w-px sm:self-stretch" />

      <label className="flex flex-1 flex-col px-5 py-3 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Date
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-transparent text-sm text-navy focus:outline-none"
        />
      </label>

      <div className="h-px w-full bg-gray-200 sm:h-auto sm:w-px sm:self-stretch" />

      <label className="flex flex-1 flex-col px-5 py-3 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Personnes
        </span>
        <input
          type="number"
          min="1"
          value={personnes}
          onChange={(e) => setPersonnes(e.target.value)}
          placeholder="Combien ?"
          className="bg-transparent text-sm text-navy placeholder:text-gray-400 focus:outline-none"
        />
      </label>

      <button
        type="submit"
        aria-label="Rechercher"
        className="flex items-center justify-center gap-2 bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-light sm:py-0"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="sm:hidden">Rechercher</span>
      </button>
    </form>
  );
}
