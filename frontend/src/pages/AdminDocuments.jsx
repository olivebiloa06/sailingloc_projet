import { useCallback, useEffect, useState } from "react";
import api, { openFileInNewTab } from "../services/api";
import InlineAlert from "../components/InlineAlert";

const TYPE_LABELS = {
  piece_identite: "Pièce d'identité",
  assurance: "Assurance",
  certificat_bateau: "Certificat du bateau",
  permis: "Permis",
  autre: "Autre",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function DocumentCard({ doc, onAction }) {
  const [comment, setComment] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  const act = async (statut) => {
    setActing(true);
    setError("");
    try {
      await api.patch(`/documents/${doc.id}/validate`, {
        statutValidation: statut,
        commentaireAdmin: comment || undefined,
      });
      onAction();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur.");
    } finally {
      setActing(false);
    }
  };

  // Ouvre l'onglet AVANT l'appel réseau : sinon le délai de l'await casse le
  // lien avec le geste utilisateur et les navigateurs bloquent le popup.
  //
  // Un seul bouton "Télécharger" — Cloudinary force Content-Disposition:
  // attachment sur les fichiers "raw" quel que soit le paramètre download,
  // donc un bouton "Voir" séparé ne ferait qu'exactement la même chose
  // (téléchargement), ce qui induisait en erreur.
  const downloadDoc = async () => {
    const tab = window.open("", "_blank", "noopener,noreferrer");
    try {
      await openFileInNewTab(tab, `/documents/${doc.id}/file`, { download: 1 });
    } catch {
      tab?.close();
      setError("Impossible de charger le document.");
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-semibold text-navy">
            {doc.nom} — {TYPE_LABELS[doc.type] || doc.type}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {doc.User?.prenom} {doc.User?.nom} · {doc.User?.email} · rôle : {doc.User?.role}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Soumis le {formatDate(doc.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={downloadDoc}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy">
            ⬇ Télécharger
          </button>
        </div>
      </div>

      <InlineAlert message={error} onDismiss={() => setError("")} className="mt-3" />

      <textarea rows={2} placeholder="Commentaire (optionnel, visible par l'utilisateur)"
        value={comment} onChange={(e) => setComment(e.target.value)}
        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-sky focus:outline-none" />

      <div className="mt-2 flex gap-2">
        <button type="button" disabled={acting} onClick={() => act("valide")}
          className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
          Valider
        </button>
        <button type="button" disabled={acting} onClick={() => act("refuse")}
          className="rounded-lg border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:border-red-500 disabled:opacity-50">
          Refuser
        </button>
      </div>
    </div>
  );
}

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.get("/documents/admin/pending")
      .then((res) => setDocuments(res.data.documents || []))
      .catch(() => setError("Impossible de charger les documents."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-navy">Validation des documents</h1>
        <button type="button" onClick={load}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy">
          ↻ Rafraîchir
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}
      {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!loading && !error && documents.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">Aucun document en attente de validation.</p>
      )}

      <div className="mt-6 space-y-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} onAction={load} />
        ))}
      </div>
    </div>
  );
}
