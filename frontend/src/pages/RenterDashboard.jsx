import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { resolveImageUrl } from "../utils/assets";
import BoatMark from "../components/BoatMark";
import InlineAlert from "../components/InlineAlert";

const STATUS_STYLES = {
  en_attente: { label: "En attente", className: "bg-amber-50 text-amber-700" },
  acceptee: { label: "Acceptée — à payer", className: "bg-sky/10 text-sky" },
  confirmee: { label: "Confirmée", className: "bg-green-50 text-green-700" },
  annulee: { label: "Annulée", className: "bg-gray-100 text-gray-500" },
  terminee: { label: "Terminée", className: "bg-gray-100 text-gray-500" },
};

function formatDate(v) {
  return new Date(v).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ statut }) {
  const s = STATUS_STYLES[statut] || STATUS_STYLES.en_attente;
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.className}`}>{s.label}</span>;
}

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/reviews", { bookingId: booking.id, note: rating, commentaire: comment });
      onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de l'avis.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="font-heading text-lg font-semibold text-navy">
          Laisser un avis — {booking.Boat?.nom}
        </h3>
        <div className="mt-4 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <svg viewBox="0 0 20 20" className={`h-7 w-7 ${n <= rating ? "text-sable" : "text-gray-300"}`} fill="currentColor">
                <path d="M10 1.5 L12.5 7 L18.5 7.7 L14 11.8 L15.2 18 L10 14.8 L4.8 18 L6 11.8 L1.5 7.7 L7.5 7 Z" />
              </svg>
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          placeholder="Parle de ton expérience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none"
        />
        <InlineAlert message={error} onDismiss={() => setError("")} className="mt-3" />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="flex-1 rounded-lg bg-navy py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-50"
          >
            {saving ? "Envoi..." : "Publier l'avis"}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-navy hover:text-navy">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RenterDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [contractError, setContractError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/bookings/mes-reservations"),
      api.get("/contracts/my-contracts").catch(() => ({ data: { contracts: [] } })),
    ]).then(([bRes, cRes]) => {
      setBookings(bRes.data.bookings || []);
      setContracts(cRes.data.contracts || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Ouvre l'onglet AVANT l'appel réseau : sinon le délai de l'await casse le
  // lien avec le geste utilisateur et les navigateurs bloquent le popup.
  // L'endpoint renvoie une URL JSON (Cloudinary en prod, fichier local en dev),
  // pas les octets bruts — le responseType "blob" utilisé ici ne marchait
  // qu'en local et cassait silencieusement en production.
  const downloadContract = async (contractId) => {
    setContractError("");
    const tab = window.open("", "_blank", "noopener,noreferrer");
    try {
      const { data } = await api.get(`/contracts/${contractId}/file`);
      if (tab) tab.location.href = data.url;
    } catch {
      tab?.close();
      setContractError("Contrat non disponible pour l'instant.");
    }
  };

  // Navigue d'abord, déconnecte ensuite : sinon setUser(null) fait re-rendre
  // ProtectedRoute (encore monté sur /mon-compte à ce moment-là) avant que ce
  // navigate("/") ait fini de s'appliquer, et son propre <Navigate to="/login">
  // gagne la course — l'utilisateur atterrissait sur /login au lieu de /.
  const handleLogout = async () => { navigate("/", { replace: true }); await logout(); };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={() => { setReviewBooking(null); load(); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-navy">
            Bonjour, {user?.prenom} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">Locataire · {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-navy hover:text-navy">
          Se déconnecter
        </button>
      </div>

      <InlineAlert message={contractError} onDismiss={() => setContractError("")} className="mt-6" />

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-navy">Mes réservations</h2>
        {loading && <p className="mt-4 text-sm text-gray-500">Chargement...</p>}
        {!loading && bookings.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            Aucune réservation.{" "}
            <Link to="/boats" className="font-medium text-sky">Trouver un bateau →</Link>
          </p>
        )}

        <div className="mt-4 space-y-3">
          {bookings.map((b) => {
            const boat = b.Boat;
            const img = resolveImageUrl(boat?.imageUrl);
            const contract = contracts.find((c) => c.bookingId === b.id);
            const canReview = b.statut === "confirmee" || b.statut === "terminee";

            return (
              <div key={b.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-navy to-sky">
                  {img ? <img src={img} alt={boat?.nom} className="h-full w-full object-cover" /> : (
                    <div className="flex h-full items-center justify-center"><BoatMark className="h-6 w-6 text-white/40" /></div>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading text-sm font-semibold text-navy">{boat?.nom}</p>
                    <StatusBadge statut={b.statut} />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{formatDate(b.dateDebut)} → {formatDate(b.dateFin)}</p>
                  <p className="mt-0.5 text-xs font-semibold text-navy">{b.montantTotal} €</p>
                  <div className="mt-2 flex gap-2">
                    {b.statut === "acceptee" && (
                      <Link to={`/reservations/${b.id}`} className="rounded-lg bg-navy px-3 py-1 text-xs font-semibold text-white hover:bg-navy-light">
                        Payer maintenant
                      </Link>
                    )}
                    {contract && (
                      <button type="button" onClick={() => downloadContract(contract.id)} className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-navy hover:border-navy">
                        Contrat PDF
                      </button>
                    )}
                    {canReview && (
                      <button type="button" onClick={() => setReviewBooking(b)} className="rounded-lg border border-sable px-3 py-1 text-xs font-semibold text-sable hover:bg-sable/10">
                        Laisser un avis
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
