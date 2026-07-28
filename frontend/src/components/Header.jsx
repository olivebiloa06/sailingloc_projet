import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";
import LanguageCurrencyPicker from "./LanguageCurrencyPicker";
import BoatMark from "./BoatMark";
import logoImg from "../assets/logo.jpg";

<<<<<<< HEAD
// Reprend exactement les items du wireframe : Devenir propriétaire,
// Inspiration, À propos. "Compte" est géré séparément (voir AccountLink)
// car son libellé dépend de l'état de connexion. "Langue / devise" est un
// espace réservé visuel : pas d'i18n ni de multi-devise dans ce projet pour
// l'instant, donc non cliquable.
const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/boats", label: "Bateaux" },
  { to: "/register?role=proprietaire", label: "Devenir propriétaire" },
  { to: "/inspiration", label: "Inspiration" },
  { to: "/a-propos", label: "À propos" },
];
function AccountLink({ className }) {
  const { user } = useAuth();
=======
const DECOUVRIR_MENU = [
  {
    section: "Louer un bateau",
    items: [
      { to: "/boats", label: "Tous les bateaux", icon: "⛵", desc: "Explorer toutes les annonces disponibles" },
      { to: "/boats?type=voilier", label: "Voiliers", icon: "🌊", desc: "Navigation à la voile, avec ou sans skipper" },
      { to: "/boats?type=catamaran", label: "Catamarans", icon: "🏖️", desc: "Stabilité et confort pour toute la famille" },
      { to: "/boats?type=bateau_moteur", label: "Bateaux à moteur", icon: "⚡", desc: "Rapides et polyvalents" },
      { to: "/boats?avecSkipper=true", label: "Avec skipper", icon: "🧭", desc: "Profitez sans vous soucier de la navigation" },
    ],
  },
  {
    section: "Top destinations",
    items: [
      { to: "/boats?localisation=Corse", label: "Corse", icon: "🏝️", desc: "Eaux cristallines, criques sauvages" },
      { to: "/boats?localisation=C%C3%B4te%20d'Azur", label: "Côte d'Azur", icon: "☀️", desc: "Saint-Tropez, Cannes, Nice" },
      { to: "/boats?localisation=Morbihan", label: "Golfe du Morbihan", icon: "🗺️", desc: "40 îles à explorer" },
      { to: "/boats?localisation=Croatie", label: "Croatie", icon: "🌅", desc: "1000 îles dans l'Adriatique" },
      { to: "/boats?localisation=Baleares", label: "Baléares", icon: "🐠", desc: "Majorque, Ibiza, Formentera" },
    ],
  },
  {
    section: "Pour les propriétaires",
    items: [
      { to: "/register?role=proprietaire", label: "Mettre mon bateau en location", icon: "🔑", desc: "Publie ton annonce gratuitement" },
      { to: "/mon-compte", label: "Gérer mes annonces", icon: "📋", desc: "Disponibilités, réservations, revenus" },
    ],
  },
  {
    section: "Découverte & guides",
    items: [
      { to: "/inspiration", label: "Inspiration", icon: "✨", desc: "Actualités nautiques & guides de voyage" },
      { to: "/a-propos", label: "À propos de SailingLoc", icon: "ℹ️", desc: "Notre mission, notre équipe" },
    ],
  },
];

function DecouvrirDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
>>>>>>> feature/tests-jest

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-sm font-medium transition ${open ? "text-navy" : "text-gray-600 hover:text-navy"}`}
      >
        Découvrir
        <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-3 w-[680px] -translate-x-1/4 rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="grid grid-cols-2 gap-0 p-4">
            {DECOUVRIR_MENU.map((group) => (
              <div key={group.section} className="p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {group.section}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-cloud"
                    >
                      <span className="mt-0.5 text-xl leading-none">{item.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-navy">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-b-2xl border-t border-gray-100 bg-cloud px-6 py-3">
            <p className="text-xs text-gray-500">
              🛡️ Paiement sécurisé · Annulation gratuite sous 48h · Contrat inclus
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountLink() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-navy transition hover:border-navy hover:bg-cloud"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Connexion
      </Link>
    );
  }

  const initials = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();
  const roleColors = { admin: "bg-sky text-white", proprietaire: "bg-navy text-white", locataire: "bg-sable text-white" };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 transition hover:border-navy hover:shadow-sm"
      >
        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${roleColors[user.role] || "bg-navy text-white"}`}>
          {initials}
        </div>
        <span className="text-sm font-medium text-navy">{user.prenom}</span>
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-gray-400" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-navy">{user.prenom} {user.nom}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${roleColors[user.role] || "bg-navy text-white"}`}>
              {user.role}
            </span>
          </div>
          <div className="p-2">
            <Link to="/mon-compte" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-cloud">
              <span>👤</span> Mon compte
            </Link>
            {user.role === "proprietaire" && (
              <Link to="/mes-bateaux" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-cloud">
                <span>⛵</span> Mes bateaux
              </Link>
            )}
            {user.role !== "admin" && (
              <Link to="/mes-reservations" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-cloud">
                <span>📅</span> Mes réservations
              </Link>
            )}
            <Link to="/mes-messages" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-cloud">
              <span>💬</span> Messages
            </Link>
            {user.role === "admin" && (
              <Link to="/admin/documents" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-sky hover:bg-cloud">
                <span>🛡️</span> Administration
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Destination</span>
        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Où navigues-tu ?" className="bg-transparent text-sm text-navy placeholder:text-gray-400 focus:outline-none" />
      </label>
      <div className="w-px self-stretch bg-gray-200" />
      <label className="flex flex-1 flex-col px-5 py-2 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-sm text-navy focus:outline-none" />
      </label>
      <div className="w-px self-stretch bg-gray-200" />
      <label className="flex flex-1 flex-col px-5 py-2 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Personnes</span>
        <input type="number" min="1" value={personnes} onChange={(e) => setPersonnes(e.target.value)} placeholder="Combien ?" className="bg-transparent text-sm text-navy placeholder:text-gray-400 focus:outline-none" />
      </label>
      <button type="submit" aria-label="Rechercher" className="flex items-center justify-center rounded-r-full bg-navy px-5 text-white transition hover:bg-navy-light">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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
    <header className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-navy">
          <img
            src={logoImg}
            alt="SailingLoc"
            className="h-10 w-10 rounded-full object-cover shadow-sm"
          />
          <span className="font-heading text-lg font-semibold">SailingLoc</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link to="/" className="text-sm font-medium text-gray-600 transition hover:text-navy">Accueil</Link>
          <DecouvrirDropdown />
          <Link to="/inspiration" className="text-sm font-medium text-gray-600 transition hover:text-navy">Inspiration</Link>
          <Link to="/a-propos" className="text-sm font-medium text-gray-600 transition hover:text-navy">À propos</Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/register?role=proprietaire" className="text-sm font-medium text-gray-600 transition hover:text-navy">
            Devenir propriétaire
          </Link>
          <AccountLink />
          <LanguageCurrencyPicker />
        </div>

        <button onClick={() => setMobileOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center text-navy lg:hidden" aria-label="Menu">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {mobileOpen ? <path d="M6 6 L18 18 M18 6 L6 18" /> : <path d="M4 7 H20 M4 12 H20 M4 17 H20" />}
          </svg>
        </button>
      </div>

      <div className="hidden justify-center px-6 pb-5 lg:flex">
        <SearchBar />
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 lg:hidden">
          <SearchBar className="mb-5" />
          <nav className="flex flex-col gap-3">
            {[
              { to: "/", label: "Accueil" },
              { to: "/boats", label: "Louer un bateau" },
              { to: "/inspiration", label: "Inspiration" },
              { to: "/register?role=proprietaire", label: "Devenir propriétaire" },
              { to: "/a-propos", label: "À propos" },
              { to: "/login", label: "Connexion" },
            ].map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setMobileOpen(false)} className="py-1 text-sm font-medium text-gray-700">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
