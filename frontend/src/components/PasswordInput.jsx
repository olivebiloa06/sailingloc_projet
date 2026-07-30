import { useState } from "react";

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.59a3 3 0 0 0 4.24 4.24" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10.5 7 10.5 7a13.15 13.15 0 0 1-3.11 4.14M6.6 6.6C3.88 8.36 1.5 12 1.5 12s3.5 7 10.5 7a10.9 10.9 0 0 0 5.05-1.19" />
    </svg>
  );
}

// Champ mot de passe avec bouton afficher/masquer — un seul composant pour
// les 5 champs mot de passe de l'app (Login, Register x2, ResetPassword x2)
// plutôt que dupliquer la logique de toggle et l'icône dans chacun.
export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  autoComplete = "current-password",
  className = "",
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30 ${className}`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-navy focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-1 rounded"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
