import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-2xl font-semibold text-navy">
        Cette page arrive bientôt
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        On y travaille encore. En attendant, retourne explorer les bateaux
        disponibles.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
