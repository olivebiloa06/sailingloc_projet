import { useState } from "react";
import { Link } from "react-router-dom";
import StaticPage from "../components/StaticPage";

const TOPICS = [
  {
    cat: "🔐 Compte & connexion",
    items: [
      { q: "Comment créer un compte ?", r: "Clique sur \"Inscription\" en haut à droite. Choisis ton rôle (Locataire ou Propriétaire), remplis le formulaire et valide ton email. L'accès est immédiat pour les locataires. Pour les propriétaires, nos équipes vérifient vos documents sous 24h." },
      { q: "J'ai oublié mon mot de passe.", r: "Depuis la page de connexion, clique sur \"Mot de passe oublié ?\". Saisis ton email, tu recevras un lien valable 1 heure pour en choisir un nouveau." },
      { q: "Comment modifier mes informations personnelles ?", r: "Connecte-toi, va dans \"Mon compte\" → section profil. Tu peux modifier ton prénom, nom, email et mot de passe à tout moment." },
    ],
  },
  {
    cat: "⛵ Réservations",
    items: [
      { q: "Comment réserver un bateau ?", r: "Cherche un bateau via la barre de recherche ou les filtres, consulte la fiche détaillée, choisis tes dates et envoie ta demande. Le propriétaire a 24h pour accepter ou refuser. Tu n'es débité que si il accepte." },
      { q: "Puis-je annuler une réservation ?", r: "Oui, depuis \"Mon compte\" → \"Mes réservations\". L'annulation est gratuite jusqu'à 48h avant le départ. Au-delà, contacte directement le propriétaire pour trouver un arrangement." },
      { q: "Que se passe-t-il après la réservation ?", r: "Une fois le propriétaire accepté et le paiement validé, tu reçois un email de confirmation avec le contrat de location PDF. Le propriétaire reçoit tes coordonnées pour organiser la remise des clés." },
    ],
  },
  {
    cat: "💳 Paiements",
    items: [
      { q: "Quels moyens de paiement sont acceptés ?", r: "Carte bancaire (Visa, Mastercard, American Express) via Stripe, et PayPal. Aucun autre moyen de paiement n'est accepté pour garantir la sécurité des transactions." },
      { q: "Quand suis-je débité ?", r: "Uniquement après que le propriétaire ait accepté ta demande. Si il refuse ou ne répond pas sous 24h, aucun débit n'est effectué." },
      { q: "Comment obtenir un remboursement ?", r: "Si tu annules dans le délai autorisé (48h avant le départ), le remboursement est automatique sous 5 à 10 jours ouvrés selon ta banque. Hors délai, contacte notre support." },
    ],
  },
  {
    cat: "📄 Documents & contrats",
    items: [
      { q: "Où trouver mon contrat de location ?", r: "Depuis \"Mon compte\" → \"Mes réservations\". Clique sur la réservation concernée → bouton \"Télécharger le contrat PDF\"." },
      { q: "Quels documents dois-je fournir en tant que propriétaire ?", r: "Une pièce d'identité valide et une attestation d'assurance responsabilité civile de moins de 3 mois. Ces documents sont vérifiés par notre équipe avant la publication de vos annonces." },
    ],
  },
];

export default function Aide() {
  const [open, setOpen] = useState({});
  const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));

  return (
    <StaticPage
      title="Centre d'aide"
      subtitle="Trouve rapidement une réponse à ta question ou contacte notre équipe."
    >
      <div className="space-y-8">
        {TOPICS.map((topic) => (
          <div key={topic.cat}>
            <h2 className="mb-3 font-heading text-base font-semibold text-navy">{topic.cat}</h2>
            <div className="space-y-2">
              {topic.items.map((item, i) => {
                const key = `${topic.cat}-${i}`;
                return (
                  <details
                    key={key}
                    className="rounded-xl border border-gray-200 bg-white"
                    open={open[key]}
                    onToggle={() => toggle(key)}
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-navy">
                      {item.q}
                      <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 transition-transform ${open[key] ? "rotate-180" : ""}`} fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </summary>
                    <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{item.r}</p>
                  </details>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-2xl bg-navy p-6 text-center text-white">
          <p className="font-heading text-base font-semibold">Tu n'as pas trouvé ta réponse ?</p>
          <p className="mt-1 text-sm text-white/70">Notre équipe répond sous 24h en semaine.</p>
          <a
            href="mailto:contact@sailingloc.fr"
            className="mt-4 inline-block rounded-lg bg-white px-5 py-2 text-sm font-semibold text-navy hover:bg-cloud"
          >
            Contacter le support
          </a>
        </div>
      </div>
    </StaticPage>
  );
}
