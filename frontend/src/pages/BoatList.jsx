import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { resolveImageUrl } from "../utils/assets";
import BoatMark from "../components/BoatMark";
import FavoriteButton from "../components/FavoriteButton";
import { boatAltText } from "../utils/boatAlt";
import BoatMap from "../components/BoatMap";
import WeatherPanel from "../components/WeatherPanel";
import { usePageMeta } from "../hooks/usePageMeta";

// Images de fallback pour les bateaux sans photo uploadée
import fallback1 from "../assets/bergadder-ship-10038606_1920.jpg";
import fallback2 from "../assets/veverkolog-ship-8308680_1920.jpg";
import fallback3 from "../assets/pexels-asadphoto-12877369.jpg";
import fallback4 from "../assets/baloc.jpg";

const FALLBACKS = [fallback1, fallback2, fallback3, fallback4];

const BOAT_TYPES = [
  { value: "", label: "Tous les types" },
  { value: "voilier", label: "Voilier" },
  { value: "bateau_moteur", label: "Bateau à moteur" },
  { value: "catamaran", label: "Catamaran" },
  { value: "yacht", label: "Yacht" },
  { value: "semi_rigide", label: "Semi-rigide" },
  { value: "autre", label: "Autre" },
];

function boatTypeLabel(type) {
  return BOAT_TYPES.find((t) => t.value === type)?.label || type;
}

function formatShortDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// On affiche la première fenêtre "disponible" publiée par le propriétaire —
// l'objectif est de donner une vision immédiate ("ce bateau est dispo, à peu
// près sur cette période"), pas un calendrier exhaustif au stade de la liste.
function availabilityLabel(boat) {
  const availabilities = boat.availabilities || [];
  if (availabilities.length === 0) return null;
  const [first] = availabilities;
  return `Disponible du ${formatShortDate(first.dateDebut)} au ${formatShortDate(first.dateFin)}`;
}

