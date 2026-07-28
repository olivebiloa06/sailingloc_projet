import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

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
  const [preview, setPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const act = async (statut) => {
    setActing(true);
    try {
      await api.patch(`/documents/${doc.id}/validate`, {
        statutValidation: statut,
        commentaireAdmin: comment || undefined,
      });
      onAction();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur.");
    } finally {
      setActing(false);
    }
  };

  const openPreview = async () => {
    try {
      const res = await api.get(`/documents/${doc.id}/file`, { responseType: "arraybuffer" });
      const ct = res.headers["content-type"] || "application/pdf";
      setPreviewType(ct);
      const base64 = btoa(
        new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      setPreviewUrl(`data:${ct};base64,${base64}`);
      setPreview(true);
    } catch {
      alert("Impossible de charger le document.");
    }
  };

  const downloadDoc = async () => {
    try {
      const res = await api.get(`/documents/${doc.id}/file`, { responseType: "blob" });
      const ct = res.headers["content-type"] || "application/pdf";
      const blob = new Blob([res.data], { type: ct });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.nom;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      alert("Impossible de telecharger ce document.");
    }
  };

  return (
    <>
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <p className="font-heading text-sm font-semibold text-navy">
                {doc.nom}
              </p>
              <button type="button" onClick={() => { setPreview(false); setPreviewUrl(null); }}
                className="rounded-lg px-3 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100">
                Fermer
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {previewType?.includes("pdf") ? (
                <object data={previewUrl} type="application/pdf" className="h-full w-full">
                  <embed src={previewUrl} type="application/pdf" className="h-full w-full" />
                </object>
              ) : (
                <div className="flex h-full items-center justify-center p-4">
                  <img src={previewUrl} alt="Document" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-sm font-semibold text-navy">
              {doc.nom} -- {TYPE_LABELS[doc.type] || doc.type}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {doc.User?.prenom} {doc.User?.nom} . {doc.User?.email} . role : {doc.User?.role}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              Soumis le {formatDate(doc.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={openPreview}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy">
              Voir
            </button>
            <button type="button" onClick={downloadDoc}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-gray-500">
              Telecharger
            </button>
          </div>
        </div>

        <textarea rows={2} placeholder="Commentaire (optionnel)" value={comment}
          onChange={(e) => setComment(e.target.value)}
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
    </>
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
          Rafraichir
        </button>
      </div>
      {loading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}
      {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!loading && !error && documents.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">Aucun document en attente.</p>
      )}
      <div className="mt-6 space-y-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} onAction={load} />
        ))}
      </div>
    </div>
  );
}
