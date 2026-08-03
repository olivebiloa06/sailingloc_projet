import { Link } from "react-router-dom";
import StaticPage from "../components/StaticPage";
import { usePublishBoatLink } from "../hooks/usePublishBoatLink";

const ETAPES = [
  { num: "01", titre: "Créer votre compte propriétaire", desc: "Inscris-toi et choisis le rôle \"Propriétaire\". Tu devras soumettre une pièce d'identité et une attestation d'assurance. Notre équipe valide ces documents sous 24h." },
  { num: "02", titre: "Renseigner la fiche de votre bateau", desc: "Ajoute les caractéristiques techniques (type, longueur, capacité), une description complète, des photos de qualité et ton tarif journalier. Plus la fiche est complète, plus elle est consultée." },
  { num: "03", titre: "Définir vos disponibilités", desc: "Depuis \"Mes bateaux\" → \"Disponibilités\", publie les périodes où ton bateau est disponible à la location. Tu peux les modifier à tout moment." },
  { num: "04", titre: "Gérer les demandes de réservation", desc: "Tu reçois les demandes dans ton espace propriétaire. Tu as 24h pour accepter ou refuser. Si tu acceptes, le locataire procède au paiement. Tu n'es jamais prélevé directement — tu reçois ta part après la location." },
  { num: "05", titre: "Percevoir tes revenus", desc: "Après chaque location confirmée, ton revenu net (montant total − 10 % de commission SailingLoc) est visible dans ton tableau de bord. Le virement est effectué sous 5 jours ouvrés après la fin de la location." },
];

const CONSEILS = [
  { icon: "📸", titre: "Soigne les photos", desc: "Les annonces avec 5 photos ou plus reçoivent 3x plus de demandes. Photographie l'extérieur, le cockpit, le poste de pilotage, la cuisine et les couchettes." },
  { icon: "✏️", titre: "Décris précisément", desc: "Mentionne l'équipement (GPS, radio VHF, gilets, annexe...), les conditions de location (permis requis ou non, carburant, dépôt de garantie) et les ports d'attache." },
  { icon: "⚡", titre: "Réponds vite", desc: "Les propriétaires qui répondent sous 2h ont un taux d'acceptation 40 % supérieur. Active les notifications pour ne manquer aucune demande." },
  { icon: "💰", titre: "Prix compétitif", desc: "Consulte les annonces similaires dans ta zone géographique pour calibrer ton tarif. Un prix légèrement en dessous du marché au démarrage permet d'obtenir les premiers avis rapidement." },
];

export default function RessourcesProprietaires() {
  const publishBoatLink = usePublishBoatLink();
  return (
    <StaticPage
      title="Ressources propriétaires"
      subtitle="Tout ce qu'il faut savoir pour louer votre bateau en toute sérénité sur SailingLoc."
    >
      <div className="space-y-10">
        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Comment ça fonctionne ?</h2>
          <div className="mt-4 space-y-4">
            {ETAPES.map((e) => (
              <div key={e.num} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4">
                <span className="font-heading text-2xl font-bold text-sable">{e.num}</span>
                <div>
                  <p className="font-semibold text-navy">{e.titre}</p>
                  <p className="mt-1 text-sm text-gray-600">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Conseils pour bien louer</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CONSEILS.map((c) => (
              <div key={c.titre} className="rounded-xl border border-gray-100 bg-white p-4">
                <span className="text-2xl">{c.icon}</span>
                <p className="mt-2 font-semibold text-navy text-sm">{c.titre}</p>
                <p className="mt-1 text-xs text-gray-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-navy p-6 text-white">
          <p className="font-heading text-base font-semibold">Prêt à rentabiliser votre bateau ?</p>
          <p className="mt-2 text-sm text-white/70">
            Un voilier de 9 mètres loué 4 semaines par saison génère en moyenne 6 800 € de revenus nets — de quoi couvrir 70 % des frais annuels d'entretien.
          </p>
          <Link
            to={publishBoatLink}
            className="mt-4 inline-block rounded-lg bg-white px-5 py-2 text-sm font-semibold text-navy hover:bg-cloud"
          >
            Créer mon annonce gratuitement
          </Link>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-navy">Documents obligatoires</h2>
          <p className="mt-2 text-sm text-gray-600">
            Pour publier une annonce, tu dois fournir :
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>✅ Pièce d'identité valide (CNI ou passeport)</li>
            <li>✅ Attestation d'assurance responsabilité civile nautique (moins de 3 mois)</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            Des questions sur les assurances ? Consulte notre page <Link to="/assurance" className="text-sky">Assurance & garanties</Link>.
          </p>
        </section>
      </div>
    </StaticPage>
  );
}
