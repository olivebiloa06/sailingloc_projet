import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import BoatMark from "../components/BoatMark";
import { usePageMeta } from "../hooks/usePageMeta";

const VALEURS = [
  { icon: "🛡️", titre: "Confiance", desc: "Profils vérifiés, documents contrôlés par notre équipe avant toute publication." },
  { icon: "💳", titre: "Sécurité", desc: "Paiements sécurisés PCI-DSS via Stripe et PayPal. Aucune donnée bancaire stockée." },
  { icon: "📄", titre: "Transparence", desc: "Contrat de location généré automatiquement après chaque réservation confirmée." },
  { icon: "⚖️", titre: "Équité", desc: "Commission fixe de 10 % sur chaque transaction. Aucun frais caché." },
  { icon: "♿", titre: "Accessibilité", desc: "Plateforme conçue pour être simple d'utilisation, quel que soit le profil nautique." },
  { icon: "⛵", titre: "Passion", desc: "Née de la passion du nautisme, SailingLoc met la mer à la portée de tous." },
];

const EQUIPE = [
  { prenom: "Olive", nom: "BILOA", role: "Chef de projet digital & Développeuse Full Stack", initiales: "OB" },
  { prenom: "Massylia", nom: "SAHI", role: "Développeuse Full Stack", initiales: "MS" },
  { prenom: "Ayman", nom: "AABIYDA", role: "Développeur Full Stack", initiales: "AA" },
];

const FAQ = [
  {
    q: "Comment fonctionne SailingLoc ?",
    r: "SailingLoc met en relation des propriétaires de bateaux avec des locataires. Le propriétaire publie son annonce, le locataire réserve en ligne, le paiement est sécurisé et un contrat est généré automatiquement.",
  },
  {
    q: "Qui peut publier un bateau ?",
    r: "Tout particulier propriétaire d'un bateau, après vérification de ses documents (pièce d'identité et assurance responsabilité civile) par notre équipe.",
  },
  {
    q: "Comment sont sécurisés les paiements ?",
    r: "Via Stripe et PayPal, deux prestataires certifiés PCI-DSS. SailingLoc ne stocke aucune donnée bancaire. Le locataire n'est débité qu'après acceptation par le propriétaire.",
  },
  {
    q: "Quelle est la politique d'annulation ?",
    r: "Annulation gratuite jusqu'à 48 heures avant le départ. Au-delà, nous te invitons à contacter directement le propriétaire.",
  },
  {
    q: "SailingLoc est-il conforme au RGPD ?",
    r: "Oui. Les données personnelles sont traitées dans le respect du RGPD et des recommandations de la CNIL. Elles sont hébergées en France (OVH, Gravelines).",
  },
];

export default function APropos() {

    // SEO meta tags

usePageMeta({ title: "À propos", 
  description: "Découvrez l'équipe SailingLoc et notre mission.", 
  url: "/a-propos" });

  return (
    <div className="bg-cloud">
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <BoatMark className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-heading text-4xl font-semibold sm:text-5xl">
              À propos de SailingLoc
            </h1>
            <p className="mt-4 text-lg text-white/70">
              La plateforme de location de bateaux entre particuliers, pensée
              pour rendre la mer accessible à tous, en toute confiance.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-navy">Notre mission</h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              SailingLoc est né d'un constat simple : louer un bateau entre particuliers est
              souvent compliqué, opaque et risqué. Les circuits traditionnels sont coûteux,
              les garanties insuffisantes, et la confiance difficile à établir.
            </p>
            <p className="mt-3 leading-relaxed text-gray-600">
              Notre mission est de changer ça — en proposant une plateforme digitale complète,
              sécurisée et transparente, qui gère l'ensemble du parcours : de la consultation
              des annonces jusqu'au contrat de location, en passant par la vérification des
              profils, le paiement sécurisé et le suivi des transactions.
            </p>
            <p className="mt-3 leading-relaxed text-gray-600">
              À moyen terme, SailingLoc ambitionne de devenir une référence européenne de la
              location de bateaux entre particuliers, avec une extension progressive vers une
              application mobile.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-14">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-navy">Nos valeurs</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALEURS.map((v, i) => (
              <Reveal key={v.titre} delay={i * 60}>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                  <span className="text-3xl">{v.icon}</span>
                  <h3 className="mt-3 font-heading text-base font-semibold text-navy">{v.titre}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-navy">L'équipe</h2>
            <p className="mt-2 text-sm text-gray-500">
              SailingLoc est développé par l'agence Pandawan — SARL spécialisée en
              développement de solutions digitales et projets IA, fondée en 2014.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {EQUIPE.map((membre, i) => (
              <Reveal key={membre.nom} delay={i * 80}>
                <div className="rounded-xl border border-gray-100 bg-cloud p-5 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy to-sky font-heading text-lg font-bold text-white">
                    {membre.initiales}
                  </div>
                  <p className="mt-3 font-heading text-sm font-semibold text-navy">
                    {membre.prenom} {membre.nom}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{membre.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-navy">Questions fréquentes</h2>
          </Reveal>
          <div className="mt-6 space-y-3">
            {FAQ.map((item, i) => (
              <Reveal key={i} delay={i * 50}>
                <details className="group rounded-xl border border-gray-100 bg-white">
                  <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-navy">
                    {item.q}
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </summary>
                  <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{item.r}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Infos légales */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-navy">Mentions légales</h2>
          </Reveal>
          <div className="mt-6 grid gap-6 text-sm text-gray-600 sm:grid-cols-2">
            <div>
              <p className="font-semibold text-navy">SailingLoc (client)</p>
              <p>Forme juridique : SAS</p>
              <p>Siège social : Paris, France</p>
              <p>Code APE : 7721Z – Location d'articles de loisirs</p>
              <p>SIREN : En cours d'immatriculation</p>
              <p>Email : contact@sailingloc.fr</p>
            </div>
            <div>
              <p className="font-semibold text-navy">Agence Pandawan (maître d'œuvre)</p>
              <p>Forme juridique : SARL</p>
              <p>Fondée en : 2014</p>
              <p>Siège social : France</p>
              <p>Code APE : 6201Z – Programmation informatique</p>
              <p>Email : contact@pandawan.fr</p>
            </div>
            <div className="sm:col-span-2">
              <p className="font-semibold text-navy">Hébergement</p>
              <p>OVH SAS — 2 rue Kellermann, 59100 Roubaix, France</p>
              <p>Serveur : VPS Comfort — Datacenter Gravelines, France</p>
              <p>Les données personnelles sont traitées conformément au RGPD.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-14 text-white">
        <Reveal>
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="font-heading text-2xl font-semibold">Prêt à naviguer ?</h2>
            <p className="mt-3 text-white/70">
              Rejoins des milliers de plaisanciers qui font confiance à SailingLoc.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/boats"
                className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-navy transition hover:bg-cloud"
              >
                Trouver un bateau
              </Link>
              <Link
                to="/register?role=proprietaire"
                className="rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Mettre mon bateau en location
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
