import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 lg:hidden">
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
