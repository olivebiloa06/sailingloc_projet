// Logo "voilier minimaliste" partagé — utilisé dans le header, les cartes
// de bateau sans photo, et la fiche détail. Centralisé ici pour ne pas
// dupliquer le même SVG à 4 endroits différents.
export default function BoatMark({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="16" y1="4" x2="16" y2="22" />
      <path d="M16 6 L24 20 L16 20 Z" />
      <path d="M5 24 Q16 30 27 24" />
    </svg>
  );
}
