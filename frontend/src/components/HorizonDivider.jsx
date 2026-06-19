// Motif signature de la page : une ligne d'horizon stylisée, réutilisée à
// deux endroits (bas du hero, haut du footer) plutôt que décorée séparément
// à chaque fois — c'est la même "vague" qui revient, pas deux effets
// différents.
export default function HorizonDivider({ fill, className = "", flip = false }) {
  const wavePath = flip
    ? "M0,0 L1440,0 L1440,40 C1200,10 960,70 720,40 C480,10 240,70 0,40 Z"
    : "M0,80 L0,40 C240,10 480,70 720,40 C960,10 1200,70 1440,40 L1440,80 Z";

  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={`block h-10 w-full ${className}`}
      style={{ color: fill }}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={wavePath} />
    </svg>
  );
}
