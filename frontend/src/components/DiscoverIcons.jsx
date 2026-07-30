// Icônes ligne minimalistes pour le menu "Découvrir" du header — même
// langage graphique que BoatMark (trait fin, currentColor, sans remplissage)
// plutôt que des emojis, qui détonnaient avec le reste de l'identité visuelle.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

export function AnchorIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="5" r="1.8" />
      <line x1="12" y1="6.8" x2="12" y2="21" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <path d="M4 12c0 4.4 3.4 7.8 8 9 4.6-1.2 8-4.6 8-9" />
    </svg>
  );
}

export function CatamaranIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <line x1="6" y1="6" x2="6" y2="16" />
      <line x1="18" y1="6" x2="18" y2="16" />
      <line x1="6" y1="10" x2="18" y2="10" />
      <path d="M3 19c1.5-1.5 4.5-1.5 6 0M15 19c1.5-1.5 4.5-1.5 6 0" />
    </svg>
  );
}

export function SpeedboatIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 15h18l-3-5H7Z" />
      <path d="M9 10V6h3l2 4" />
      <path d="M2 19c2 1.2 4 1.2 6 0M16 19c2 1.2 4 1.2 6 0" />
    </svg>
  );
}

export function WheelIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="5" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="19" />
      <line x1="5" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="19" y2="12" />
      <line x1="7.1" y1="7.1" x2="9.3" y2="9.3" />
      <line x1="14.7" y1="14.7" x2="16.9" y2="16.9" />
      <line x1="16.9" y1="7.1" x2="14.7" y2="9.3" />
      <line x1="9.3" y1="14.7" x2="7.1" y2="16.9" />
    </svg>
  );
}

export function IslandIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="6" r="1.6" />
      <path d="M2 19c3-6.5 6-9.5 10-9.5s7 3 10 9.5" />
      <line x1="2" y1="19" x2="22" y2="19" />
    </svg>
  );
}

export function SunIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="7" y2="7" />
      <line x1="17" y1="17" x2="19.1" y2="19.1" />
      <line x1="19.1" y1="4.9" x2="17" y2="7" />
      <line x1="7" y1="17" x2="4.9" y2="19.1" />
    </svg>
  );
}

export function MapPinIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  );
}

export function IslandsIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M2 15.5c1.5-1.8 3-2.5 4.5-2.5s3 1 4.5 1 3-1 4.5-1 3 .7 4.5 2.5" />
      <path d="M2 19.5c1.5-1.5 3-2 4.5-2s3 .8 4.5 .8 3-.8 4.5-.8 3 .5 4.5 2" />
    </svg>
  );
}

export function WavesIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </svg>
  );
}

export function MegaphoneIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l4 4V5L6 9H4a1 1 0 0 0-1 1Z" />
      <path d="M15.5 9a4 4 0 0 1 0 6" />
      <path d="M18.3 6.2a8 8 0 0 1 0 11.6" />
    </svg>
  );
}

export function ClipboardIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="16" y2="15" />
      <line x1="8" y1="19" x2="13" y2="19" />
    </svg>
  );
}

export function CompassIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.8 9.2 13 13l-3.8 1.8L11 11Z" />
    </svg>
  );
}

export function InfoIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="7.5" x2="12" y2="7.6" strokeWidth="2.6" />
    </svg>
  );
}
