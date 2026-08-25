import { useEffect, useState } from "react";
import { loadGTM } from "../utils/gtm";

const STORAGE_KEY = "sailingloc_cookie_consent";
export const REOPEN_EVENT = "sailingloc:open-cookie-consent";

// Bannière de consentement. Un cookie technique (session) est déposé sans
// consentement, conformément à l'exemption CNIL pour les cookies
// strictement nécessaires. Les cookies de mesure d'audience (Google Tag
// Manager / Analytics) ne sont chargés qu'après acceptation explicite :
// aucun tag ne se déclenche tant que l'utilisateur n'a pas cliqué
// "Accepter" (voir loadGTM, appelé uniquement ici).
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted") {
      loadGTM();
    } else if (!stored) {
      setVisible(true);
    }

    const reopen = () => setVisible(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    loadGTM();
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem(STORAGE_KEY, "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          SailingLoc dépose un cookie strictement nécessaire pour te garder
          connecté en toute sécurité. Avec ton accord, nous utilisons aussi
          des cookies de mesure d'audience pour améliorer le site. En savoir
          plus dans notre{" "}
          <a href="/cookies" className="underline text-navy">
            politique de cookies
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={refuse}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-light"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
