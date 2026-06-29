import { Link } from "react-router-dom";

export default function BookingSuccess() {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13 L9 17 L19 7" />
        </svg>
      </div>

      <h1 className="mt-5 font-heading text-2xl font-semibold text-navy">
        Paiement confirmé
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Ta réservation est validée. Tu recevras les coordonnées du
        propriétaire prochainement.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/mon-compte"
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light"
        >
          Voir mon compte
        </Link>
        <Link
          to="/"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:border-navy hover:text-navy"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
