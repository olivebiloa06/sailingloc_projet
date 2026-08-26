const BOAT_TYPE_LABELS = {
  voilier: "Voilier",
  bateau_moteur: "Bateau à moteur",
  catamaran: "Catamaran",
  yacht: "Yacht",
  semi_rigide: "Semi-rigide",
  autre: "Bateau",
};

// Texte alternatif descriptif pour une photo de bateau — utile pour les
// lecteurs d'écran (CDC accessibilité D.2.e : éviter les alt génériques type
// "image bateau"), et accessoirement pour le référencement.
export function boatAltText(boat) {
  if (!boat) return "Bateau";
  const type = BOAT_TYPE_LABELS[boat.type] || "Bateau";
  const capacite = boat.capacite ? ` ${boat.capacite} personnes` : "";
  const lieu = boat.localisation ? ` disponible à ${boat.localisation}` : "";
  const skipper = boat.avecSkipper ? " avec skipper" : "";
  return `${type}${capacite}${lieu}${skipper}`;
}
