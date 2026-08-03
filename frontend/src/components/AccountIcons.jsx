// Icônes ligne minimalistes pour le menu du compte (header) — même langage
// graphique que DiscoverIcons/BoatMark, à la place des emojis d'origine.

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

export function UserIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
    </svg>
  );
}

export function CalendarIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <line x1="4" y1="9.5" x2="20" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="6.5" />
      <line x1="16" y1="3" x2="16" y2="6.5" />
    </svg>
  );
}

export function ChatIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2Z" />
    </svg>
  );
}

export function ShieldIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5 19 6v6c0 4.5-3 7.3-7 8.5-4-1.2-7-4-7-8.5V6Z" />
      <path d="M9 12l2 2 4-4.2" />
    </svg>
  );
}

export function LogoutIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <line x1="4" y1="12" x2="15" y2="12" />
      <path d="M11 8l4 4-4 4" />
    </svg>
  );
}
