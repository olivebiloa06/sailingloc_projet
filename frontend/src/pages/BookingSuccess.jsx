import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function formatDate(v) {
  return new Date(v).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      // Pas de session_id (ex: PayPal) — charge la dernière réservation confirmée
      api.get("/bookings/mes-reservations")
        .then(({ data }) => {
          const confirmed = (data.bookings || []).filter((b) => b.statut === "confirmee");
          if (confirmed.length > 0) setBooking(confirmed[0]);
        })
        .catch(() => setError("Impossible de charger ta réservation."))
        .finally(() => setLoading(false));
      return;
    }

    // Appelle l'endpoint de confirmation — s'il n'est pas encore confirmé par le
    // webhook, cette route le confirme maintenant, génère le contrat et envoie
    // les emails. Si déjà confirmé, renvoie juste les données.
    api.get(`/payments/stripe/confirm/${sessionId}`)
      .then(({ data }) => {
        setBooking(data.booking);
        setContract(data.contract || null);
      })
      .catch(() => {
        // Fallback : webhook peut-être déjà passé, on charge les réservations
        api.get("/bookings/mes-reservations")
          .then(({ data }) => {
            const confirmed = (data.bookings || []).filter((b) => b.statut === "confirmee");
            if (confirmed.length > 0) setBooking(confirmed[0]);
          })
          .catch(() => setError("Impossible de charger ta réservation."));
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const downloadContract = async () => {
    if (!contract) return;
    try {
      const res = await api.get(`/contracts/${contract.id}/file`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch {
      alert("Contrat en cours de génération, réessaie dans quelques instants.");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13 L9 17 L19 7" />
        </svg>
      </div>

      <h1 className="mt-5 font-heading text-2xl font-semibold text-navy">
        Paiement confirmé !
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Ta réservation est validée. Un email de confirmation
        {contract ? " avec le contrat PDF a été envoyé" : " a été envoyé"} à ton adresse.
      </p>

      {loading && <p className="mt-6 text-sm text-gray-400">Chargement...</p>}

      {error && (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      )}

      {!loading && booking && (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm">
          <h2 className="font-heading text-sm font-semibold text-navy">Récapitulatif</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Bateau</span>
              <span className="font-medium text-navy">{booking.Boat?.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Localisation</span>
              <span className="text-gray-700">{booking.Boat?.localisation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Arrivée</span>
              <span className="text-gray-700">{formatDate(booking.dateDebut)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Départ</span>
              <span className="text-gray-700">{formatDate(booking.dateFin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Voyageurs</span>
              <span className="text-gray-700">{booking.nombrePersonnes}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="font-semibold text-navy">Total payé</span>
              <span className="font-semibold text-navy">{booking.montantTotal} €</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/mes-reservations" className="rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-light">
          Voir mes réservations
        </Link>

        {contract && (
          <button type="button" onClick={downloadContract} className="rounded-xl border border-navy px-6 py-3 text-sm font-semibold text-navy transition hover:bg-cloud">
            📄 Télécharger le contrat
          </button>
        )}

        <Link to="/" className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-600 transition hover:border-navy hover:text-navy">
          Retour à l'accueil
        </Link>
      </div>

      {!contract && !loading && (
        <p className="mt-4 text-xs text-gray-400">
          Ton contrat sera disponible dans "Mes réservations" après sa génération.
        </p>
      )}
    </div>
  );
}
