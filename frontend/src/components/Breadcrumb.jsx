import { Link, useLocation } from "react-router-dom";

// Correspondance chemin → label lisible en FR et EN
const LABELS = {
  FR: {
    boats: "Bateaux",
    "mes-messages": "Messages",
    "mes-reservations": "Mes réservations",
    "mes-bateaux": "Mes bateaux",
    "mon-compte": "Mon compte",
    reservation: "Réservation",
    inspiration: "Inspiration",
    "a-propos": "À propos",
    aide: "Centre d'aide",
    avis: "Avis",
    securite: "Sécurité",
    assurance: "Assurance",
    "ressources-proprietaires": "Ressources propriétaires",
    "mentions-legales": "Mentions légales",
    confidentialite: "Confidentialité",
    cookies: "Cookies",
    contact: "Contact",
    login: "Connexion",
    register: "Inscription",
    "forgot-password": "Mot de passe oublié",
    "reset-password": "Réinitialisation",
    "booking-success": "Confirmation",
    "admin": "Administration",
    bateaux: "Bateaux",
  },
  EN: {
    boats: "Boats",
    "mes-messages": "Messages",
    "mes-reservations": "My bookings",
    "mes-bateaux": "My boats",
    "mon-compte": "My account",
    reservation: "Booking",
    inspiration: "Inspiration",
    "a-propos": "About",
    aide: "Help center",
    avis: "Reviews",
    securite: "Security",
    assurance: "Insurance",
    "ressources-proprietaires": "Owner resources",
    "mentions-legales": "Legal notice",
    confidentialite: "Privacy",
    cookies: "Cookies",
    contact: "Contact",
    login: "Login",
    register: "Sign up",
    "booking-success": "Confirmation",
    "admin": "Administration",
    bateaux: "Boats",
  },
};

export default function Breadcrumb() {
  const location = useLocation();
  const lang = (() => {
    try { return JSON.parse(localStorage.getItem("sl_prefs") || "{}").language || "FR"; }
    catch { return "FR"; }
  })();
  const labels = LABELS[lang] || LABELS.FR;

  // Découpe le chemin en segments
  const segments = location.pathname.split("/").filter(Boolean);

  // Ne pas afficher sur la homepage
  if (segments.length === 0) return null;

  const crumbs = [
    { label: lang === "EN" ? "Home" : "Accueil", to: "/" },
    ...segments.map((seg, i) => ({
      label: labels[seg] || (seg.length > 20 ? `#${seg.slice(0, 8)}…` : seg),
      to: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  return (
    <nav aria-label="Fil d'Ariane" className="border-b border-gray-100 bg-white">
      <ol className="mx-auto flex max-w-6xl items-center gap-1.5 overflow-x-auto px-6 py-2.5 text-xs">
        {crumbs.map((crumb, i) => (
          <li key={crumb.to} className="flex items-center gap-1.5 shrink-0">
            {i > 0 && <span className="text-gray-300">›</span>}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-navy">{crumb.label}</span>
            ) : (
              <Link to={crumb.to} className="text-gray-400 hover:text-sky transition">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
