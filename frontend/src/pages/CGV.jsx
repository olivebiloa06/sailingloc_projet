import StaticPage from "../components/StaticPage";

export default function CGV() {
  return (
    <StaticPage
      title="Conditions Générales de Vente"
      subtitle="Modalités applicables aux réservations effectuées sur SailingLoc."
      lastUpdated="Septembre 2026"
    >
      <div className="space-y-8 text-sm text-gray-700">

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Objet</h2>
          <p>Les présentes Conditions Générales de Vente (CGV) définissent les modalités de réservation et de paiement applicables lorsqu'un locataire réserve un bateau auprès d'un propriétaire via la plateforme SailingLoc. Elles complètent les Conditions Générales d'Utilisation.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Processus de réservation</h2>
          <p>La réservation d'un bateau se déroule en plusieurs étapes : sélection des dates et du nombre de voyageurs sur la fiche du bateau, création d'une demande de réservation, échange éventuel avec le propriétaire via la messagerie intégrée, puis règlement du montant dû pour confirmer la réservation. La réservation n'est définitivement confirmée qu'après validation du paiement.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Prix et frais de service</h2>
          <p>Le prix affiché sur chaque annonce correspond à la location du bateau entier pour la période choisie (tarif journalier × nombre de jours), fixé librement par le propriétaire. Des frais de service de 10 % du montant de la location sont ajoutés au moment du paiement et perçus par SailingLoc en contrepartie de la mise en relation, du paiement sécurisé et de la génération automatique du contrat de location.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Paiement</h2>
          <p>Le paiement s'effectue en ligne, par les moyens proposés sur la plateforme. Les données de paiement transitent par un prestataire de paiement tiers ; SailingLoc ne stocke aucune donnée bancaire. Les fonds sont reversés au propriétaire une fois la location honorée, déduction faite des frais de service.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Contrat de location</h2>
          <p>Un contrat de location est généré automatiquement entre le propriétaire et le locataire dès qu'une réservation est confirmée. Ce contrat régit les modalités précises de la location (prise en main du bateau, état des lieux, restitution) ; SailingLoc n'est pas partie à ce contrat mais en assure la génération et l'archivage.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Annulation et remboursement</h2>
          <p>Sauf condition particulière indiquée par le propriétaire sur son annonce, une annulation à l'initiative du locataire est possible gratuitement jusqu'à 48 heures avant la date de début de la location. Passé ce délai, les conditions d'annulation du propriétaire s'appliquent. En cas d'annulation à l'initiative du propriétaire, le locataire est intégralement remboursé.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Droit de rétractation</h2>
          <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux prestations de location de bateau réalisées à une date ou selon une périodicité déterminée, la réservation portant sur une prestation d'hébergement/location fournie à une date précise.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Responsabilité</h2>
          <p>Le propriétaire est seul responsable de la conformité du bateau à l'annonce publiée, de sa navigabilité et de la validité de ses documents (assurance, certificat de navigation). Le locataire est responsable de l'usage qu'il fait du bateau pendant la durée de la location, dans le respect des règles de navigation en vigueur. SailingLoc, en tant qu'intermédiaire, ne saurait être tenu responsable des dommages survenus pendant la location.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Litiges et médiation</h2>
          <p>En cas de litige relatif à une réservation, les utilisateurs sont invités à se rapprocher du service client SailingLoc via la page Contact. À défaut de résolution amiable, tout litige de consommation pourra être soumis à un médiateur de la consommation, conformément aux articles L611-1 et suivants du Code de la consommation. Les présentes CGV sont soumises au droit français.</p>
        </section>

      </div>
    </StaticPage>
  );
}
