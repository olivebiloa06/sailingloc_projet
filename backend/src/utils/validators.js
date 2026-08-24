// Fonctions de validation métier partagées entre les contrôleurs et les
// tests unitaires — extraites ici pour que les tests vérifient le code
// réellement exécuté en production, pas une copie.

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Reprend exactement les règles historiques de authController.js (longueur,
// majuscule, chiffre, caractère spécial) sous une forme testable, en gardant
// un message par règle pour ne pas perdre le détail affiché à l'utilisateur.
function validatePasswordFormat(motDePasse) {
  if (!motDePasse || motDePasse.length < 8) {
    return { valid: false, message: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (!/[A-Z]/.test(motDePasse)) {
    return { valid: false, message: "Le mot de passe doit contenir au moins une majuscule." };
  }
  if (!/[0-9]/.test(motDePasse)) {
    return { valid: false, message: "Le mot de passe doit contenir au moins un chiffre." };
  }
  if (!/[^A-Za-z0-9]/.test(motDePasse)) {
    return { valid: false, message: "Le mot de passe doit contenir au moins un caractère spécial." };
  }
  return { valid: true, message: null };
}

function isValidPrix(prix) {
  const n = Number(prix);
  return !isNaN(n) && n > 0 && n <= 100000;
}

function isValidCapacite(capacite) {
  const n = Number(capacite);
  return Number.isInteger(n) && n >= 1 && n <= 50;
}

function isValidLongueur(longueur) {
  const n = Number(longueur);
  return !isNaN(n) && n > 0 && n <= 200;
}

const BOAT_TYPES = ["voilier", "catamaran", "bateau_moteur", "yacht", "semi_rigide", "autre"];

function isValidBoatType(type) {
  return BOAT_TYPES.includes(type);
}

function chevauchementDates(debut1, fin1, debut2, fin2) {
  const s1 = new Date(debut1);
  const e1 = new Date(fin1);
  const s2 = new Date(debut2);
  const e2 = new Date(fin2);
  return s1 < e2 && s2 < e1;
}

function datesDansPlage(dateDebut, dateFin, plageDebut, plageFin) {
  return new Date(dateDebut) >= new Date(plageDebut) && new Date(dateFin) <= new Date(plageFin);
}

module.exports = {
  isValidEmail,
  validatePasswordFormat,
  isValidPrix,
  isValidCapacite,
  isValidLongueur,
  isValidBoatType,
  BOAT_TYPES,
  chevauchementDates,
  datesDansPlage,
};
