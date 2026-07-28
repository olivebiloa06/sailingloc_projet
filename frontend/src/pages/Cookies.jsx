import StaticPage from "../components/StaticPage";

export default function Cookies() {
  return (
    <StaticPage
      title="Politique de cookies"
      subtitle="Quels cookies SailingLoc utilise, pourquoi, et comment les gérer."
      lastUpdated="Juillet 2026"
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
                  ["sailingloc_cookie_consent", "Fonctionnel", "1 an", "Mémorisation de votre acceptation de la bannière cookies"],
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

        <section className="rounded-xl bg-green-50 p-4 text-green-800">
          <p className="font-semibold">✅ Aucun cookie publicitaire ou de traçage</p>
          <p className="mt-1">SailingLoc n'utilise aucun cookie de publicité ciblée, aucun cookie de réseaux sociaux, et aucun outil de tracking tiers (Google Analytics, Facebook Pixel, etc.). Le seul cookie déposé à des fins techniques est le token de session, strictement nécessaire au fonctionnement de la plateforme.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Cookies strictement nécessaires</h2>
          <p>Le cookie <code className="rounded bg-gray-100 px-1 font-mono">refresh_token</code> est indispensable au fonctionnement de la plateforme. Sans lui, vous devrez vous reconnecter à chaque visite. Conformément à la réglementation CNIL (délibération du 17 septembre 2020), ce type de cookie est exempté de consentement préalable.</p>
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
