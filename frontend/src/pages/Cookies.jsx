import StaticPage from "../components/StaticPage";
import { REOPEN_EVENT } from "../components/CookieConsent";

export default function Cookies() {
  const openPreferences = () => {
    window.dispatchEvent(new Event(REOPEN_EVENT));
  };

  return (
    <StaticPage
      title="Politique de cookies"
      subtitle="Quels cookies SailingLoc utilise, pourquoi, et comment les gérer."
      lastUpdated="Août 2026"
    >
      <div className="space-y-8 text-sm text-gray-700">

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Qu'est-ce qu'un cookie ?</h2>
          <p>Un cookie est un petit fichier texte déposé par un site web sur votre navigateur. Il permet de mémoriser des informations lors de votre visite ou entre plusieurs visites.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Les cookies que nous utilisons</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 bg-white">
            <table className="w-full text-xs">
              <thead className="bg-cloud font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">Nom</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Durée</th>
                  <th className="px-4 py-2 text-left">Finalité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["refresh_token", "Strictement nécessaire", "7 jours", "Maintien de la session de connexion (httpOnly, SameSite)"],
                  ["sailingloc_cookie_consent", "Fonctionnel", "1 an", "Mémorisation de votre choix concernant les cookies"],
                  ["_ga, _gid, etc.", "Mesure d'audience (soumis à consentement)", "13 mois max", "Statistiques de fréquentation via Google Tag Manager / Analytics — déposés uniquement si vous acceptez"],
                ].map(([nom, type, duree, fin]) => (
                  <tr key={nom}>
                    <td className="px-4 py-2 font-mono font-semibold text-navy">{nom}</td>
                    <td className="px-4 py-2 text-gray-600">{type}</td>
                    <td className="px-4 py-2 text-gray-500">{duree}</td>
                    <td className="px-4 py-2 text-gray-500">{fin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-blue-50 p-4 text-blue-900">
          <p className="font-semibold">🍪 Cookies de mesure d'audience soumis à votre consentement</p>
          <p className="mt-1">SailingLoc utilise Google Tag Manager pour piloter des cookies de mesure d'audience (Google Analytics). Ces cookies ne sont déposés qu'après votre acceptation explicite dans la bannière : aucun tag n'est chargé tant que vous n'avez pas cliqué sur « Accepter ». Nous n'utilisons aucun cookie publicitaire ciblé ni de réseaux sociaux.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Cookies strictement nécessaires</h2>
          <p>Le cookie <code className="rounded bg-gray-100 px-1 font-mono">refresh_token</code> est indispensable au fonctionnement de la plateforme. Sans lui, vous devrez vous reconnecter à chaque visite. Conformément à la réglementation CNIL (délibération du 17 septembre 2020), ce type de cookie est exempté de consentement préalable.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Cookies de mesure d'audience</h2>
          <p>Les cookies déposés par Google Tag Manager / Google Analytics nous aident à comprendre la fréquentation du site (pages visitées, provenance des visiteurs). Ils ne sont activés qu'avec votre accord. Vous pouvez à tout moment revenir sur votre choix ci-dessous.</p>
          <button
            type="button"
            onClick={openPreferences}
            className="mt-3 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-light"
          >
            Gérer mes préférences de cookies
          </button>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Comment gérer les cookies ?</h2>
          <p>Vous pouvez paramétrer votre navigateur pour bloquer ou supprimer les cookies à tout moment. Notez que la suppression du cookie de session vous déconnectera de la plateforme.</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-sky">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/fr/kb/cookies-informations-que-les-sites-web-enregistrent" target="_blank" rel="noopener noreferrer" className="text-sky">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-sky">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-sky">Microsoft Edge</a></li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Contact</h2>
          <p>Pour toute question relative aux cookies : <a href="mailto:rgpd@sailingloc.fr" className="text-sky">rgpd@sailingloc.fr</a></p>
        </section>

      </div>
    </StaticPage>
  );
}
