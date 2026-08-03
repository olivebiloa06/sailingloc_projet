import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { resolveImageUrl } from "../utils/assets";
import BoatMark from "../components/BoatMark";

const TYPE_LABELS = {
  voilier: "Voilier",
  bateau_moteur: "Bateau à moteur",
  catamaran: "Catamaran",
  yacht: "Yacht",
  semi_rigide: "Semi-rigide",
  autre: "Autre",
};

const STATUT_LABELS = {
  brouillon: "Brouillon",
  en_attente: "En attente",
  publie: "Publié",
  suspendu: "Suspendu",
};

const STATUT_STYLES = {
  brouillon: "bg-gray-100 text-gray-600",
  en_attente: "bg-amber-100 text-amber-700",
  publie: "bg-green-100 text-green-700",
  suspendu: "bg-red-100 text-red-700",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PAGE_SIZE = 10;

export default function AdminBoats() {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .get("/admin/boats")
      .then((res) => setBoats(res.data.boats || []))
      .catch(() => setError("Impossible de charger les bateaux."))
      .finally(() => setLoading(false));
  }, []);

  // Filtre en temps réel (recalculé à chaque frappe, sans bouton de
  // recherche) sur le nom du bateau, son type, sa ville, et le nom/email de
  // son propriétaire — l'admin n'a pas forcément le nom exact du bateau en
  // tête, souvent plutôt le nom du propriétaire à retrouver.
  const filteredBoats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return boats;
    return boats.filter((b) => {
      const haystack = [
        b.nom,
        TYPE_LABELS[b.type] || b.type,
        b.localisation,
        b.User?.prenom,
        b.User?.nom,
        b.User?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [boats, query]);

  // Revient à la première page à chaque changement de filtre : sinon on
  // pourrait se retrouver sur une page 3 devenue vide après avoir filtré.
  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filteredBoats.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedBoats = filteredBoats.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-heading text-2xl font-semibold text-navy">Gérer les bateaux</h1>
      <p className="mt-1 text-sm text-gray-500">
        {boats.length} annonce{boats.length !== 1 ? "s" : ""} au total, tous propriétaires confondus.
      </p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filtrer par nom, type, ville, propriétaire..."
        aria-label="Filtrer les bateaux"
        className="mt-6 w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
      />

      {loading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}
      {error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && filteredBoats.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          {boats.length === 0 ? "Aucun bateau publié pour l'instant." : "Aucun résultat pour ce filtre."}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {paginatedBoats.map((boat) => {
          const image = resolveImageUrl(boat.imageUrl);
          return (
            <div
              key={boat.id}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-navy to-sky">
                {image ? (
                  <img src={image} alt={boat.nom} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BoatMark className="h-7 w-7 text-white/40" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-heading text-sm font-semibold text-navy">{boat.nom}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      STATUT_STYLES[boat.statut] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {STATUT_LABELS[boat.statut] || boat.statut}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {TYPE_LABELS[boat.type] || boat.type} · {boat.localisation} · {boat.prixJour} €/jour
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Propriétaire : {boat.User?.prenom} {boat.User?.nom} · {boat.User?.email}
                </p>
                <p className="mt-1 text-xs text-gray-400">Publié le {formatDate(boat.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Précédent
          </button>
          <p className="text-xs text-gray-500">
            Page {currentPage} sur {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
