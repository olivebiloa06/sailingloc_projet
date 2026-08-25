// Géocodage automatique de la "localisation" texte d'un bateau (ex: "Marseille")
// en coordonnées GPS, via Nominatim (OpenStreetMap) — gratuit, sans clé API.
// Nominatim exige un User-Agent identifiant l'appli et limite à 1 requête/s :
// https://operations.osmfoundation.org/policies/nominatim/
async function geocodeLocation(query) {
  if (!query || !query.trim()) return null;

  try {
    // Biais Europe/Méditerranée (bounded=0 = préférence, pas une restriction
    // dure) : sans ça, une localisation courte et ambiguë comme "Havre" peut
    // remonter en priorité une ville homonyme d'un autre continent (ex:
    // Havre, Montana, USA) plutôt que Le Havre, France — vérifié en pratique.
    const EUROPE_VIEWBOX = "-25,72,45,30";
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}` +
      `&viewbox=${EUROPE_VIEWBOX}&bounded=0`;
    const response = await fetch(url, {
      headers: { "User-Agent": "SailingLoc/1.0 (contact@sailingloc.fr)" },
    });

    if (!response.ok) return null;

    const results = await response.json();
    if (!results.length) return null;

    return {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
    };
  } catch {
    // Le géocodage est une amélioration, pas une dépendance bloquante : si
    // Nominatim est indisponible, le bateau doit quand même pouvoir être créé.
    return null;
  }
}

module.exports = { geocodeLocation };
