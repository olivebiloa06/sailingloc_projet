// Badges "App Store" / "Google Play" recréés en SVG (pas de dépendance à
// des logos officiels téléchargés). Volontairement NON cliquables : l'app
// n'existe pas encore, un lien qui ne mène nulle part serait trompeur.
function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M16.5 1.5c.1 1.1-.3 2.2-1 3-.7.8-1.9 1.5-3 1.4-.1-1.1.4-2.2 1-3 .7-.8 1.9-1.4 3-1.4zM20.6 17.1c-.5 1.1-.7 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9-1.9 0-2.4.9-3.7.9-1.6 0-2.8-1.6-3.7-3-2.5-3.9-2.8-8.6-1.2-11 1.1-1.7 2.8-2.7 4.5-2.7 1.7 0 2.8 1 4.2 1 1.4 0 2.2-1 4.2-1 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.3.4 8.8z" />
    </svg>
  );
}

function PlayLogo() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M4 2.5c-.3.3-.5.7-.5 1.2v16.6c0 .5.2.9.5 1.2l.1.1L13.6 12 4.1 2.4z" fill="#00D9FF" />
      <path d="M16.8 15.2 13.6 12l3.2-3.2 3.9 2.2c.9.5.9 1.5 0 2l-3.9 2.2z" fill="#FFD500" />
      <path d="M16.8 15.2 13.6 12 4.1 21.6c.4.4 1 .4 1.7.1l11-6.5z" fill="#FF3D57" />
      <path d="M16.8 8.8 5.8 2.3C5.1 2 4.5 2 4.1 2.4L13.6 12l3.2-3.2z" fill="#00E676" />
    </svg>
  );
}

function StoreBadge({ icon, eyebrow, name }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-black px-4 py-2 text-white opacity-90"
      aria-label={`${name} — bientôt disponible`}
    >
      {icon}
      <div className="text-left leading-tight">
        <p className="text-[10px] text-white/70">{eyebrow}</p>
        <p className="font-heading text-sm font-semibold">{name}</p>
      </div>
    </div>
  );
}

export default function StoreBadges({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <StoreBadge icon={<AppleLogo />} eyebrow="Bientôt sur l'" name="App Store" />
      <StoreBadge icon={<PlayLogo />} eyebrow="Bientôt sur" name="Google Play" />
    </div>
  );
}
