import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";
import LanguageCurrencyPicker from "./LanguageCurrencyPicker";
import BoatMark from "./BoatMark";
import logoImg from "../assets/logo.jpg";
import {
  AnchorIcon,
  CatamaranIcon,
  SpeedboatIcon,
  WheelIcon,
  IslandIcon,
  SunIcon,
  MapPinIcon,
  IslandsIcon,
  WavesIcon,
  MegaphoneIcon,
  ClipboardIcon,
  CompassIcon,
  InfoIcon,
} from "./DiscoverIcons";
import { UserIcon, CalendarIcon, ChatIcon, ShieldIcon, LogoutIcon } from "./AccountIcons";
import { usePublishBoatLink } from "../hooks/usePublishBoatLink";


const getDecouvrirMenu = (publishBoatLink) => [
  {
    section: "Louer un bateau",
    items: [
      { to: "/boats", label: "Tous les bateaux", icon: AnchorIcon, desc: "Explorer toutes les annonces disponibles" },
      { to: "/boats?type=voilier", label: "Voiliers", icon: BoatMark, desc: "Navigation à la voile, avec ou sans skipper" },
      { to: "/boats?type=catamaran", label: "Catamarans", icon: CatamaranIcon, desc: "Stabilité et confort pour toute la famille" },
      { to: "/boats?type=bateau_moteur", label: "Bateaux à moteur", icon: SpeedboatIcon, desc: "Rapides et polyvalents" },
      { to: "/boats?avecSkipper=true", label: "Avec skipper", icon: WheelIcon, desc: "Profitez sans vous soucier de la navigation" },
    ],
  },
  {
    section: "Top destinations",
    items: [
      { to: "/boats?localisation=Corse", label: "Corse", icon: IslandIcon, desc: "Eaux cristallines, criques sauvages" },
      { to: "/boats?localisation=C%C3%B4te%20d'Azur", label: "Côte d'Azur", icon: SunIcon, desc: "Saint-Tropez, Cannes, Nice" },
      { to: "/boats?localisation=Morbihan", label: "Golfe du Morbihan", icon: MapPinIcon, desc: "40 îles à explorer" },
      { to: "/boats?localisation=Croatie", label: "Croatie", icon: IslandsIcon, desc: "1000 îles dans l'Adriatique" },
      { to: "/boats?localisation=Baleares", label: "Baléares", icon: WavesIcon, desc: "Majorque, Ibiza, Formentera" },
    ],
  },
  {
    section: "Pour les propriétaires",
    items: [
      { to: publishBoatLink, label: "Mettre mon bateau en location", icon: MegaphoneIcon, desc: "Publie ton annonce gratuitement" },
      { to: "/mon-compte", label: "Gérer mes annonces", icon: ClipboardIcon, desc: "Disponibilités, réservations, revenus" },
    ],
  },
  {
    section: "Découverte & guides",
    items: [
      { to: "/inspiration", label: "Inspiration", icon: CompassIcon, desc: "Actualités nautiques & guides de voyage" },
      { to: "/a-propos", label: "À propos de SailingLoc", icon: InfoIcon, desc: "Notre mission, notre équipe" },
    ],
  },
];

function DecouvrirDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const publishBoatLink = usePublishBoatLink();
  const decouvrirMenu = getDecouvrirMenu(publishBoatLink);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="decouvrir-menu"
        className={`flex items-center gap-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2 rounded ${open ? "text-navy" : "text-gray-600 hover:text-navy"}`}
      >
        Découvrir
        <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="currentColor" aria-hidden="true" focusable="false">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          id="decouvrir-menu"
          role="region"
          aria-label="Menu Découvrir"
          className="absolute left-0 top-full z-50 mt-3 w-[680px] -translate-x-1/4 rounded-2xl border border-gray-100 bg-white shadow-2xl"
        >
          <div className="grid grid-cols-2 gap-0 p-4">
            {decouvrirMenu.map((group) => (
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
                      className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-cloud focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-1"
                    >
                      <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-sky" />
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    // replace: true — la page protégée où l'utilisateur se trouvait ne doit
    // plus être accessible via le bouton "précédent" du navigateur une fois
    // déconnecté (sécurité). Voir aussi le garde-fou dans ProtectedRoute :
    // si l'historique remonte quand même plus loin sur une autre page
    // protégée, elle renvoie vers /login plutôt que d'afficher son contenu.
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-navy transition hover:border-navy hover:bg-cloud focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Connexion
      </Link>
    );
  }

  const initials = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();
  const roleColors = {
    admin: "bg-sky text-white",
    proprietaire: "bg-navy text-white",
    locataire: "bg-sable text-white",
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Menu du compte de ${user.prenom} ${user.nom}`}
        className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 transition hover:border-navy hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2"
      >
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${roleColors[user.role] || "bg-navy text-white"}`}
          aria-hidden="true"
        >
          {initials}
        </div>
        <span className="text-sm font-medium text-navy">{user.prenom}</span>
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-gray-400" fill="currentColor" aria-hidden="true" focusable="false">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu du compte"
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-navy">{user.prenom} {user.nom}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${roleColors[user.role] || "bg-navy text-white"}`}>
              {user.role}
            </span>
          </div>
          <div className="p-2">
            {[
              { to: "/mon-compte", label: "Mon compte", icon: UserIcon, show: true },
              { to: "/mes-bateaux", label: "Mes bateaux", icon: BoatMark, show: user.role === "proprietaire" },
              { to: "/mes-reservations", label: "Mes réservations", icon: CalendarIcon, show: user.role !== "admin" },
              { to: "/mes-messages", label: "Messages", icon: ChatIcon, show: true },
              { to: "/admin/documents", label: "Administration", icon: ShieldIcon, show: user.role === "admin", className: "text-sky" },
            ].filter((l) => l.show).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-cloud focus:outline-none focus:ring-2 focus:ring-sky ${l.className || "text-gray-700"}`}
              >
                <l.icon className="h-4 w-4 shrink-0" />
                {l.label}
              </Link>
            ))}

            <div className="my-1 border-t border-gray-100" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-cloud focus:outline-none focus:ring-2 focus:ring-sky"
            >
              <LogoutIcon className="h-4 w-4 shrink-0" />
              Déconnexion
            </button>
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
      role="search"
      aria-label="Rechercher un bateau"
      className={`flex w-full max-w-2xl items-stretch overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <label className="flex flex-1 flex-col px-5 py-2 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Destination</span>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Où navigues-tu ?"
          aria-label="Destination"
          className="bg-transparent text-sm text-navy placeholder:text-gray-400 focus:outline-none"
        />
      </label>
      <div className="w-px self-stretch bg-gray-200" aria-hidden="true" />
      <label className="flex flex-1 flex-col px-5 py-2 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Date de départ"
          className="bg-transparent text-sm text-navy focus:outline-none"
        />
      </label>
      <div className="w-px self-stretch bg-gray-200" aria-hidden="true" />
      <label className="flex flex-1 flex-col px-5 py-2 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Personnes</span>
        <input
          type="number"
          min="1"
          value={personnes}
          onChange={(e) => setPersonnes(e.target.value)}
          placeholder="Combien ?"
          aria-label="Nombre de personnes"
          className="bg-transparent text-sm text-navy placeholder:text-gray-400 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        aria-label="Lancer la recherche"
        className="flex items-center justify-center rounded-r-full bg-navy px-5 text-white transition hover:bg-navy-light focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // L'admin gère la plateforme, il n'a rien à faire des outils de recherche
  // et de découverte destinés aux locataires/propriétaires (filtres
  // destination/date, menu Découvrir, pages marketing...).
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMobileLogout = async () => {
    setMobileOpen(false);
    await logout();
    // replace: true — voir le commentaire équivalent dans AccountLink.handleLogout.
    navigate("/", { replace: true });
  };

  // Miroir de AccountLink (menu desktop) : mêmes liens selon le rôle, pour
  // que le menu mobile reflète lui aussi l'état de connexion au lieu de
  // toujours afficher "Connexion" comme si personne n'était authentifié.
  const mobileAccountLinks = user
    ? [
        { to: "/mon-compte", label: "Mon compte", icon: UserIcon },
        ...(user.role === "proprietaire" ? [{ to: "/mes-bateaux", label: "Mes bateaux", icon: BoatMark }] : []),
        ...(user.role !== "admin" ? [{ to: "/mes-reservations", label: "Mes réservations", icon: CalendarIcon }] : []),
        { to: "/mes-messages", label: "Messages", icon: ChatIcon },
        ...(user.role === "admin" ? [{ to: "/admin/documents", label: "Administration", icon: ShieldIcon }] : []),
      ]
    : [{ to: "/login", label: "Connexion", icon: UserIcon }];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? "shadow-sm" : ""}`}
      role="banner"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-navy focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2 rounded"
          aria-label="SailingLoc — Retour à l'accueil"
        >
          <img
            src={logoImg}
            alt=""
            aria-hidden="true"
            className="h-10 w-10 rounded-full object-cover shadow-sm"
          />
          <span className="font-heading text-lg font-semibold">SailingLoc</span>
        </Link>

        {/* Navigation principale */}
        <nav aria-label="Navigation principale" className="hidden items-center gap-6 lg:flex">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 transition hover:text-navy focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2 rounded"
          >
            Accueil
          </Link>
          {!isAdmin && (
            <>
              <DecouvrirDropdown />
              <Link
                to="/inspiration"
                className="text-sm font-medium text-gray-600 transition hover:text-navy focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2 rounded"
              >
                Inspiration
              </Link>
              <Link
                to="/a-propos"
                className="text-sm font-medium text-gray-600 transition hover:text-navy focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2 rounded"
              >
                À propos
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user?.role !== "proprietaire" && !isAdmin && (
            <Link
              to="/register?role=proprietaire"
              className="text-sm font-medium text-gray-600 transition hover:text-navy focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2 rounded"
            >
              Devenir propriétaire
            </Link>
          )}
          <AccountLink />
          <LanguageCurrencyPicker />
        </div>

        {/* Bouton menu mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="flex h-9 w-9 items-center justify-center text-navy lg:hidden focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2 rounded"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false">
            {mobileOpen ? <path d="M6 6 L18 18 M18 6 L6 18" /> : <path d="M4 7 H20 M4 12 H20 M4 17 H20" />}
          </svg>
        </button>
      </div>

      {/* Barre de recherche desktop — masquée pour l'admin, non concerné */}
      {!isAdmin && (
        <div className="hidden justify-center px-6 pb-5 lg:flex" aria-hidden="false">
          <SearchBar />
        </div>
      )}

      {/* Menu mobile */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="border-t border-gray-100 bg-white px-6 py-4 lg:hidden"
        >
          {!isAdmin && <SearchBar className="mb-5" />}
          <nav aria-label="Navigation mobile" className="flex flex-col gap-3">
            {[
              { to: "/", label: "Accueil" },
              ...(!isAdmin
                ? [
                    { to: "/boats", label: "Louer un bateau" },
                    { to: "/inspiration", label: "Inspiration" },
                    ...(user?.role !== "proprietaire"
                      ? [{ to: "/register?role=proprietaire", label: "Devenir propriétaire" }]
                      : []),
                    { to: "/a-propos", label: "À propos" },
                  ]
                : []),
            ].map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="py-1 text-sm font-medium text-gray-700 hover:text-navy focus:outline-none focus:ring-2 focus:ring-sky rounded"
              >
                {l.label}
              </Link>
            ))}

            <div className="my-1 border-t border-gray-100" />

            {user && (
              <p className="py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {user.prenom} {user.nom} · {user.role}
              </p>
            )}

            {mobileAccountLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 py-1 text-sm font-medium text-gray-700 hover:text-navy focus:outline-none focus:ring-2 focus:ring-sky rounded"
              >
                <l.icon className="h-4 w-4 shrink-0" />
                {l.label}
              </Link>
            ))}

            {user && (
              <button
                type="button"
                onClick={handleMobileLogout}
                className="flex items-center gap-2.5 py-1 text-left text-sm font-medium text-gray-700 hover:text-navy focus:outline-none focus:ring-2 focus:ring-sky rounded"
              >
                <LogoutIcon className="h-4 w-4 shrink-0" />
                Déconnexion
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
