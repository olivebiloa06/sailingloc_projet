import { Link } from "react-router-dom";
import HorizonDivider from "../components/HorizonDivider";
import BoatMark from "../components/BoatMark";
import Carousel from "../components/Carousel";
import Reveal from "../components/Reveal";

// Pas de filtre "type d'expérience" côté backend pour l'instant : ces cartes
// renvoient vers /boats en général (encourager l'exploration), pas vers un
// filtre précis. À connecter le jour où ce critère existera côté Boat.
const EXPERIENCES = [
  { title: "Sortie courte", tagline: "Une demi-journée ou une journée en mer, sans engagement.", gradient: "from-navy to-sky" },
  { title: "Croisière", tagline: "Plusieurs jours à bord, d'escale en escale.", gradient: "from-sky to-navy" },
  { title: "Navigation sportive", tagline: "Voile technique, sensations et vitesse.", gradient: "from-abysse to-sky" },
  { title: "Sortie en famille", tagline: "Confort et sécurité pour petits et grands.", gradient: "from-navy to-abysse" },
  { title: "Pêche en mer", tagline: "Pars relever les lignes au lever du jour.", gradient: "from-sky to-abysse" },
  { title: "Apéro & coucher de soleil", tagline: "Une sortie courte, juste pour le plaisir des yeux.", gradient: "from-navy to-sky" },
  { title: "Avec skipper professionnel", tagline: "Profite de la mer sans te soucier de la navigation.", gradient: "from-abysse to-navy" },
  { title: "Sans permis", tagline: "Accessible à tous, aucune qualification requise.", gradient: "from-sky to-navy" },
].map((item) => ({ ...item, to: "/boats" }));

// Destinations réelles — chaque carte filtre vraiment /boats par localisation
// (le champ "localisation" existe et est cherché côté backend). Tant qu'il y
// a peu d'annonces, certaines destinations renverront une liste vide : c'est
// normal sur un marketplace qui démarre, pas un bug.
const DESTINATIONS = [
  { title: "La Rochelle", query: "La Rochelle", tagline: "Le berceau de la voile atlantique." },
  { title: "Golfe du Morbihan", query: "Morbihan", tagline: "Plus de 40 îles à explorer au fil de l'eau." },
  { title: "Côte d'Azur", query: "Côte d'Azur", tagline: "Saint-Tropez, Cannes, Antibes : la Méditerranée chic." },
  { title: "Marseille & les Calanques", query: "Marseille", tagline: "Criques turquoise et mistral au rendez-vous." },
  { title: "Corse", query: "Corse", tagline: "Eaux cristallines entre Bonifacio et Porto-Vecchio." },
  { title: "Bassin d'Arcachon", query: "Arcachon", tagline: "Voile douce face à la dune du Pilat." },
  { title: "Îles Baléares", query: "Baléares", tagline: "Majorque, Minorque, Ibiza et Formentera." },
  { title: "Côte amalfitaine", query: "Amalfi", tagline: "Falaises spectaculaires et villages perchés." },
  { title: "Croatie", query: "Croatie", tagline: "Plus de 1000 îles dans l'Adriatique." },
].map((item, i) => ({
  ...item,
  gradient: ["from-navy to-sky", "from-sky to-navy", "from-abysse to-sky"][i % 3],
  // On filtre sur un mot-clé court et réaliste (query), pas sur le titre
  // marketing affiché (title) : un vrai propriétaire ne tape jamais
  // "Marseille & les Calanques" dans son champ localisation, juste
  // "Marseille". Le script de seed (seed.js) utilise ces mêmes mots-clés.
  to: `/boats?localisation=${encodeURIComponent(item.query)}`,
}));

// Types de bateau — repris EXACTEMENT des valeurs acceptées par le backend
// (Boat.type), donc ces cartes sont des filtres réels, pas du décoratif.
const BOAT_TYPES = [
  { title: "Voilier", value: "voilier", tagline: "Pour ressentir le vent, à son rythme." },
  { title: "Catamaran", value: "catamaran", tagline: "Stabilité et espace, idéal entre amis." },
  { title: "Bateau à moteur", value: "bateau_moteur", tagline: "Rapide et polyvalent, pour explorer la côte." },
  { title: "Yacht", value: "yacht", tagline: "Confort haut de gamme pour une expérience d'exception." },
  { title: "Semi-rigide", value: "semi_rigide", tagline: "Léger et maniable, parfait pour les criques." },
  { title: "Autre", value: "autre", tagline: "Pédalo, jet-ski, et toutes les autres envies nautiques." },
].map((item, i) => ({
  ...item,
  gradient: ["from-navy to-sky", "from-sky to-navy", "from-abysse to-sky"][i % 3],
  to: `/boats?type=${item.value}`,
}));

