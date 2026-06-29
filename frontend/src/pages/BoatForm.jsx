import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import { resolveImageUrl } from "../utils/assets";

const BOAT_TYPES = [
  { value: "voilier", label: "Voilier" },
  { value: "catamaran", label: "Catamaran" },
  { value: "bateau_moteur", label: "Bateau à moteur" },
  { value: "yacht", label: "Yacht" },
  { value: "semi_rigide", label: "Semi-rigide" },
  { value: "autre", label: "Autre" },
];

const DOCUMENT_TYPES = [
  { value: "assurance", label: "Assurance" },
  { value: "certificat_bateau", label: "Certificat du bateau" },
  { value: "permis", label: "Permis" },
  { value: "piece_identite", label: "Pièce d'identité" },
  { value: "autre", label: "Autre" },
];

const DOCUMENT_STATUS_LABELS = {
  en_attente: "En attente de validation",
  valide: "Validé",
  refuse: "Refusé",
};

// Photo + documents du bateau — séparé du formulaire principal parce qu'il
// faut un id de bateau existant pour attacher un fichier à quoi que ce soit.
function BoatMediaPanel({ boatId, imageUrl, onImageUploaded }) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docForm, setDocForm] = useState({ nom: "", type: "assurance" });
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState("");

  const loadDocuments = () => {
    setLoadingDocs(true);
    api
      .get(`/documents/boat/${boatId}`)
      .then((res) => setDocuments(res.data.documents || []))
      .catch(() => setDocuments([]))
      .finally(() => setLoadingDocs(false));
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boatId]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setPhotoError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post(`/uploads/boat/${boatId}`, formData);
      onImageUploaded(res.data.boat?.imageUrl || res.data.imageUrl);
    } catch (err) {
      setPhotoError(err.response?.data?.message || "Échec de l'envoi de la photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docFile) {
      setDocError("Choisis un fichier.");
      return;
    }

    setUploadingDoc(true);
    setDocError("");

    const formData = new FormData();
    formData.append("document", docFile);
    formData.append("nom", docForm.nom);
    formData.append("type", docForm.type);
    formData.append("boatId", boatId);

    try {
      await api.post("/documents", formData);
      setDocForm({ nom: "", type: "assurance" });
      setDocFile(null);
      loadDocuments();
    } catch (err) {
      setDocError(err.response?.data?.message || "Échec de l'envoi du document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  return (
    <div className="mt-8 space-y-6 border-t border-gray-200 pt-6">
      <div>
        <h2 className="font-heading text-base font-semibold text-navy">
          Photo du bateau
        </h2>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-navy to-sky">
            {imageUrl && (
              <img
                src={resolveImageUrl(imageUrl)}
                alt="Bateau"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              disabled={uploadingPhoto}
              className="text-sm"
            />
            {uploadingPhoto && (
              <p className="mt-1 text-xs text-gray-400">Envoi en cours...</p>
            )}
            {photoError && (
              <p className="mt-1 text-xs text-red-600">{photoError}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-base font-semibold text-navy">
          Documents (assurance, certificat...)
        </h2>

        {loadingDocs && (
          <p className="mt-2 text-xs text-gray-400">Chargement...</p>
        )}

        <div className="mt-2 space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
            >
              <span>
                {doc.nom} — {DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label || doc.type}
              </span>
              <span className="text-gray-400">
                {DOCUMENT_STATUS_LABELS[doc.statutValidation] || doc.statutValidation}
              </span>
            </div>
          ))}
          {!loadingDocs && documents.length === 0 && (
            <p className="text-xs text-gray-400">Aucun document pour ce bateau.</p>
          )}
        </div>

        <form
          onSubmit={handleDocSubmit}
          className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-white p-3"
        >
          {docError && (
            <p className="col-span-2 text-xs text-red-600">{docError}</p>
          )}
          <input
            type="text"
            required
            placeholder="Nom du document"
            value={docForm.nom}
            onChange={(e) => setDocForm((p) => ({ ...p, nom: e.target.value }))}
            className="col-span-2 rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
          />
          <select
            value={docForm.type}
            onChange={(e) => setDocForm((p) => ({ ...p, type: e.target.value }))}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            className="text-xs"
          />
          <button
            type="submit"
            disabled={uploadingDoc}
            className="col-span-2 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-light disabled:opacity-50"
          >
            {uploadingDoc ? "Envoi..." : "Ajouter ce document"}
          </button>
        </form>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  nom: "",
  type: "voilier",
  description: "",
  localisation: "",
  prixJour: "",
  capacite: "",
  longueur: "",
  avecSkipper: false,
};

export default function BoatForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState(null);
  const [docBlocked, setDocBlocked] = useState(false);

  // Vérifie dès le chargement si le propriétaire a un doc validé.
  // En mode "nouveau bateau" seulement — en édition c'est déjà passé.
  useEffect(() => {
    if (isEditing) return;
    api.get("/documents/my-documents")
      .then((res) => {
        const docs = res.data.documents || [];
        const hasValid = docs.some((d) => d.statutValidation === "valide");
        setDocBlocked(!hasValid);
      })
      .catch(() => {});
  }, [isEditing]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    api
      .get(`/boats/${id}`)
      .then((res) => {
        const boat = res.data.boat;
        setForm({
          nom: boat.nom || "",
          type: boat.type || "voilier",
          description: boat.description || "",
          localisation: boat.localisation || "",
          prixJour: boat.prixJour ?? "",
          capacite: boat.capacite ?? "",
          longueur: boat.longueur ?? "",
          avecSkipper: Boolean(boat.avecSkipper),
        });
        setImageUrl(boat.imageUrl || null);
      })
      .catch(() => setError("Impossible de charger ce bateau."))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      prixJour: Number(form.prixJour),
      capacite: Number(form.capacite),
      longueur: form.longueur ? Number(form.longueur) : null,
    };

    try {
      if (isEditing) {
        await api.put(`/boats/${id}`, payload);
        navigate("/mes-bateaux");
      } else {
        const res = await api.post("/boats", payload);
        // On redirige vers l'édition (pas la liste) : c'est seulement une
        // fois le bateau créé qu'on a un id pour y attacher une photo ou un
        // document, donc cette étape se fait juste après.
        navigate(`/mes-bateaux/${res.data.boat.id}/edit`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  if (docBlocked) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link to="/mes-bateaux" className="text-sm text-sky">← Mes bateaux</Link>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <p className="text-2xl">🔒</p>
          <h2 className="mt-3 font-heading text-lg font-semibold text-amber-800">
            Documents non validés
          </h2>
          <p className="mt-2 text-sm text-amber-700">
            Vous ne pouvez pas publier de bateau tant que l'équipe SailingLoc
            n'a pas vérifié vos pièces d'identité et/ou d'assurance.
          </p>
          <Link
            to="/mon-compte"
            className="mt-4 inline-block rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light"
          >
            Envoyer mes documents →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-sm text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/mes-bateaux" className="text-sm text-sky">
        ← Retour à mes bateaux
      </Link>

      <h1 className="mt-3 font-heading text-2xl font-semibold text-navy">
        {isEditing ? "Modifier le bateau" : "Ajouter un bateau"}
      </h1>

      {!isEditing && (
        <p className="mt-1 text-xs text-gray-400">
          La photo se rajoute une fois le bateau créé, via l'upload existant.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-navy">
            Nom du bateau
          </label>
          <input
            type="text"
            required
            value={form.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Type</label>
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
            >
              {BOAT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">
              Localisation
            </label>
            <input
              type="text"
              required
              value={form.localisation}
              onChange={(e) => handleChange("localisation", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-navy">
            Description
          </label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">
              Prix / jour (€)
            </label>
            <input
              type="number"
              min="0"
              required
              value={form.prixJour}
              onChange={(e) => handleChange("prixJour", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">
              Capacité (pers.)
            </label>
            <input
              type="number"
              min="1"
              required
              value={form.capacite}
              onChange={(e) => handleChange("capacite", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">
              Longueur (m)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.longueur}
              onChange={(e) => handleChange("longueur", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.avecSkipper}
            onChange={(e) => handleChange("avecSkipper", e.target.checked)}
          />
          Skipper disponible avec ce bateau
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-50"
        >
          {saving
            ? "Enregistrement..."
            : isEditing
            ? "Enregistrer les modifications"
            : "Publier le bateau"}
        </button>
      </form>

      {isEditing && (
        <BoatMediaPanel
          boatId={id}
          imageUrl={imageUrl}
          onImageUploaded={setImageUrl}
        />
      )}
    </div>
  );
}
