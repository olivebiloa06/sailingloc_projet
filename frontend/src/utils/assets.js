// Les fichiers statiques (photos de bateaux) sont servis à la racine du
// serveur (/uploads/boats/...), pas sous /api — on retire donc le /api de
// VITE_API_URL pour reconstruire la bonne URL d'image. Centralisé ici car
// utilisé à la fois par la liste des bateaux et la fiche détail.
const ASSET_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith("http") ? imageUrl : `${ASSET_BASE_URL}${imageUrl}`;
}
