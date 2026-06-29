// Rend TOUS les bateaux existants disponibles pour les tests — peu importe
// comment ils ont été créés (seed.js, ou ajoutés à la main via /mes-bateaux).
// Idempotent : un bateau qui a déjà une disponibilité "disponible" n'est pas
// touché, pour ne pas écraser ce que tu as réglé toi-même.
//
// Usage : npm run make-available (depuis backend/)

require("dotenv").config();
const { sequelize, Boat, Availability } = require("../models");

const DATE_DEBUT = "2026-06-22";
const DATE_FIN = "2026-12-31";

async function run() {
  await sequelize.authenticate();

  const boats = await Boat.findAll();
  console.log(`${boats.length} bateau(x) trouvé(s) en base.`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const boat of boats) {
    const existing = await Availability.count({
      where: { boatId: boat.id, statut: "disponible" },
    });

    if (existing > 0) {
      skippedCount += 1;
      continue;
    }

    await Availability.create({
      boatId: boat.id,
      dateDebut: DATE_DEBUT,
      dateFin: DATE_FIN,
      statut: "disponible",
    });
    createdCount += 1;
    console.log(`✓ ${boat.nom}`);
  }

  console.log(
    `\n${createdCount} disponibilité(s) créée(s), ${skippedCount} bateau(x) déjà disponible(s) (laissé(s) tel quel).`
  );

  await sequelize.close();
}

run().catch((error) => {
  console.error("Erreur :", error);
  process.exit(1);
});