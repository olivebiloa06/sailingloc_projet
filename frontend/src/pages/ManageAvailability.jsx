import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const STATUS_LABELS = {
  disponible: "Disponible",
  reserve: "Réservé",
  indisponible: "Indisponible",
};

function toInputDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export default function ManageAvailability() {
  const { id: boatId } = useParams();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ dateDebut: "", dateFin: "", statut: "disponible" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get(`/availabilities/boat/${boatId}`)
      .then((res) => setAvailabilities(res.data.availabilities || []))
      .catch(() => setError("Impossible de charger les disponibilités."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boatId]);

  const resetForm = () => {
    setForm({ dateDebut: "", dateFin: "", statut: "disponible" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/availabilities/${editingId}`, form);
      } else {
        await api.post("/availabilities", { ...form, boatId });
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (availability) => {
    setEditingId(availability.id);
    setForm({
      dateDebut: toInputDate(availability.dateDebut),
      dateFin: toInputDate(availability.dateFin),
      statut: availability.statut,
    });
  };

  const handleDelete = async (availabilityId) => {
    if (!window.confirm("Supprimer cette période ?")) return;
    try {
      await api.delete(`/availabilities/${availabilityId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Suppression impossible.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/mes-bateaux" className="text-sm text-sky">
        ← Retour à mes bateaux
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-navy">
        Disponibilités
      </h1>

      {loading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-3 gap-3 rounded-xl border border-gray-200 bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-navy">Du</label>
          <input
            type="date"
            required
            value={form.dateDebut}
            onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy">Au</label>
          <input
            type="date"
            required
            value={form.dateFin}
            onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy">Statut</label>
          <select
            value={form.statut}
            onChange={(e) => setForm((p) => ({ ...p, statut: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-3 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-light disabled:opacity-50"
          >
            {editingId ? "Enregistrer" : "Ajouter cette période"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 space-y-2">
        {availabilities.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
          >
            <span>
              Du {toInputDate(a.dateDebut)} au {toInputDate(a.dateFin)} —{" "}
              {STATUS_LABELS[a.statut] || a.statut}
            </span>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(a)} className="text-xs font-semibold text-sky">
                Modifier
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-xs font-semibold text-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {!loading && availabilities.length === 0 && (
          <p className="text-sm text-gray-500">
            Aucune période publiée pour ce bateau.
          </p>
        )}
      </div>
    </div>
  );
}
