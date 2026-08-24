import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import InlineAlert from "../components/InlineAlert";

const DOC_TYPES = [
  { value: "piece_identite", label: "Pièce d'identité" },
  { value: "permis", label: "Permis bateau" },
  { value: "assurance", label: "Assurance" },
  { value: "autre", label: "CV nautique / autre" },
];

const STATUS_LABELS = {
  en_attente: { label: "En attente de validation", className: "text-amber-600" },
  valide: { label: "Validé ✓", className: "text-green-600" },
  refuse: { label: "Refusé", className: "text-red-600" },
};

function formatDate(v) {
  return new Date(v).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondError, setRespondError] = useState("");

  // Upload doc état
  const [docForm, setDocForm] = useState({ nom: "", type: "piece_identite" });
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [docError, setDocError] = useState("");

  const loadDocs = () => {
    api.get("/documents/my-documents")
      .then((r) => setDocuments(r.data.documents || []))
      .catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/bookings/owner/demandes"),
      api.get("/documents/my-documents").catch(() => ({ data: { documents: [] } })),
    ]).then(([bRes, dRes]) => {
      setBookings(bRes.data.bookings || []);
      setDocuments(dRes.data.documents || []);
    }).finally(() => setLoading(false));
  }, []);

  // Revenus calculés côté frontend sur les réservations confirmées
  const confirmedBookings = bookings.filter((b) => b.statut === "confirmee");
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.montantTotal - b.commission), 0);
  const totalCommission = confirmedBookings.reduce((sum, b) => sum + b.commission, 0);

  const respond = async (id, action) => {
    setRespondError("");
    try {
      await api.put(`/bookings/${id}/repondre`, { action });
      const r = await api.get("/bookings/owner/demandes");
      setBookings(r.data.bookings || []);
    } catch (err) {
      setRespondError(err.response?.data?.message || "Erreur.");
    }
  };

  const uploadDoc = async (e) => {
    e.preventDefault();
    if (!docFile) { setDocError("Choisis un fichier."); return; }
    setUploading(true);
    setDocError("");
    const form = new FormData();
    form.append("document", docFile);
    form.append("nom", docForm.nom || DOC_TYPES.find((t) => t.value === docForm.type)?.label);
    form.append("type", docForm.type);
    try {
      await api.post("/documents", form);
      setDocFile(null);
      setDocForm({ nom: "", type: "piece_identite" });
      loadDocs();
    } catch (err) {
      setDocError(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  // Navigue d'abord, déconnecte ensuite : sinon setUser(null) fait re-rendre
  // ProtectedRoute (encore monté sur /mon-compte à ce moment-là) avant que ce
  // navigate("/") ait fini de s'appliquer, et son propre <Navigate to="/login">
  // gagne la course — l'utilisateur atterrissait sur /login au lieu de /.
  const handleLogout = async () => { navigate("/", { replace: true }); await logout(); };

  const pending = bookings.filter((b) => b.statut === "en_attente");

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-navy">
            Bonjour, {user?.prenom} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">Propriétaire · {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-navy hover:text-navy">
          Se déconnecter
        </button>
      </div>

      {/* KPIs revenus */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-navy">{confirmedBookings.length}</p>
          <p className="mt-1 text-xs text-gray-500">Locations confirmées</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-green-600">{totalRevenue.toFixed(0)} €</p>
          <p className="mt-1 text-xs text-gray-500">Revenus nets</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-gray-700">{totalCommission.toFixed(0)} €</p>
          <p className="mt-1 text-xs text-gray-500">Commission SailingLoc (10%)</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link to="/mes-bateaux" className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-navy hover:border-sky hover:shadow-sm">
          Mes bateaux
          <span className="mt-1 block text-xs font-normal text-gray-400">Gérer annonces et disponibilités</span>
        </Link>
        <Link to="/mes-bateaux/nouveau" className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-navy hover:border-sky hover:shadow-sm">
          + Ajouter un bateau
          <span className="mt-1 block text-xs font-normal text-gray-400">Publier une nouvelle annonce</span>
        </Link>
        <Link to="/demandes" className="relative rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-navy hover:border-sky hover:shadow-sm">
          Demandes reçues
          {pending.length > 0 && (
            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {pending.length}
            </span>
          )}
          <span className="mt-1 block text-xs font-normal text-gray-400">Accepter ou refuser</span>
        </Link>
      </div>

      {/* Demandes en attente */}
      {pending.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-navy">
            Demandes en attente ({pending.length})
          </h2>
          <InlineAlert message={respondError} onDismiss={() => setRespondError("")} className="mt-3" />
          <div className="mt-4 space-y-3">
            {pending.map((b) => (
              <div key={b.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy">{b.Boat?.nom}</p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {b.User?.prenom} {b.User?.nom} · {formatDate(b.dateDebut)} → {formatDate(b.dateFin)} · {b.montantTotal} €
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => respond(b.id, "accepter")} className="rounded-lg bg-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-navy-light">
                    Accepter
                  </button>
                  <button onClick={() => respond(b.id, "refuser")} className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-navy hover:text-navy">
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique des transactions */}
      {confirmedBookings.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-navy">Historique des transactions</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-cloud text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Bateau</th>
                  <th className="px-4 py-3 text-left">Locataire</th>
                  <th className="px-4 py-3 text-left">Période</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                  <th className="px-4 py-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {confirmedBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-navy">{b.Boat?.nom}</td>
                    <td className="px-4 py-3 text-gray-500">{b.User?.prenom} {b.User?.nom}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(b.dateDebut)} → {formatDate(b.dateFin)}</td>
                    <td className="px-4 py-3 text-right">{b.montantTotal} €</td>
                    <td className="px-4 py-3 text-right text-gray-400">-{b.commission} €</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">{(b.montantTotal - b.commission).toFixed(0)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documents profil */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-navy">Mes documents</h2>
        <p className="mt-1 text-xs text-gray-500">
          Permis, assurance, CV nautique... Ces documents sont vérifiés par l'équipe SailingLoc.
        </p>

        <div className="mt-4 space-y-2">
          {documents.map((doc) => {
            const s = STATUS_LABELS[doc.statutValidation] || STATUS_LABELS.en_attente;
            return (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                <span className="font-medium text-navy">{doc.nom}</span>
                <span className={`text-xs font-semibold ${s.className}`}>{s.label}</span>
              </div>
            );
          })}
          {documents.length === 0 && (
            <p className="text-xs text-gray-400">Aucun document envoyé pour l'instant.</p>
          )}
        </div>

        <form onSubmit={uploadDoc} className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-white p-4">
          {docError && <p className="col-span-2 text-xs text-red-600">{docError}</p>}
          <select
            value={docForm.type}
            onChange={(e) => setDocForm((p) => ({ ...p, type: e.target.value }))}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
          >
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,application/octet-stream"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            className="text-xs"
          />
          <button
            type="submit"
            disabled={uploading}
            className="col-span-2 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-light disabled:opacity-50"
          >
            {uploading ? "Envoi..." : "Ajouter ce document"}
          </button>
        </form>
      </div>
    </div>
  );
}
