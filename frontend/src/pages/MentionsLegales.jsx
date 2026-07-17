import StaticPage from "../components/StaticPage";

export default function MentionsLegales() {
  return (
    <StaticPage
      title="Mentions légales"
      subtitle="Informations légales relatives à la plateforme SailingLoc."
      lastUpdated="Juillet 2026"
    >
      <div className="space-y-8 text-sm text-gray-700">

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Éditeur du site</h2>
          <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 space-y-1">
            <p><strong>Dénomination sociale :</strong> SailingLoc</p>
            <p><strong>Forme juridique :</strong> Société par Actions Simplifiée (SAS)</p>
            <p><strong>Siège social :</strong> Paris, France</p>
            <p><strong>Code APE / NAF :</strong> 7721Z – Location et location-bail d'articles de loisirs et de sport</p>
            <p><strong>SIREN :</strong> En cours d'immatriculation</p>
            <p><strong>SIRET :</strong> En cours d'immatriculation</p>
            <p><strong>Numéro de TVA intracommunautaire :</strong> À définir</p>
            <p><strong>Directeur de la publication :</strong> M. Voisin (Fondateur)</p>
            <p><strong>Email :</strong> contact@sailingloc.fr</p>
            <p><strong>Téléphone :</strong> +33 6 00 00 00 00</p>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Maître d'œuvre (développement)</h2>
          <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 space-y-1">
            <p><strong>Dénomination sociale :</strong> Agence Pandawan</p>
            <p><strong>Forme juridique :</strong> Société à Responsabilité Limitée (SARL)</p>
            <p><strong>Année de création :</strong> 2014</p>
            <p><strong>Siège social :</strong> France</p>
            <p><strong>Code APE / NAF :</strong> 6201Z – Programmation informatique</p>
            <p><strong>Activité :</strong> Développement de solutions digitales et projets IA</p>
            <p><strong>Email :</strong> contact@pandawan.fr</p>
            <p><strong>Maintenance :</strong> maintenance@pandawan.fr</p>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Hébergement</h2>
          <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 space-y-1">
            <p><strong>Hébergeur :</strong> OVH SAS</p>
            <p><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
            <p><strong>Serveur :</strong> VPS Comfort — 4 vCPU / 8 Go RAM / 160 Go SSD NVMe</p>
            <p><strong>Datacenter :</strong> Gravelines, France</p>
            <p><strong>Conformité RGPD :</strong> Hébergement sur territoire français</p>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Propriété intellectuelle</h2>
          <p>L'ensemble des éléments composant le site SailingLoc (textes, images, logos, code source, architecture) sont la propriété exclusive de SailingLoc et de l'agence Pandawan. Toute reproduction, représentation, modification ou exploitation, même partielle, sans autorisation préalable et écrite est strictement interdite.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Responsabilité</h2>
          <p>SailingLoc agit en tant que tiers de confiance facilitant la mise en relation entre propriétaires et locataires de bateaux. SailingLoc ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le site, ni des transactions réalisées entre les utilisateurs.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Droit applicable et juridiction</h2>
          <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
        </section>

      </div>
    </StaticPage>
  );
}
