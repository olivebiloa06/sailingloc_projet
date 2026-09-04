import { useState } from "react";

// Champ mot de passe avec bouton "afficher/masquer" (icône œil), pour que
// l'utilisateur puisse vérifier sa saisie avant de valider. Reprend le même
// style que les <input> texte du reste du site.
export default function PasswordInput({ id, name, value, onChange, autoComplete, className = "", ...rest }) {
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
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-gray-400 hover:text-navy"
      >
        {visible ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
            <line x1="3" y1="21" x2="21" y2="3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
