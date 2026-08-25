// Rattrapage ponctuel : géocode les bateaux existants qui n'ont pas encore
// de latitude/longitude (créés avant l'ajout du géocodage automatique dans
// boatController). Les nouveaux bateaux sont géocodés automatiquement à la
// création/modification — ce script n'a besoin d'être lancé qu'une fois.
//
// Usage : npm run geocode:backfill (depuis backend/)

require("dotenv").config();
const { sequelize, Boat } = require("../models");
const { geocodeLocation } = require("../utils/geocode");

// Nominatim limite à 1 requête/seconde.
const NOMINATIM_DELAY_MS = 1100;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  await sequelize.authenticate();

  const boats = await Boat.findAll({
    where: { latitude: null },
  });

  console.log(`${boats.length} bateau(x) sans coordonnées à géocoder.`);

  let updated = 0;
  let failed = 0;

  for (const boat of boats) {
    const coords = await geocodeLocation(boat.localisation);

    if (coords) {
      await boat.update(coords);
      updated += 1;
      console.log(`✓ ${boat.nom} (${boat.localisation}) -> ${coords.latitude}, ${coords.longitude}`);
    } else {
      failed += 1;
      console.warn(`✗ ${boat.nom} (${boat.localisation}) — géocodage impossible`);
    }

    await sleep(NOMINATIM_DELAY_MS);
  }

  console.log(`Terminé : ${updated} mis à jour, ${failed} échec(s).`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
