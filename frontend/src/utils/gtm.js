const GTM_ID = "GTM-K7XR98J3";

// Chargé dynamiquement, uniquement après consentement explicite de
// l'utilisateur (voir CookieConsent.jsx). Ne rien appeler ici avant
// acceptation : GTM peut déposer des cookies de mesure d'audience.
export function loadGTM() {
  if (typeof window === "undefined" || window.__gtmLoaded) return;
  window.__gtmLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}
