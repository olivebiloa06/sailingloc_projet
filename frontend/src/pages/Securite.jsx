import StaticPage from "../components/StaticPage";

const MESURES = [
  { icon: "🔒", titre: "HTTPS & chiffrement", desc: "Toutes les communications entre ton navigateur et nos serveurs sont chiffrées via HTTPS. Notre certificat SSL est fourni par Let's Encrypt, avec renouvellement automatique. La politique HSTS empêche tout accès non sécurisé." },
  { icon: "🪙", titre: "Paiements PCI-DSS", desc: "Les paiements sont traités exclusivement par Stripe et PayPal, deux prestataires certifiés PCI-DSS niveau 1 (le niveau de sécurité le plus élevé pour les transactions en ligne). SailingLoc ne stocke aucune donnée bancaire." },
  { icon: "🛡️", titre: "Profils vérifiés", desc: "Avant de publier une annonce, chaque propriétaire doit soumettre une pièce d'identité et une attestation d'assurance. Notre équipe valide manuellement ces documents. Un bateau sans documents validés ne peut pas être publié." },
  { icon: "📄", titre: "Contrat systématique", desc: "Chaque réservation confirmée génère automatiquement un contrat de location PDF, signé électroniquement, accessible par les deux parties. Ce document définit clairement les droits et obligations de chacun." },
  { icon: "🔑", titre: "Authentification sécurisée", desc: "Nous utilisons des tokens JWT de courte durée (15 minutes) combinés à un token de rafraîchissement httpOnly — inaccessible par JavaScript — pour protéger les sessions contre les attaques XSS." },
  { icon: "🚫", titre: "Protection des attaques courantes", desc: "Helmet.js, politique Content Security Policy (CSP), protection CSRF via cookies SameSite, rate limiting sur les routes sensibles (5 tentatives max par 15 min). Les données sont accédées via Sequelize ORM, protégé par défaut contre les injections SQL." },
  { icon: "🇫🇷", titre: "Hébergement France & RGPD", desc: "Nos serveurs sont hébergés en France par OVH (Gravelines, Nord), dans le strict respect du RGPD et des recommandations de la CNIL. Vos données ne quittent jamais le territoire européen." },
  { icon: "💾", titre: "Sauvegardes quotidiennes", desc: "La base de données est sauvegardée automatiquement chaque jour. Les sauvegardes sont conservées 30 jours et peuvent être restaurées en cas d'incident." },
];

export default function Securite() {
  return (
    <StaticPage
      title="Sécurité & confiance"
      subtitle="Comment SailingLoc protège vos données, vos paiements et vos transactions."
    >
      <p className="text-sm leading-relaxed text-gray-600">
        SailingLoc est une plateforme transactionnelle. Cela signifie que nous gérons de l'argent réel, des documents sensibles et des contrats légaux entre particuliers. La sécurité n'est pas une option — c'est le fondement de notre modèle.
      </p>

      <div className="mt-6 space-y-4">
        {MESURES.map((m) => (
          <div key={m.titre} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <span className="mt-0.5 text-2xl">{m.icon}</span>
            <div>
              <p className="font-heading text-sm font-semibold text-navy">{m.titre}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-green-50 p-5 text-sm text-green-800">
        <p className="font-semibold">✅ Notre engagement</p>
        <p className="mt-1">
          En cas de problème de sécurité, notre équipe intervient sous 4 heures (SLA P1). Tout incident majeur est communiqué aux utilisateurs concernés dans les 72 heures, conformément au RGPD.
        </p>
      </div>
    </StaticPage>
  );
}
