import StaticPage from "../components/StaticPage";

export default function Confidentialite() {
  return (
    <StaticPage
      title="Politique de confidentialité"
      subtitle="Comment SailingLoc collecte, utilise et protège vos données personnelles."
      lastUpdated="Juillet 2026"
    >
      <div className="space-y-8 text-sm text-gray-700">

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">1. Responsable du traitement</h2>
          <p>SailingLoc, SAS — contact@sailingloc.fr — Paris, France. Conformément au RGPD (Règlement UE 2016/679), SailingLoc est responsable du traitement des données personnelles collectées sur cette plateforme.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">2. Données collectées</h2>
          <p>Selon votre utilisation de la plateforme, nous collectons :</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
            <li>Données d'identification : prénom, nom, adresse email</li>
            <li>Données de navigation : pages visitées, durée de session, adresse IP</li>
            <li>Données de réservation : dates, bateau sélectionné, montants</li>
            <li>Documents d'identité et d'assurance (propriétaires uniquement)</li>
            <li>Données de paiement : traitées exclusivement par Stripe et PayPal — non stockées par SailingLoc</li>
            <li>Avis et commentaires publiés sur la plateforme</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">3. Finalités et bases légales</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 bg-white">
            <table className="w-full text-xs">
              <thead className="bg-cloud font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">Finalité</th>
                  <th className="px-4 py-2 text-left">Base légale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Création et gestion de compte", "Exécution du contrat"],
                  ["Gestion des réservations et paiements", "Exécution du contrat"],
                  ["Vérification des documents propriétaires", "Obligation légale"],
                  ["Génération des contrats de location", "Exécution du contrat"],
                  ["Envoi d'emails transactionnels", "Exécution du contrat"],
                  ["Amélioration de la plateforme", "Intérêt légitime"],
                  ["Statistiques et analytics", "Intérêt légitime"],
                ].map(([fin, base]) => (
                  <tr key={fin}>
                    <td className="px-4 py-2 text-gray-700">{fin}</td>
                    <td className="px-4 py-2 text-gray-500">{base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">4. Durée de conservation</h2>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
            <li>Données de compte : durée de la relation commerciale + 3 ans</li>
            <li>Documents d'identité : durée de la relation + 5 ans (obligation légale)</li>
            <li>Données de réservation et contrats : 10 ans (prescription commerciale)</li>
            <li>Données de navigation : 13 mois maximum</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">5. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition au traitement</li>
            <li>Droit de limitation du traitement</li>
          </ul>
          <p className="mt-3">Pour exercer ces droits : <strong>rgpd@sailingloc.fr</strong>. Nous répondons sous 30 jours. En cas de réclamation, vous pouvez saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-sky">CNIL</a>.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">6. Transferts de données</h2>
          <p>Vos données sont hébergées en France (OVH, Gravelines). Certains sous-traitants peuvent être localisés dans l'Union Européenne ou aux États-Unis (Stripe, PayPal), dans le respect des clauses contractuelles types approuvées par la Commission Européenne.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">7. Modification de cette politique</h2>
          <p>Toute modification substantielle de cette politique fera l'objet d'une notification par email aux utilisateurs inscrits au moins 30 jours avant son entrée en vigueur.</p>
        </section>

      </div>
    </StaticPage>
  );
}