function BoatCard({ boat, index = 0 }) {
  const image = resolveImageUrl(boat.imageUrl);
  // Si pas d'image uploadée, on utilise un fallback rotatif depuis les assets
  const fallbackImg = FALLBACKS[index % FALLBACKS.length];
  const availability = availabilityLabel(boat);

  return (
    <Link
      to={`/boats/${boat.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10 animate-fade-up"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-navy to-sky">
        <img
          src={image || fallbackImg}
          alt={boatAltText(boat)}
          className="h-full w-full object-cover transition group-hover:scale-105"
          onError={(e) => { e.target.src = fallbackImg; }}
        />

        {/* Bouton favori — coin haut droit */}
        <FavoriteButton boatId={boat.id} className="absolute right-2 top-2" />

        {boat.avecSkipper && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy">
            Avec skipper
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-navy">
            {boat.nom}
          </h3>
          <span className="shrink-0 text-sm font-semibold text-navy">
            {boat.prixJour} €
            <span className="text-xs font-normal text-gray-400">/jour</span>
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{boat.localisation}</p>
        <p className="mt-2 text-xs text-gray-400">
          {boatTypeLabel(boat.type)} · {boat.capacite} pers.
        </p>

        <p
          className={`mt-2 text-xs font-medium ${
            availability ? "text-green-600" : "text-gray-400"
          }`}
        >
          {availability || "Disponibilités à venir"}
        </p>
      </div>
    </Link>
  );
}

function filtersFromParams(searchParams) {
  return {
    localisation: searchParams.get("localisation") || "",
    type: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    capacite: searchParams.get("capacite") || "",
    avecSkipper: searchParams.get("avecSkipper") === "true",
  };
}

function buildParams(filters) {
  const params = new URLSearchParams();
  if (filters.localisation) params.set("localisation", filters.localisation);
  if (filters.type) params.set("type", filters.type);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.capacite) params.set("capacite", filters.capacite);
  if (filters.avecSkipper) params.set("avecSkipper", "true");
  return params;
}

export default function BoatList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grille");
  const [sortBy, setSortBy] = useState("pertinence");
  const [selectedZone, setSelectedZone] = useState(null);

  const fetchBoats = useCallback(async (activeFilters) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/boats", {
        params: Object.fromEntries(buildParams(activeFilters)),
      });
      setBoats(data.boats || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de charger les bateaux pour le moment."
      );
      setBoats([]);
    } finally {
      setLoading(false);
    }
  }, []);

// SEO meta tags

  usePageMeta({
    title: "Tous les bateaux",
    description: "Parcourez notre sélection de voiliers, catamarans et bateaux à moteur disponibles à la location.",
    url: "/boats"
  });

  // ... reste du code

  // Si l'URL change (nouvelle recherche depuis le header, ou navigation
  // directe vers /boats?...), on resynchronise les filtres affichés et on
  // relance la recherche.
  useEffect(() => {
    const next = filtersFromParams(searchParams);
    setFilters(next);
    fetchBoats(next);
  }, [searchParams, fetchBoats]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setSearchParams(buildParams(filters));
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const resultCount = boats.length;

  const sortedBoats = useMemo(() => {
    if (sortBy === "prix_asc") return [...boats].sort((a, b) => a.prixJour - b.prixJour);
    if (sortBy === "prix_desc") return [...boats].sort((a, b) => b.prixJour - a.prixJour);
    return boats;
  }, [boats, sortBy]);

  // Zone affichée dans le panneau météo : celle cliquée sur la carte, sinon
  // celle du premier bateau géolocalisé du lot courant.
  useEffect(() => {
    const firstLocated = boats.find((b) => b.latitude != null && b.longitude != null);
    setSelectedZone(
      firstLocated
        ? { latitude: firstLocated.latitude, longitude: firstLocated.longitude, name: firstLocated.localisation }
        : null
    );
  }, [boats]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-heading text-2xl font-semibold text-white drop-shadow">
        Nos bateaux disponibles
      </h1>
      <h1 className="font-heading text-2xl font-semibold text-navy">
        {loading
          ? "Recherche en cours..."
          : `${resultCount} bateau${resultCount === 1 ? "" : "x"} disponible${
              resultCount === 1 ? "" : "s"
            }`}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* FILTRES — colonne gauche, comme le wireframe du CDC */}
        <form
          onSubmit={applyFilters}
          className="space-y-5 self-start rounded-2xl border border-white/20 bg-white/90 p-5 shadow-lg backdrop-blur-md lg:sticky lg:top-24"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">
              Destination
            </label>
            <input
              type="text"
              value={filters.localisation}
              onChange={(e) => handleChange("localisation", e.target.value)}
              placeholder="Ville, région..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-navy">
              Type de bateau
            </label>
            <select
              value={filters.type}
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
              Prix par jour
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                placeholder="Min"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                placeholder="Max"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-navy">
              Capacité minimale
            </label>
            <input
              type="number"
              min="1"
              value={filters.capacite}
              onChange={(e) => handleChange("capacite", e.target.value)}
              placeholder="Nombre de personnes"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filters.avecSkipper}
              onChange={(e) => handleChange("avecSkipper", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-sky"
            />
            Avec skipper uniquement
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-navy py-2 text-sm font-semibold text-white transition hover:bg-navy-light"
            >
              Filtrer
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-navy hover:text-navy"
            >
              Réinitialiser
            </button>
          </div>
        </form>

        {/* RÉSULTATS — colonne droite */}
        <div>
          {!error && !loading && resultCount > 0 && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2 rounded-full border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setView("carte")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    view === "carte" ? "bg-navy text-white" : "text-gray-500 hover:text-navy"
                  }`}
                >
                  🗺️ Carte
                </button>
                <button
                  type="button"
                  onClick={() => setView("grille")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    view === "grille" ? "bg-navy text-white" : "text-gray-500 hover:text-navy"
                  }`}
                >
                  ▦ Grille
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-500">
                Trier par :
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm font-semibold text-navy focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
                >
                  <option value="pertinence">Pertinence</option>
                  <option value="prix_asc">Prix croissant</option>
                  <option value="prix_desc">Prix décroissant</option>
                </select>
              </label>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          )}

          {!error && !loading && resultCount === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center">
              <p className="font-heading text-lg font-semibold text-navy">
                Aucun bateau ne correspond à ta recherche
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Essaie d'élargir tes filtres, ou réinitialise la recherche.
              </p>
            </div>
          )}

          {!error && !loading && resultCount > 0 && view === "grille" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedBoats.map((boat, i) => (
                <BoatCard key={boat.id} boat={boat} index={i} />
              ))}
            </div>
          )}

          {!error && !loading && resultCount > 0 && view === "carte" && (
            <div className="grid h-[32rem] gap-4 lg:grid-cols-[2fr_1fr]">
              <BoatMap
                boats={sortedBoats}
                onCenterChange={setSelectedZone}
              />
              <WeatherPanel
                latitude={selectedZone?.latitude}
                longitude={selectedZone?.longitude}
                locationName={selectedZone?.name}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
