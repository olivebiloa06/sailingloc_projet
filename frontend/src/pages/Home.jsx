import { Link } from "react-router-dom";
import HorizonDivider from "../components/HorizonDivider";

const STEPS = [
  {
    number: "01",
    title: "Cherche",
    text: "Filtre par destination, dates et type de bateau parmi les annonces de propriétaires partout en France.",
  },
  {
    number: "02",
    title: "Réserve",
    text: "Choisis tes dates, paie en ligne en toute sécurité et reçois la confirmation immédiatement.",
  },
  {
    number: "03",
    title: "Navigue",
    text: "Récupère le bateau auprès du propriétaire (ou avec skipper) et prends le large.",
  },
];

// imageUrl reste vide pour l'instant — quand de vraies photos seront
// disponibles (ex: /images/destinations/la-rochelle.jpg dans public/),
// elles s'afficheront automatiquement à la place du dégradé.
const DESTINATIONS = [
  {
    name: "La Rochelle",
    tagline: "Le berceau de la voile atlantique.",
    imageUrl: null,
  },
  {
    name: "Marseille & les Calanques",
    tagline: "Criques turquoise et mistral au rendez-vous.",
    imageUrl: null,
  },
  {
    name: "Golfe de Saint-Tropez",
    tagline: "Mouillages prisés et soirées en mer.",
    imageUrl: null,
  },
  {
    name: "Golfe du Morbihan",
    tagline: "Plus de 40 îles à explorer au fil de l'eau.",
    imageUrl: null,
  },
  {
    name: "Corse",
    tagline: "Eaux cristallines entre Bonifacio et Porto-Vecchio.",
    imageUrl: null,
  },
  {
    name: "Bassin d'Arcachon",
    tagline: "Voile douce face à la dune du Pilat.",
    imageUrl: null,
  },
];

function BoatMark({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="16" y1="4" x2="16" y2="22" />
      <path d="M16 6 L24 20 L16 20 Z" />
      <path d="M5 24 Q16 30 27 24" />
    </svg>
  );
}

function DestinationCard({ destination }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-navy to-sky">
        {destination.imageUrl ? (
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BoatMark className="h-10 w-10 text-white/40" />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-heading text-base font-semibold text-navy">
          {destination.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{destination.tagline}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy pb-24 pt-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-heading text-4xl font-semibold leading-tight sm:text-5xl">
            Explore le vent autrement.
          </h1>
          <p className="mt-5 text-lg text-white/70">
            Loue un voilier, un catamaran ou un bateau à moteur directement
            auprès d'un particulier — ou mets le tien en location entre deux
            sorties.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register?role=proprietaire"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-cloud"
            >
              Mettre mon bateau en location
            </Link>
          </div>
        </div>

        <HorizonDivider
          fill="var(--color-cloud)"
          className="absolute bottom-0 left-0"
        />
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="bg-cloud py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center font-heading text-2xl font-semibold text-navy sm:text-3xl">
            Comment ça marche
          </h2>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy font-heading text-sm font-semibold text-sable">
                  {step.number}
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP DESTINATIONS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
            Top destinations
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Les côtes les plus recherchées par les locataires SailingLoc.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((destination) => (
              <DestinationCard key={destination.name} destination={destination} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA PROPRIÉTAIRE */}
      <section className="bg-navy py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-heading text-xl font-semibold text-white sm:text-2xl">
              Votre bateau reste à quai plus souvent qu'il ne navigue ?
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Mettez-le en location entre deux sorties et couvrez une partie
              de son entretien.
            </p>
          </div>
          <Link
            to="/register?role=proprietaire"
            className="shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-cloud"
          >
            Devenir propriétaire
          </Link>
        </div>
      </section>
    </div>
  );
}
