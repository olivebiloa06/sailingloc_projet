import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HorizonDivider from "../components/HorizonDivider";
import BoatMark from "../components/BoatMark";
import Carousel from "../components/Carousel";
import Reveal from "../components/Reveal";
import PhoneMockup from "../components/PhoneMockup";
import StoreBadges from "../components/StoreBadges";
import api from "../services/api";
import { usePageMeta } from "../hooks/usePageMeta";

// Images hero et destinations depuis les assets locaux
import heroImg from "../assets/pexels-elijahjcobb-35599466.jpg";
import logoImg from "../assets/logo.jpg";
import imgCorse from "../assets/cloe-mondoux-sJr3eNIfZQE-unsplash.jpg";
import imgMorbihan from "../assets/rafael-padeiro-4vyWQxV0PrM-unsplash.jpg";
import imgMarseille from "../assets/pexels-asadphoto-12877369.jpg";
import imgCroatie from "../assets/pexels-dendoktoor-28648190.jpg";
import imgArcachon from "../assets/sulox32-istanbul-2912249_1920.jpg";
import imgVoilier1 from "../assets/bergadder-ship-10038606_1920.jpg";
import imgVoilier2 from "../assets/veverkolog-ship-8308680_1920.jpg";
import appPreviewHome from "../assets/app-preview-home.jpg";

// (HeroSearch supprimé — la barre de recherche est désormais dans le Header)

const EXPERIENCES = [
  { title: "Sortie courte", tagline: "Une demi-journée ou une journée en mer, sans engagement." },
  { title: "Croisière", tagline: "Plusieurs jours à bord, d'escale en escale." },
  { title: "Navigation sportive", tagline: "Voile technique, sensations et vitesse." },
  { title: "Sortie en famille", tagline: "Confort et sécurité pour petits et grands." },
  { title: "Pêche en mer", tagline: "Pars relever les lignes au lever du jour." },
  { title: "Apéro & coucher de soleil", tagline: "Une sortie courte, juste pour le plaisir des yeux." },
  { title: "Avec skipper professionnel", tagline: "Profite de la mer sans te soucier de la navigation." },
  { title: "Sans permis", tagline: "Accessible à tous, aucune qualification requise." },
].map((item, i) => ({ ...item, to: "/boats", tone: i % 2 === 0 ? "bg-navy" : "bg-abysse" }));

const DESTINATIONS = [
  { title: "La Rochelle", query: "La Rochelle", tagline: "Le berceau de la voile atlantique.", coords: "46.16°N 1.15°O", img: imgVoilier1 },
  { title: "Golfe du Morbihan", query: "Morbihan", tagline: "Plus de 40 îles à explorer au fil de l'eau.", coords: "47.58°N 2.75°O", img: imgMorbihan },
  { title: "Côte d'Azur", query: "Côte d'Azur", tagline: "Saint-Tropez, Cannes, Antibes : la Méditerranée chic.", coords: "43.55°N 7.02°E", img: imgCorse },
  { title: "Marseille & les Calanques", query: "Marseille", tagline: "Criques turquoise et mistral au rendez-vous.", coords: "43.30°N 5.37°E", img: imgMarseille },
  { title: "Corse", query: "Corse", tagline: "Eaux cristallines entre Bonifacio et Porto-Vecchio.", coords: "42.04°N 9.01°E", img: imgCorse },
  { title: "Bassin d'Arcachon", query: "Arcachon", tagline: "Voile douce face à la dune du Pilat.", coords: "44.66°N 1.17°O", img: imgArcachon },
  { title: "Îles Baléares", query: "Baléares", tagline: "Majorque, Minorque, Ibiza et Formentera.", coords: "39.57°N 2.65°E", img: imgVoilier2 },
  { title: "Côte amalfitaine", query: "Amalfi", tagline: "Falaises spectaculaires et villages perchés.", coords: "40.63°N 14.60°E", img: imgMorbihan },
  { title: "Croatie", query: "Croatie", tagline: "Plus de 1000 îles dans l'Adriatique.", coords: "43.51°N 16.45°E", img: imgCroatie },
].map((item, i) => ({
  ...item,
  gradient: ["from-navy to-sky", "from-sky to-navy", "from-abysse to-sky"][i % 3],
  to: `/boats?localisation=${encodeURIComponent(item.query)}`,
}));

