// Script de seed — peuple la base avec des propriétaires et des bateaux de
// démonstration, réalistes, couvrant toutes les destinations et tous les
// types de bateau utilisés sur la page d'accueil (pour que les cartes
// "Top destinations" et "Bateau" renvoient de vrais résultats au lieu d'une
// liste vide).
//
// ⚠️ À usage de DÉMO / DÉVELOPPEMENT UNIQUEMENT. Ne JAMAIS lancer ce script
// contre une base de production : il crée de vrais comptes avec un mot de
// passe connu (DEMO_PASSWORD ci-dessous).
//
// Usage : npm run seed (depuis backend/), ou node src/seeders/seed.js
//
// Idempotent : peut être relancé plusieurs fois sans créer de doublons
// (findOrCreate sur l'email des propriétaires et sur nom+propriétaire pour
// les bateaux).

require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, Boat, Availability } = require("../models");

const DEMO_PASSWORD = "Demo12345";

const OWNERS = [
  { nom: "Martin", prenom: "Sophie", email: "sophie.martin@demo.sailingloc.com" },
  { nom: "Dubois", prenom: "Thomas", email: "thomas.dubois@demo.sailingloc.com" },
  { nom: "Bernard", prenom: "Léa", email: "lea.bernard@demo.sailingloc.com" },
  { nom: "Rossi", prenom: "Marco", email: "marco.rossi@demo.sailingloc.com" },
];

// localisation contient toujours, en toutes lettres, le mot-clé utilisé par
// les filtres de la page d'accueil (voir DESTINATIONS dans Home.jsx) : c'est
// ce qui fait que cliquer une carte "Top destinations" renvoie un résultat.
const BOATS = [
  { ownerIndex: 0, nom: "Échappée Atlantique", type: "voilier", localisation: "La Rochelle", description: "Voilier de croisière confortable, idéal pour découvrir le bassin de La Rochelle et l'Île de Ré.", prixJour: 190, capacite: 6, longueur: 8.5, avecSkipper: false },
  { ownerIndex: 0, nom: "Le Corsaire", type: "semi_rigide", localisation: "La Rochelle", description: "Semi-rigide rapide et maniable pour une sortie à la journée sur la côte atlantique.", prixJour: 95, capacite: 4, longueur: 5.2, avecSkipper: false },
  { ownerIndex: 0, nom: "Pédal'Eau", type: "autre", localisation: "La Rochelle", description: "Petite embarcation simple, parfaite pour une balade tranquille en famille dans le port.", prixJour: 45, capacite: 2, longueur: 3, avecSkipper: false },

  { ownerIndex: 2, nom: "Îlienne", type: "voilier", localisation: "Golfe du Morbihan", description: "Voilier idéal pour naviguer entre les îles du Golfe du Morbihan au fil de l'eau.", prixJour: 210, capacite: 6, longueur: 9.2, avecSkipper: false },
  { ownerIndex: 2, nom: "Cat'Armor", type: "catamaran", localisation: "Golfe du Morbihan", description: "Catamaran spacieux et stable, avec skipper inclus pour découvrir les 40 îles du golfe sans souci.", prixJour: 320, capacite: 8, longueur: 11, avecSkipper: true },

  { ownerIndex: 1, nom: "Riviera Gold", type: "yacht", localisation: "Côte d'Azur", description: "Yacht haut de gamme avec skipper, pour une expérience d'exception entre Saint-Tropez et Cannes.", prixJour: 950, capacite: 10, longueur: 14, avecSkipper: true },
  { ownerIndex: 1, nom: "Azur Sport", type: "bateau_moteur", localisation: "Côte d'Azur", description: "Bateau à moteur rapide pour explorer les criques de la Côte d'Azur à son rythme.", prixJour: 280, capacite: 6, longueur: 7, avecSkipper: false },

  { ownerIndex: 1, nom: "Phocéenne", type: "voilier", localisation: "Marseille", description: "Voilier au départ du Vieux-Port, parfait pour rejoindre les Calanques en une journée.", prixJour: 175, capacite: 6, longueur: 8, avecSkipper: false },
  { ownerIndex: 1, nom: "Calypso Sud", type: "semi_rigide", localisation: "Marseille", description: "Semi-rigide léger pour se glisser dans les criques étroites des Calanques de Marseille.", prixJour: 140, capacite: 5, longueur: 6, avecSkipper: false },

  { ownerIndex: 1, nom: "Bonifacio Spirit", type: "voilier", localisation: "Corse", description: "Voilier pour explorer les eaux cristallines entre Bonifacio et Porto-Vecchio.", prixJour: 220, capacite: 6, longueur: 9, avecSkipper: false },
  { ownerIndex: 1, nom: "Île de Beauté", type: "catamaran", localisation: "Corse", description: "Catamaran avec skipper pour profiter de la Corse sans se soucier de la navigation.", prixJour: 380, capacite: 8, longueur: 12, avecSkipper: true },

  { ownerIndex: 0, nom: "Banc d'Arguin", type: "voilier", localisation: "Bassin d'Arcachon", description: "Voilier doux pour naviguer face à la dune du Pilat, sur le Bassin d'Arcachon.", prixJour: 165, capacite: 5, longueur: 7.5, avecSkipper: false },
  { ownerIndex: 0, nom: "Pilat Breeze", type: "semi_rigide", localisation: "Bassin d'Arcachon", description: "Semi-rigide maniable, parfait pour une sortie courte sur le Bassin d'Arcachon.", prixJour: 110, capacite: 5, longueur: 5.5, avecSkipper: false },

  { ownerIndex: 3, nom: "Mediterráneo", type: "catamaran", localisation: "Îles Baléares", description: "Catamaran avec skipper pour découvrir Majorque, Minorque et Ibiza en toute sérénité.", prixJour: 420, capacite: 10, longueur: 13, avecSkipper: true },
  { ownerIndex: 3, nom: "Ibiza Nights", type: "bateau_moteur", localisation: "Îles Baléares", description: "Bateau à moteur idéal pour une sortie festive autour d'Ibiza et Formentera.", prixJour: 310, capacite: 7, longueur: 8, avecSkipper: false },

  { ownerIndex: 3, nom: "Amalfi Dream", type: "yacht", localisation: "Côte amalfitaine", description: "Yacht avec skipper pour une expérience d'exception face aux falaises de la Côte amalfitaine.", prixJour: 1100, capacite: 10, longueur: 15, avecSkipper: true },

  { ownerIndex: 3, nom: "Adriatic Wind", type: "voilier", localisation: "Croatie", description: "Voilier pour explorer les plus de 1000 îles de l'Adriatique croate.", prixJour: 240, capacite: 7, longueur: 10, avecSkipper: false },
  { ownerIndex: 3, nom: "Dalmatian Cat", type: "catamaran", localisation: "Croatie", description: "Catamaran avec skipper pour naviguer confortablement le long de la côte dalmate.", prixJour: 360, capacite: 9, longueur: 12.5, avecSkipper: true },
];