const TESTIMONIALS = [
  { name: "Camille R.", role: "Locataire", rating: 5, quote: "Réservation simple, propriétaire très réactif. Super week-end dans le Golfe du Morbihan." },
  { name: "Julien P.", role: "Propriétaire", rating: 5, quote: "Mon voilier restait à quai un mois sur deux — maintenant il rapporte au lieu de coûter." },
  { name: "Inès D.", role: "Locataire", rating: 4, quote: "Premier voilier loué sans skipper, l'équipe a été hyper claire sur les démarches." },
];

function ThemeCard({ title, tagline, gradient, to }) {
  return (
    <Link
      to={to}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${gradient}`}>
        <BoatMark className="h-9 w-9 text-white/40" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-semibold text-navy">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{tagline}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky opacity-0 transition group-hover:opacity-100">
          Explorer →
        </span>
      </div>
    </Link>
  );
}

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-sable">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={i < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1">
          <path d="M10 1.5 L12.5 7 L18.5 7.7 L14 11.8 L15.2 18 L10 14.8 L4.8 18 L6 11.8 L1.5 7.7 L7.5 7 Z" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <Stars rating={testimonial.rating} />
      <p className="mt-3 text-sm leading-relaxed text-gray-600">« {testimonial.quote} »</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-navy to-sky text-xs font-semibold text-white">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-navy">{testimonial.name}</p>
          <p className="text-xs text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-navy">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky/30 blur-3xl animate-drift-1" />
        <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-sable/20 blur-3xl animate-drift-2" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky/10 blur-3xl animate-drift-1" />

        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="animate-fade-up font-heading text-4xl font-semibold leading-tight sm:text-6xl">
            Explore la mer autrement.
          </h1>
          <p className="mt-5 animate-fade-up text-lg text-white/70" style={{ animationDelay: "150ms" }}>
            Loue un voilier, un catamaran ou un bateau à moteur directement
            auprès d'un particulier, partout en France et au-delà.
          </p>
          <Link
            to="/boats"
            className="mt-8 animate-fade-up rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-navy shadow-lg transition hover:scale-105 hover:bg-cloud"
            style={{ animationDelay: "300ms" }}
          >
            Réserver
          </Link>
        </div>

        <HorizonDivider fill="var(--color-cloud)" className="absolute bottom-0 left-0" />

        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/50">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9 L12 15 L18 9" />
          </svg>
        </div>
      </section>

      {/* EXPÉRIENCE OU NAVIGATION */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
              Expérience ou navigation
            </h2>
          </Reveal>
          <Reveal delay={100} className="mt-8">
            <Carousel items={EXPERIENCES} renderItem={(item) => <ThemeCard {...item} />} />
          </Reveal>
        </div>
      </section>

      {/* TOP DESTINATIONS */}
      <section className="bg-cloud py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
              Top destinations
            </h2>
          </Reveal>
          <Reveal delay={100} className="mt-8">
            <Carousel items={DESTINATIONS} renderItem={(item) => <ThemeCard {...item} />} />
          </Reveal>
        </div>
      </section>

      {/* BATEAU — navigation par type de bateau, branché sur le vrai filtre */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
              Bateau
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Trouve le type de bateau qui correspond à ta sortie.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-8">
            <Carousel items={BOAT_TYPES} renderItem={(item) => <ThemeCard {...item} />} />
          </Reveal>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE — désormais cliquable */}
      <section id="comment-ca-marche" className="bg-cloud py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <h2 className="text-center font-heading text-2xl font-semibold text-navy sm:text-3xl">
              Comment ça marche
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <Reveal>
              <Link
                to="/boats"
                className="group block h-full rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-sable">
                  1
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-navy">
                  Locataire
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Cherche un bateau par destination et dates, réserve en ligne
                  en quelques clics, et profite de ta sortie en mer — avec ou
                  sans skipper.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky opacity-0 transition group-hover:opacity-100">
                  Trouver un bateau →
                </span>
              </Link>
            </Reveal>

            <Reveal delay={150}>
              <Link
                to="/register?role=proprietaire"
                className="group block h-full rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-sable">
                  2
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-navy">
                  Propriétaire
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Mets ton bateau en location entre deux sorties, fixe tes
                  disponibilités et ton prix, et génère un revenu
                  complémentaire en toute sécurité.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky opacity-0 transition group-hover:opacity-100">
                  Mettre mon bateau en location →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* AVIS UTILISATEURS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
              Avis utilisateurs
            </h2>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Carousel items={TESTIMONIALS} renderItem={(t) => <TestimonialCard testimonial={t} />} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
