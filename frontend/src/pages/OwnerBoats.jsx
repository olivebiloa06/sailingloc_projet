import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { resolveImageUrl } from "../utils/assets";
import BoatMark from "../components/BoatMark";
import InlineAlert from "../components/InlineAlert";

const TYPE_LABELS = {
  voilier: "Voilier",
  bateau_moteur: "Bateau à moteur",
  catamaran: "Catamaran",
  yacht: "Yacht",
  semi_rigide: "Semi-rigide",
  autre: "Autre",
};

export default function OwnerBoats() {
  const { user } = useAuth();
  const [boats, setBoats] = useState([]);
  const [hasValidatedDoc, setHasValidatedDoc] = useState(null); // null = chargement
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pas de route "/boats/mine" côté backend : GET /api/boats est public et
  // renvoie déjà le propriétaire de chaque bateau (User.id), donc on filtre
  // ici plutôt que d'ajouter un nouvel endpoint pour ça.
  const loadBoats = () => {
    setLoading(true);
    Promise.all([
      api.get("/boats"),
      api.get("/documents/my-documents").catch(() => ({ data: { documents: [] } })),
    ]).then(([boatRes, docRes]) => {
      const mine = (boatRes.data.boats || []).filter((b) => b.User?.id === user.id);
      setBoats(mine);
      const docs = docRes.data.documents || [];
      setHasValidatedDoc(docs.some((d) => d.statutValidation === "valide"));
    }).catch(() => setError("Impossible de charger tes bateaux."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBoats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce bateau ? Cette action est définitive.")) return;
    setError("");
    try {
      await api.delete(`/boats/${id}`);
      loadBoats();
    } catch (err) {
      setError(err.response?.data?.message || "Suppression impossible.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-navy">
          Mes bateaux
        </h1>
        {hasValidatedDoc ? (
          <Link
            to="/mes-bateaux/nouveau"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-light"
          >
            + Ajouter un bateau
          </Link>
        ) : (
          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed">
            + Ajouter un bateau
          </span>
        )}
      </div>

      {hasValidatedDoc === false && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Documents non validés.</strong> Vous ne pouvez pas publier de bateau tant que l'équipe SailingLoc n'a pas vérifié vos pièces.{" "}
          <Link to="/mon-compte" className="font-semibold underline">
            Aller dans mon compte →
          </Link>
        </div>
      )}

      {loading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}
      <InlineAlert message={error} onDismiss={() => setError("")} className="mt-6" />

      {!loading && !error && boats.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          Tu n'as pas encore de bateau publié.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {boats.map((boat) => {
          const image = resolveImageUrl(boat.imageUrl);
          return (
            <div
              key={boat.id}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-navy to-sky">
                {image ? (
                  <img src={image} alt={boat.nom} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BoatMark className="h-8 w-8 text-white/40" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-base font-semibold text-navy">
                    {boat.nom}
                  </h3>
                  <span className="text-sm font-semibold text-navy">
                    {boat.prixJour} €
                    <span className="text-xs font-normal text-gray-400">/jour</span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {TYPE_LABELS[boat.type] || boat.type} · {boat.localisation}
                </p>

                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/mes-bateaux/${boat.id}/edit`}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-navy"
                  >
                    Modifier
                  </Link>
                  <Link
                    to={`/mes-bateaux/${boat.id}/disponibilites`}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-navy"
                  >
                    Disponibilités
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(boat.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-400"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
