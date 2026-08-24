import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { resolveImageUrl } from "../utils/assets";
import InlineAlert from "../components/InlineAlert";

const STATUS_STYLES = {
  en_attente: { label: "En attente de réponse du propriétaire", className: "bg-amber-50 text-amber-700" },
  acceptee: { label: "Acceptée — paiement à finaliser", className: "bg-sky/10 text-sky" },
  confirmee: { label: "Confirmée et payée", className: "bg-green-50 text-green-700" },
  annulee: { label: "Annulée", className: "bg-gray-100 text-gray-500" },
  terminee: { label: "Terminée", className: "bg-gray-100 text-gray-500" },
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
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

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contractError, setContractError] = useState("");

  useEffect(() => {
    let isMounted = true;
    api.get("/bookings/mes-reservations")
      .then((res) => { if (isMounted) setBookings(res.data.bookings || []); })
      .catch(() => { if (isMounted) setError("Impossible de charger tes réservations."); })
      .finally(() => { if (isMounted) setLoading(false); });

    api.get("/contracts/my-contracts")
      .then((res) => { if (isMounted) setContracts(res.data.contracts || []); })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Ouvre l'onglet AVANT l'appel réseau : sinon le délai de l'await casse le
  // lien avec le geste utilisateur et les navigateurs bloquent le popup.
  const downloadContract = async (contract) => {
    setContractError("");
    const tab = window.open("", "_blank", "noopener,noreferrer");
    try {
      const { data } = await api.get(`/contracts/${contract.id}/file`);
      if (tab) tab.location.href = data.url;
    } catch {
      tab?.close();
      setContractError("Contrat indisponible.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-heading text-2xl font-semibold text-navy">Mes réservations</h1>

      {loading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}
      <InlineAlert message={error} className="mt-6" />
      <InlineAlert message={contractError} onDismiss={() => setContractError("")} className="mt-6" />

      {!loading && !error && bookings.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          Tu n'as pas encore de réservation.{" "}
          <Link to="/boats" className="font-medium text-sky">Trouver un bateau</Link>
        </p>
      )}

      <div className="mt-6 space-y-4">
        {bookings.map((booking) => {
          const boat = booking.Boat;
          const image = resolveImageUrl(boat?.imageUrl);
          const needsPayment = booking.statut === "acceptee";
          const contract = contracts.find((c) => c.bookingId === booking.id);

          return (
            <div key={booking.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-navy to-sky">
                {image && <img src={image} alt={boat?.nom} className="h-full w-full object-cover" />}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-base font-semibold text-navy">{boat?.nom || "Bateau"}</h3>
                  <StatusBadge statut={booking.statut} />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Du {formatDate(booking.dateDebut)} au {formatDate(booking.dateFin)}
                </p>
                <p className="mt-1 text-sm font-medium text-navy">{booking.montantTotal} €</p>

                <div className="mt-3 flex gap-2">
                  {needsPayment && (
                    <Link to={`/reservations/${booking.id}`}
                      className="inline-flex w-fit items-center rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-light">
                      Payer maintenant
                    </Link>
                  )}

                  {booking.statut === "confirmee" && (
                    contract ? (
                      <button type="button" onClick={() => downloadContract(contract)}
                        className="inline-flex w-fit items-center rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-navy transition hover:border-navy">
                        📄 Télécharger le contrat
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Contrat en cours de génération...</span>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
