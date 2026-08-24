const TONES = {
  error: "bg-red-50 text-red-700",
  success: "bg-green-50 text-green-700",
};

// Bannière d'erreur/succès inline — remplace les alert() natifs du
// navigateur (bloquants, non stylés, incohérents avec le reste du site) par
// le pattern déjà utilisé sur Login/Register/Reservation.
export default function InlineAlert({ message, tone = "error", onDismiss, className = "" }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm ${TONES[tone] || TONES.error} ${className}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fermer ce message"
          className="shrink-0 text-current opacity-60 transition hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
