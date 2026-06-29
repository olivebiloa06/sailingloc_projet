import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const STATUS_STYLES = {
  en_attente: { label: "Demande en attente", className: "bg-amber-50 text-amber-700" },
  acceptee: { label: "Acceptée — paiement en attente", className: "bg-sky/10 text-sky" },
  confirmee: { label: "Confirmée et payée", className: "bg-green-50 text-green-700" },
  annulee: { label: "Refusée / annulée", className: "bg-gray-100 text-gray-500" },
  terminee: { label: "Terminée", className: "bg-gray-100 text-gray-500" },
};

const PAYMENT_METHOD_LABELS = {
  stripe: "Carte bancaire (Stripe)",
  paypal: "PayPal",
  carte_bancaire: "Carte bancaire",
  manuel: "Encaissement manuel",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ statut }) {
  const style = STATUS_STYLES[statut] || STATUS_STYLES.en_attente;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.className}`}>
      {style.label}
    </span>
  );
}

// Affiche ce qu'on sait vraiment du paiement — c'est cette section qui
// remplace le besoin d'aller vérifier en base ou via Postman.
function PaymentInfo({ payment }) {
  if (!payment) {
    return <p className="mt-2 text-xs text-gray-400">Aucun paiement enregistré pour l'instant.</p>;
  }

  return (
    <div className="mt-2 rounded-lg bg-cloud px-3 py-2 text-xs text-gray-600">
      <p>
        <span className="font-medium text-navy">Paiement :</span>{" "}
        {PAYMENT_METHOD_LABELS[payment.methode] || payment.methode} — {payment.statut}
      </p>
      {payment.referenceTransaction && (
        <p className="mt-1 text-gray-400">Référence : {payment.referenceTransaction}</p>
      )}
      {payment.datePaiement && (
        <p className="mt-1 text-gray-400">Payé le {formatDateTime(payment.datePaiement)}</p>
      )}
    </div>
  );
}

export default function OwnerRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [respondingId, setRespondingId] = useState(null);

  const loadBookings = useCallback(() => {
    setLoading(true);
    api
      .get("/bookings/owner/demandes")
      .then((res) => setBookings(res.data.bookings || []))
      .catch(() => setLoadError("Impossible de charger les demandes de réservation."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const respond = async (id, action) => {
    setRespondingId(id);
    setActionError("");
    try {
      await api.put(`/bookings/${id}/repondre`, { action });
      loadBookings();
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Une erreur est survenue, réessaie."
      );
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-navy">
            Demandes de réservation
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Toutes les demandes reçues sur tes bateaux, et leur état de paiement.
          </p>
        </div>
        <button
          type="button"
          onClick={loadBookings}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-navy"
        >
          ↻ Rafraîchir
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}

      {loadError && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {actionError && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {!loading && !loadError && bookings.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          Aucune demande pour l'instant.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {bookings.map((booking) => {
          const boat = booking.Boat;
          const renter = booking.User;
          const isPending = booking.statut === "en_attente";

          return (
            <div
              key={booking.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-semibold text-navy">
                    {boat?.nom || "Bateau"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {renter?.prenom} {renter?.nom} · {renter?.email}
                  </p>
                </div>
                <StatusBadge statut={booking.statut} />
              </div>

              <p className="mt-3 text-sm text-gray-600">
                Du {formatDate(booking.dateDebut)} au {formatDate(booking.dateFin)} ·{" "}
                {booking.nombrePersonnes} pers. · {booking.montantTotal} €
              </p>

              <PaymentInfo payment={booking.Payment} />

              {isPending && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={respondingId === booking.id}
                    onClick={() => respond(booking.id, "accepter")}
                    className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-light disabled:opacity-50"
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    disabled={respondingId === booking.id}
                    onClick={() => respond(booking.id, "refuser")}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-400 disabled:opacity-50"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