const BOAT_TYPES = [
  { title: "Voilier", value: "voilier", tagline: "Pour ressentir le vent, à son rythme." },
  { title: "Catamaran", value: "catamaran", tagline: "Stabilité et espace, idéal entre amis." },
  { title: "Bateau à moteur", value: "bateau_moteur", tagline: "Rapide et polyvalent, pour explorer la côte." },
  { title: "Yacht", value: "yacht", tagline: "Confort haut de gamme pour une expérience d'exception." },
  { title: "Semi-rigide", value: "semi_rigide", tagline: "Léger et maniable, parfait pour les criques." },
  { title: "Autre", value: "autre", tagline: "Pédalo, jet-ski, et toutes les autres envies nautiques." },
].map((item) => ({ ...item, to: `/boats?type=${item.value}` }));

function ExperienceCard({ title, tagline, tone, to }) {
  return (
    <Link to={to} className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-[0_2px_10px_rgba(6,27,46,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(6,27,46,0.35)] ${tone}`}>
      <span className="absolute right-4 top-4 h-2 w-2 rounded-full border border-white/30" />
      <span className="h-px w-8 bg-sky/60" />
      <div>
        <h3 className="font-heading text-xl font-semibold leading-snug text-white">{title}</h3>
        <p className="mt-2 text-sm text-white/60">{tagline}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky opacity-0 transition group-hover:opacity-100">Explorer →</span>
    </Link>
  );
}

const BOAT_TYPE_IMAGES = {
  voilier: imgVoilier1,
  catamaran: imgVoilier2,
  bateau_moteur: imgVoilier1,
  yacht: imgVoilier2,
  semi_rigide: imgVoilier1,
  autre: imgVoilier2,
};

function BoatTypeCard({ title, tagline, value, to }) {
  const img = BOAT_TYPE_IMAGES[value] || imgVoilier1;
  return (
    <Link to={to} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_4px_rgba(10,42,67,0.04)] transition duration-300 hover:-translate-y-1 hover:border-sky/40 hover:shadow-[0_8px_20px_-8px_rgba(10,42,67,0.25)]">
      {/* Image du type de bateau */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
        <h3 className="absolute bottom-2 left-3 font-heading text-base font-semibold text-white drop-shadow">
          {title}
        </h3>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-gray-500">{tagline}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-sky opacity-0 transition group-hover:opacity-100">
          Filtrer →
        </span>
      </div>
    </Link>
  );
}

function DestinationCard({ title, tagline, gradient, coords, to, img }) {
  return (
    <Link to={to} className="group relative flex h-full flex-col overflow-hidden rounded-2xl shadow-[0_2px_10px_rgba(10,42,67,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(10,42,67,0.3)]">
      <div className="relative h-40 overflow-hidden">
        {img ? (
          <img src={img} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
        )}
        {/* Overlay dégradé pour lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
        <span className="absolute right-3 top-3 font-mono text-[10px] tracking-wide text-white/60">{coords}</span>
        <h3 className="absolute bottom-3 left-4 font-heading text-lg font-semibold text-white drop-shadow-sm">{title}</h3>
      </div>
      <div className="flex flex-1 flex-col bg-white p-4">
        <p className="text-sm text-gray-500">{tagline}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky opacity-0 transition group-hover:opacity-100">Explorer →</span>
      </div>
    </Link>
  );
}

function Kicker({ children, tone = "text-sky" }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${tone}`}>
      <span className="h-px w-6 bg-current" />
      {children}
    </span>
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
    <div className="relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(10,42,67,0.05)] transition hover:shadow-[0_8px_20px_-10px_rgba(10,42,67,0.2)]">
      <span className="pointer-events-none absolute -right-2 -top-4 font-heading text-7xl text-cloud" aria-hidden="true">"</span>
      <Stars rating={testimonial.rating} />
      <p className="relative mt-3 text-sm leading-relaxed text-gray-600">{testimonial.quote}</p>
      <div className="relative mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-sable">
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
  const [reviews, setReviews] = useState([]);

 // SEO meta tags
  usePageMeta({
    title: "Location de bateaux entre particuliers",
    description: "Louez un voilier, catamaran ou bateau à moteur directement auprès d'un particulier. Paiement sécurisé, contrat automatique, messagerie intégrée.",
    url: "/",
  });

  useEffect(() => {
    // Charge les derniers avis publiés (route publique : la homepage est
    // visible sans être connecté, on ne peut pas taper /admin/reviews ici)
    api.get("/reviews", { params: { limit: 6 } })
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => {});
  }, []);
  return (
    <div>
      {/* HERO — sans barre de recherche (elle est dans le Header) */}
      <section className="relative isolate min-h-[90vh] overflow-hidden">
        {/* Image de fond hero */}
        <img
          src={heroImg}
          alt="SailingLoc hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay navy pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-abysse/80" />
        <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-60" viewBox="0 0 1200 800" preserveAspectRatio="none" fill="none">
          <path className="animate-drift-1" d="M-50 180 Q 250 100, 550 180 T 1250 160" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" />
          <path d="M-50 320 Q 300 260, 600 330 T 1250 310" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" />
          <path className="animate-drift-2" d="M-50 480 Q 280 420, 580 490 T 1250 470" stroke="var(--color-sable)" strokeOpacity="0.12" strokeWidth="1.5" />
          <path d="M-50 620 Q 320 560, 620 630 T 1250 610" stroke="white" strokeOpacity="0.05" strokeWidth="1.5" />
        </svg>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(29,161,242,0.10),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-abysse/70" />

        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-6 pb-20 text-center text-white">
          <span className="animate-fade-up inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-sable">
            <span className="h-px w-6 bg-sable" />SailingLoc<span className="h-px w-6 bg-sable" />
          </span>
          <h1 className="mt-5 animate-fade-up font-heading text-4xl font-semibold tracking-tight leading-tight sm:text-6xl" style={{ animationDelay: "80ms" }}>
            Explore la mer autrement.
          </h1>
          <p className="mt-5 max-w-xl animate-fade-up text-lg text-white/70" style={{ animationDelay: "150ms" }}>
            Loue un voilier, un catamaran ou un bateau à moteur directement auprès d'un particulier, partout en France et au-delà.
          </p>
          <Link
            to="/boats"
            className="mt-10 animate-fade-up rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-navy shadow-lg transition hover:scale-105 hover:bg-cloud"
            style={{ animationDelay: "300ms" }}
          >
            Réserver
          </Link>
        </div>

        <HorizonDivider fill="white" className="absolute bottom-0 left-0 z-[1]" />
      </section>

      {/* EXPÉRIENCE OU NAVIGATION */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <Kicker>Choisis ton style</Kicker>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Expérience ou navigation</h2>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Carousel items={EXPERIENCES} renderItem={(item) => <ExperienceCard {...item} />} />
          </Reveal>
        </div>
      </section>

      {/* TOP DESTINATIONS */}
      <section className="bg-cloud py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <Kicker tone="text-sable">Où larguer les amarres</Kicker>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Top destinations</h2>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Carousel items={DESTINATIONS} renderItem={(item) => <DestinationCard {...item} />} />
          </Reveal>
        </div>
      </section>

      {/* BATEAU */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <Kicker>Trouve ton bateau</Kicker>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Bateau</h2>
            <p className="mt-1 text-sm text-gray-500">Trouve le type de bateau qui correspond à ta sortie.</p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Carousel items={BOAT_TYPES} renderItem={(item) => <BoatTypeCard {...item} />} />
          </Reveal>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="bg-cloud py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <h2 className="text-center font-heading text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Comment ça marche</h2>
          </Reveal>
          <div className="relative mt-12 grid gap-8 sm:grid-cols-2">
            <svg className="pointer-events-none absolute left-1/4 top-9 hidden h-px w-1/2 sm:block" viewBox="0 0 200 2" preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" y1="1" x2="200" y2="1" stroke="var(--color-sable)" strokeWidth="2" />
            </svg>
            <Reveal>
              <Link to="/boats" className="group relative block h-full rounded-2xl bg-white p-7 shadow-[0_2px_10px_rgba(10,42,67,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_-10px_rgba(10,42,67,0.2)]">
                <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-sable bg-navy text-sm font-semibold text-sable">1</span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-navy">Locataire</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">Cherche un bateau par destination et dates, réserve en ligne en quelques clics, et profite de ta sortie en mer — avec ou sans skipper.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky opacity-0 transition group-hover:opacity-100">Trouver un bateau →</span>
              </Link>
            </Reveal>
            <Reveal delay={150}>
              <Link to="/register?role=proprietaire" className="group relative block h-full rounded-2xl bg-white p-7 shadow-[0_2px_10px_rgba(10,42,67,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_-10px_rgba(10,42,67,0.2)]">
                <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-sable bg-navy text-sm font-semibold text-sable">2</span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-navy">Propriétaire</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">Mets ton bateau en location entre deux sorties, fixe tes disponibilités et ton prix, et génère un revenu complémentaire en toute sécurité.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky opacity-0 transition group-hover:opacity-100">Mettre mon bateau en location →</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* AVIS UTILISATEURS */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <Kicker>Ils ont navigué</Kicker>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Avis utilisateurs</h2>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            {reviews.length > 0 ? (
              <Carousel
                items={reviews}
                renderItem={(r) => (
                  <TestimonialCard testimonial={{
                    name: `${r.User?.prenom || ""} ${r.User?.nom?.[0] || ""}.`,
                    role: r.User?.role === "proprietaire" ? "Propriétaire" : "Locataire",
                    rating: r.note,
                    quote: r.commentaire,
                  }} />
                )}
              />
            ) : (
              <Carousel
                items={[
                  { name: "Camille R.", role: "Locataire", rating: 5, quote: "Réservation simple, propriétaire très réactif. Super week-end dans le Golfe du Morbihan." },
                  { name: "Julien P.", role: "Propriétaire", rating: 5, quote: "Mon voilier restait à quai un mois sur deux — maintenant il rapporte au lieu de coûter." },
                  { name: "Inès D.", role: "Locataire", rating: 4, quote: "Premier voilier loué sans skipper, l'équipe a été hyper claire sur les démarches." },
                ]}
                renderItem={(t) => <TestimonialCard testimonial={t} />}
              />
            )}
          </Reveal>
        </div>
      </section>

      {/* APP MOBILE — phase 2 du projet, à venir */}
      <section className="overflow-hidden bg-navy py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <Kicker tone="text-sable">Phase 2 du projet</Kicker>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              L'app mobile SailingLoc arrive bientôt
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Cherche un bateau, échange avec les propriétaires et gère tes réservations
              depuis ton téléphone, où que tu sois. La prochaine étape du projet SailingLoc :
              une application native, disponible sur iOS et Android.
            </p>
            <StoreBadges className="mt-7" />
            <p className="mt-3 text-xs text-white/40">
              En développement — l'application n'est pas encore disponible au téléchargement.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <PhoneMockup src={appPreviewHome} alt="Aperçu de l'application mobile SailingLoc" />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
