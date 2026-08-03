import StaticPage from "../components/StaticPage";
import { Link } from "react-router-dom";

export default function Assurance() {
  return (
    <StaticPage
      title="Assurance & garanties"
      subtitle="Ce que couvre votre location SailingLoc, et ce que vous devez prévoir."
      lastUpdated="Juillet 2026"
    >
      <div className="space-y-8">
        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Pour les propriétaires</h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="font-medium text-navy">Assurance responsabilité civile obligatoire</p>
              <p className="mt-1 text-sm text-gray-600">
                Tout propriétaire doit disposer d'une assurance responsabilité civile nautique valide, couvrant à minima les dommages causés à des tiers lors de la location. Ce document est vérifié par notre équipe avant toute publication.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="font-medium text-navy">Assurance coque recommandée</p>
              <p className="mt-1 text-sm text-gray-600">
                Nous recommandons fortement une assurance coque couvrant les dommages au bateau lui-même pendant la période de location. Vérifiez que votre contrat d'assurance actuel couvre les locations entre particuliers — certains contrats l'excluent explicitement.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="font-medium text-navy">Dépôt de garantie</p>
              <p className="mt-1 text-sm text-gray-600">
                Le propriétaire peut exiger un dépôt de garantie dont le montant est fixé librement dans son annonce. Il doit être mentionné clairement avant la réservation et est restitué dans un délai de 7 jours après la fin de la location en l'absence de dommages constatés.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Pour les locataires</h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="font-medium text-navy">Responsabilité civile locataire</p>
              <p className="mt-1 text-sm text-gray-600">
                En tant que locataire, vous êtes responsable des dommages que vous pourriez causer à des tiers avec le bateau loué. Vérifiez que votre contrat d'assurance habitation ou auto inclut une clause de responsabilité civile nautique, ou souscrivez une assurance spécifique.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="font-medium text-navy">Contrat de location inclus</p>
              <p className="mt-1 text-sm text-gray-600">
                Chaque réservation génère automatiquement un contrat de location PDF précisant les conditions, les responsabilités de chaque partie, le montant de la caution et la politique d'annulation. Ce document a valeur légale.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Garanties SailingLoc</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              { icon: "💳", titre: "Paiement sécurisé", desc: "Stripe & PayPal, PCI-DSS niveau 1" },
              { icon: "📄", titre: "Contrat automatique", desc: "PDF généré dès la confirmation" },
              { icon: "↩️", titre: "Remboursement garanti", desc: "Si annulation dans les délais" },
            ].map((g) => (
              <div key={g.titre} className="rounded-xl bg-cloud p-4 text-center">
                <p className="text-3xl">{g.icon}</p>
                <p className="mt-2 font-semibold text-navy text-sm">{g.titre}</p>
                <p className="mt-1 text-xs text-gray-500">{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ SailingLoc n'est pas un assureur et ne fournit pas directement de couverture d'assurance. Nous vérifions les documents fournis par les propriétaires, mais nous ne garantissons pas l'étendue de leur couverture. Consultez un assureur nautique pour toute question spécifique.
        </div>

        <p className="text-sm text-gray-600">
          Des questions ? Consulte notre <Link to="/aide" className="font-medium text-sky">Centre d'aide</Link> ou écris-nous à <a href="mailto:contact@sailingloc.fr" className="font-medium text-sky">contact@sailingloc.fr</a>.
        </p>
      </div>
    </StaticPage>
  );
}
