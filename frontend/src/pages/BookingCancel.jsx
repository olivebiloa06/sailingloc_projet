import { Link } from "react-router-dom";

export default function BookingCancel() {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-heading text-2xl font-semibold text-navy">
        Paiement annulé
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Aucun montant n'a été débité. Ta réservation reste en attente — tu
        peux réessayer le paiement quand tu veux depuis ton compte.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/boats"
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light"
        >
          Retour à la liste des bateaux
        </Link>
      </div>
    </div>
  );
}
