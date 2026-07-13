// Peuple la table Articles avec les 6 articles éditoriaux de démonstration.
// À lancer UNE FOIS après avoir mis en place le modèle Article.
// Usage : npm run seed:articles (depuis backend/)

require("dotenv").config();
const { sequelize, Article } = require("../models");

const ARTICLES = [
  {
    titre: "La location de bateaux entre particuliers progresse de 23 % en France en 2025",
    categorie: "Actualités nautiques",
    extrait: "Portée par des plateformes numériques et un appétit croissant pour des vacances en mer accessibles, la France enregistre une hausse record des transactions de location nautique.",
    contenu: `En 2025, plus de 480 000 sorties en mer ont été réalisées via des plateformes de location entre particuliers en France, contre 390 000 en 2024. La Méditerranée concentre 62 % de l'activité, suivie de la côte atlantique (28 %) et de la Manche (10 %).

Ce dynamisme s'explique par plusieurs facteurs : la démocratisation des permis bateau (plus de 95 000 nouveaux permis délivrés en 2025), la hausse du prix des hébergements traditionnels qui pousse les vacanciers vers des alternatives originales, et la professionnalisation des propriétaires.

Les bateaux à moteur restent les embarcations les plus réservées (44 %), devant les voiliers (38 %) et les catamarans (18 %). La formule avec skipper connaît la plus forte progression (+31 %), plébiscitée par des locataires sans permis.

Du côté des propriétaires, le revenu moyen généré par la location atteint 6 800 € par saison (juin–septembre), couvrant en moyenne 70 % des frais d'entretien annuels d'un voilier de 9 mètres.`,
    lienBoats: "/boats",
    tempsLecture: "4 min",
    publie: true,
  },
  {
    titre: "Golfe du Morbihan : naviguer entre 40 îles, le guide complet",
    categorie: "Guide de voyage",
    extrait: "Classé parmi les plus beaux golfes du monde, le Morbihan est une mer intérieure de 20 km² parsemée d'îles et d'îlots. Un terrain de jeu exceptionnel pour les navigateurs de tous niveaux.",
    contenu: `Le Golfe du Morbihan est une mer intérieure protégée des vents de large, terrain idéal pour les navigateurs débutants comme confirmés.

Île aux Moines (5 km²) — la plus grande île du golfe, avec ses mimosas en fleurs de janvier à mars et ses ruelles pittoresques. Mouillage devant la plage de Nioul. Attention aux courants lors des marées de fort coefficient.

Île d'Arz — plus calme et moins touristique. Parfaite pour une nuit au mouillage en haute saison. Le sentier côtier fait le tour de l'île en 2h30.

Pratique : les courants dans le golfe peuvent dépasser 8 nœuds lors des grandes marées (coefficient > 90). Prévoyez vos transits aux étales ou avec le courant. La carte SHOM 7034 est indispensable.

Saison idéale : juillet-août pour la lumière et la chaleur, mais juin et septembre offrent moins de trafic et des mouillages plus tranquilles.`,
    lienBoats: "/boats?localisation=Morbihan",
    tempsLecture: "9 min",
    publie: true,
  },
  {
    titre: "Check-list complète avant votre première location de bateau",
    categorie: "Conseils de navigation",
    extrait: "Permis bateau, assurance, vérification du matériel de sécurité, météo... Tout ce qu'il faut contrôler avant de larguer les amarres pour la première fois.",
    contenu: `Louer un bateau pour la première fois peut sembler intimidant. Cette check-list couvre les points essentiels.

Documents obligatoires :
- Permis plaisance côtier (obligatoire dès 6 chevaux et à plus de 300 m des côtes)
- Pièce d'identité en cours de validité
- Attestation d'assurance responsabilité civile nautique

Matériel de sécurité à vérifier à bord :
- Gilets de sauvetage (un par personne, à la bonne taille)
- Feux de navigation fonctionnels
- VHF avec canal 16 ouvert
- Fusées de détresse en cours de validité
- Extincteur et dispositif anti-incendie
- Ancre et mouillage adapté

Météo : consultez le bulletin marin la veille ET le matin du départ. Si le vent annoncé dépasse 20 nœuds et que vous êtes débutant, reportez.

Inspection avec le propriétaire : faites le tour complet — moteur, voiles, électronique, matériel de sécurité. Notez tout dommage préexistant par écrit.`,
    lienBoats: "/boats",
    tempsLecture: "7 min",
    publie: true,
  },
  {
    titre: "Corse : les plus belles criques accessibles uniquement par la mer",
    categorie: "Destination tendance",
    extrait: "L'Île de Beauté abrite des criques d'une transparence exceptionnelle, inaccessibles par la route. Seul un bateau vous donnera accès à ces joyaux préservés du tourisme de masse.",
    contenu: `La Corse est la destination la plus convoitée des navigateurs méditerranéens. Ses eaux affichent une transparence comparable aux Caraïbes.

Cala di Tuara (entre Bonifacio et Porto-Vecchio) — longue plage de sable blanc entourée de maquis, accessible uniquement par la mer. Mouillage dans 4 à 8 mètres sur sable propre.

Cala Longa — moins fréquentée, fond mixte sable/roche, idéal pour le snorkeling.

Scandola (Réserve naturelle UNESCO) — accessible en navigation mais pas en débarquement. Les formations rocheuses volcaniques rouge-orangé sont saisissantes.

Informations pratiques : la tramontane et le libeccio sont les vents dominants en été. Les brises thermiques s'établissent en milieu de matinée (force 3-4). Respectez les zones de mouillage réglementées pour protéger les herbiers de posidonies.`,
    lienBoats: "/boats?localisation=Corse",
    tempsLecture: "6 min",
    publie: true,
  },
  {
    titre: "Croatie : itinéraire de 10 jours dans les îles dalmates",
    categorie: "Guide de voyage",
    extrait: "Split, Hvar, Korčula, Dubrovnik... Cet itinéraire vous emmène à travers les plus belles îles de la côte dalmate, avec les meilleures escales et mouillages.",
    contenu: `La côte dalmate croate compte plus de 1 200 îles, îlots et récifs. Itinéraire de 10 jours au départ de Split.

Jour 1-2 : Split → Hvar. Départ de la marina ACI. Mouillage à Palmižana ou port de Hvar-ville.

Jour 3-4 : Hvar → Vis. L'île de Vis est la plus préservée de Dalmatie. La grotte bleue de Biševo vaut le détour. Mouillage à Rukavac, très protégé.

Jour 5-6 : Vis → Korčula. La vieille ville fortifiée est quasi identique à celle de Dubrovnik. Considérée comme la patrie de Marco Polo.

Jour 7-8 : Korčula → Mljet. Le Parc National de Mljet abrite deux lacs d'eau de mer. Navigation en kayak dans les lacs recommandée.

Jour 9-10 : Mljet → Dubrovnik. L'arrivée par la mer est inoubliable.

Budget moyen : 150 à 300 € par jour pour un voilier de 10 m (carburant, ports, alimentation).`,
    lienBoats: "/boats?localisation=Croatie",
    tempsLecture: "10 min",
    publie: true,
  },
  {
    titre: "Permis bateau côtier : nouvelles modalités et tarifs 2026",
    categorie: "Actualités nautiques",
    extrait: "Depuis janvier 2026, le permis plaisance côtier peut s'obtenir en un seul examen combinant théorie et pratique. Les auto-écoles nautiques affichent complet jusqu'en août.",
    contenu: `La réforme du permis bateau, entrée en vigueur le 1er janvier 2026, simplifie la procédure tout en renforçant les exigences pratiques.

Ce qui change : l'ancienne formule séparait le QCM de l'épreuve pratique. Désormais, les deux épreuves se déroulent le même jour, avec un QCM ramené à 30 questions mais des manœuvres plus exigeantes (accostage tribord et bâbord obligatoires, man-over-board simulé).

Tarifs 2026 : la formation complète est facturée entre 550 € et 850 € selon les régions. Les auto-écoles en ligne proposent des formations au code à partir de 79 €.

Délai d'obtention : comptez 4 à 8 semaines. En haute saison, les places d'examen partent en quelques heures — inscrivez-vous tôt.

Permis hauturier : pour naviguer à plus de 6 milles d'un abri, il reste obligatoire. Il nécessite 200 milles de navigation attestés. La réforme 2026 n'en modifie pas les conditions.`,
    lienBoats: "/boats",
    tempsLecture: "5 min",
    publie: true,
  },
];

async function run() {
  await sequelize.authenticate();
  console.log("Connexion à la base réussie.");

  let count = 0;
  for (const a of ARTICLES) {
    const [, created] = await Article.findOrCreate({
      where: { titre: a.titre },
      defaults: a,
    });
    if (created) count++;
  }

  console.log(`${count} article(s) créé(s), ${ARTICLES.length - count} existaient déjà.`);
  await sequelize.close();
}

run().catch((err) => {
  console.error("Erreur :", err);
  process.exit(1);
});