async function seed() {
  await sequelize.authenticate();
  console.log("Connexion à la base réussie. Démarrage du seed...");

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const ownerRecords = [];

  for (const owner of OWNERS) {
    const [user] = await User.unscoped().findOrCreate({
      where: { email: owner.email },
      defaults: {
        nom: owner.nom,
        prenom: owner.prenom,
        email: owner.email,
        motDePasse: hashedPassword,
        role: "proprietaire",
      },
    });
    ownerRecords.push(user);
  }
  console.log(`${ownerRecords.length} propriétaires de démonstration prêts.`);

  let createdCount = 0;
  let availabilityCreatedCount = 0;

  for (const boat of BOATS) {
    const owner = ownerRecords[boat.ownerIndex];
    const [boatRecord, created] = await Boat.findOrCreate({
      where: { nom: boat.nom, userId: owner.id },
      defaults: {
        type: boat.type,
        description: boat.description,
        localisation: boat.localisation,
        prixJour: boat.prixJour,
        capacite: boat.capacite,
        longueur: boat.longueur,
        avecSkipper: boat.avecSkipper,
        statut: "publie",
        userId: owner.id,
      },
    });
    if (created) createdCount += 1;

    // Sans ça, un bateau créé n'a aucune disponibilité publiée : impossible
    // de le réserver, et rien à afficher sur les cartes ("Disponible du...").
    // On ne crée une fenêtre par défaut que si le bateau n'en a encore aucune,
    // pour rester idempotent et ne pas écraser une disponibilité existante
    // que tu aurais ajustée toi-même depuis.
    const existingAvailability = await Availability.count({
      where: { boatId: boatRecord.id },
    });

    if (existingAvailability === 0) {
      await Availability.create({
        boatId: boatRecord.id,
        dateDebut: "2026-06-21",
        dateFin: "2026-09-30",
        statut: "disponible",
      });
      availabilityCreatedCount += 1;
    }
  }
  console.log(`${BOATS.length} bateaux vérifiés, ${createdCount} créés (les autres existaient déjà).`);
  console.log(`${availabilityCreatedCount} fenêtre(s) de disponibilité créée(s) (21 juin → 30 sept. 2026).`);

  console.log("\nComptes propriétaires de démonstration (mot de passe identique pour tous) :");
  OWNERS.forEach((o) => console.log(`  - ${o.email}`));
  console.log(`  Mot de passe : ${DEMO_PASSWORD}`);

  await sequelize.close();
}

seed().catch((error) => {
  console.error("Erreur pendant le seed :", error);
  process.exit(1);
});