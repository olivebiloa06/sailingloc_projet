// Calculs et validations de réservation partagés entre bookingController.js
// et les tests unitaires — extraits ici pour que les tests vérifient le code
// réellement exécuté en production, pas une copie.

function diffJours(dateDebut, dateFin) {
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function calculerMontant(prixJour, dateDebut, dateFin) {
  const jours = diffJours(dateDebut, dateFin);
  return jours * prixJour;
}

function calculerCommission(sousTotal) {
  return Math.round(sousTotal * 0.1);
}

function calculerTotal(sousTotal) {
  return sousTotal + calculerCommission(sousTotal);
}

function validerDates(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return false;
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  return end > start;
}

function validerPersonnes(nombre, capaciteMax) {
  const n = Number(nombre);
  return Number.isInteger(n) && n >= 1 && n <= capaciteMax;
}

module.exports = {
  diffJours,
  calculerMontant,
  calculerCommission,
  calculerTotal,
  validerDates,
  validerPersonnes,
};
