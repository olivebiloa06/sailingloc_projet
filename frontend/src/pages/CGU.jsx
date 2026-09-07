import StaticPage from "../components/StaticPage";

export default function CGU() {
  return (
    <StaticPage
      title="Conditions Générales d'Utilisation"
      subtitle="Règles d'utilisation de la plateforme SailingLoc."
      lastUpdated="Septembre 2026"
    >
      <div className="space-y-8 text-sm text-gray-700">

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Objet</h2>
          <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site et de l'application SailingLoc, plateforme de mise en relation entre propriétaires de bateaux et locataires pour la location entre particuliers. L'utilisation du site implique l'acceptation pleine et entière des présentes CGU.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Accès au service et création de compte</h2>
          <p>L'accès à la consultation des annonces est libre. La réservation d'un bateau, la publication d'une annonce ou l'utilisation de la messagerie nécessitent la création d'un compte, réservé aux personnes physiques majeures capables de contracter.</p>
          <p className="mt-3">Chaque utilisateur est responsable de l'exactitude des informations fournies lors de son inscription et de la confidentialité de ses identifiants. Toute activité effectuée depuis un compte est présumée effectuée par son titulaire.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Vérification d'identité des propriétaires</h2>
          <p>Avant de pouvoir publier une annonce, tout propriétaire doit transmettre au moins un document d'identité ou d'assurance valide, vérifié par l'équipe SailingLoc. Cette vérification vise à limiter les usurpations d'identité et les annonces frauduleuses, mais ne constitue pas une garantie absolue quant à l'exactitude des informations fournies par l'utilisateur.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Comportement des utilisateurs</h2>
          <p>Chaque utilisateur s'engage à :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>fournir des informations exactes et à jour ;</li>
            <li>ne publier que des annonces relatives à des bateaux qu'il est habilité à proposer à la location ;</li>
            <li>respecter les autres utilisateurs dans ses échanges via la messagerie et les avis ;</li>
            <li>ne pas détourner le service à des fins frauduleuses, illicites ou contraires à sa destination.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Rôle de SailingLoc</h2>
          <p>SailingLoc agit en qualité d'intermédiaire technique mettant en relation propriétaires et locataires. SailingLoc n'est ni propriétaire, ni locataire, ni partie au contrat de location conclu entre les utilisateurs. SailingLoc se réserve le droit de suspendre ou de supprimer tout compte ou toute annonce ne respectant pas les présentes CGU, sans préavis en cas de manquement grave.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Avis et évaluations</h2>
          <p>Seuls les utilisateurs ayant effectivement réalisé une réservation confirmée ou terminée peuvent laisser un avis sur un bateau. Les avis publiés engagent la responsabilité de leur auteur ; SailingLoc se réserve le droit de retirer tout avis manifestement diffamatoire, injurieux ou sans rapport avec l'expérience de location.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Propriété intellectuelle</h2>
          <p>La structure du site, ainsi que les textes, graphismes, logos et code source qui le composent sont la propriété de SailingLoc, sauf mention contraire. Toute reproduction non autorisée est interdite. Les photographies et descriptions des bateaux publiées par les propriétaires restent leur propriété ; en les publiant, le propriétaire concède à SailingLoc un droit d'affichage nécessaire au fonctionnement du service.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Modification des CGU</h2>
          <p>SailingLoc peut modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle ; la poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Droit applicable</h2>
          <p>Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité avant toute action judiciaire, les tribunaux français demeurant seuls compétents à défaut d'accord.</p>
        </section>

      </div>
    </StaticPage>
  );
}
