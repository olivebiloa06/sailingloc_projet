import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import BoatMark from "./BoatMark";

// Reprend exactement les items du wireframe : Devenir propriétaire,
// Inspiration, À propos. "Compte" est géré séparément (voir AccountLink)
// car son libellé dépend de l'état de connexion. "Langue / devise" est un
// espace réservé visuel : pas d'i18n ni de multi-devise dans ce projet pour
// l'instant, donc non cliquable.
const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/register?role=proprietaire", label: "Devenir propriétaire" },
  { to: "/inspiration", label: "Inspiration" },
  { to: "/a-propos", label: "À propos" },
];

function AccountLink({ className }) {
  const { user } = useAuth();

  if (user) {
    return (
      <Link to="/mon-compte" className={className}>
        {user.prenom}
      </Link>
    );
  }

  return (
    <Link to="/login" className={className}>
      Connexion
    </Link>
  );
}

// Barre de recherche intégrée au header (présente sur toutes les pages, pas
// seulement l'accueil) — Destination / Date / Personnes, comme dans le
// wireframe. La date n'est pas encore exploitée par la liste de bateaux
// (le filtrage par disponibilité se fait aujourd'hui à la réservation, pas
// à la recherche) : elle est transmise quand même dans l'URL, prête à être
// utilisée le jour où /boats saura la lire.
function SearchBar({ className = "" }) {
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
      className={`flex w-full max-w-2xl items-stretch overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <label className="flex flex-1 flex-col px-5 py-2 text-left">
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

      <div className="w-px self-stretch bg-gray-200" />

      <label className="flex flex-1 flex-col px-5 py-2 text-left">
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

      <div className="w-px self-stretch bg-gray-200" />

      <label className="flex flex-1 flex-col px-5 py-2 text-left">
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
        className="flex items-center justify-center bg-navy px-5 text-white transition hover:bg-navy-light"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-navy">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cloud">
            <BoatMark className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-semibold">
            Logo sailingLOC
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-gray-600 transition hover:text-sky"
            >
              {link.label}
            </Link>
          ))}

          <AccountLink className="text-sm font-medium text-gray-600 transition hover:text-sky" />

          {/* Sélecteur langue/devise — visuel uniquement pour l'instant */}
          <span className="text-sm font-medium text-gray-400" title="Bientôt disponible">
            FR / €
          </span>
        </nav>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center text-navy lg:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {mobileOpen ? (
              <path d="M6 6 L18 18 M18 6 L6 18" />
            ) : (
              <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
            )}
          </svg>
        </button>
      </div>

      {/* Barre de recherche — visible sur toutes les pages, sous la nav */}
      <div className="hidden justify-center px-6 pb-5 lg:flex">
        <SearchBar />
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 lg:hidden">
          <SearchBar className="mb-5" />

          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="py-1 text-sm font-medium text-gray-700"
              >
                {link.label}
              </Link>
            ))}
            <AccountLink className="py-1 text-sm font-medium text-gray-700" />
          </nav>
        </div>
      )}
    </header>
  );
}
