import { useEffect, useState } from "react";

const STORAGE_KEY = "sailingloc_cookie_consent";

// Bannière simple, affichée tant que l'utilisateur n'a pas cliqué une fois.
// On reste honnête sur ce qui est réellement utilisé : un seul cookie,
// strictement nécessaire (httpOnly, pour la connexion), pas de pistage ni de
// publicité. Pas de granularité "accepter/refuser" : il n'y a rien à choisir,
// ce cookie est indispensable au fonctionnement du site (RGPD : un cookie
// strictement nécessaire n'exige pas de consentement actif, juste une
// information claire).
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "acknowledged");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          SailingLoc utilise un cookie strictement nécessaire au
          fonctionnement du site, pour te garder connecté en toute sécurité.
          Aucun cookie publicitaire ou de suivi n'est utilisé.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-light"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
}
