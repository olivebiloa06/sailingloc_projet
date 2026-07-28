// Script de maintenance — vérifie que chaque imageUrl en base correspond
// à un fichier réellement présent sur le disque, et nettoie les références
// orphelines (fichier supprimé/déplacé/jamais uploadé correctement).
//
// Usage : node src/scripts/cleanOrphanedImages.js

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, Boat } = require("../models");

const UPLOADS_ROOT = path.join(__dirname, "../../uploads");

async function cleanOrphanedImages() {
  await sequelize.authenticate();
  console.log("Connexion à la base réussie. Recherche des images orphelines...\n");

  const boatsWithImage = await Boat.findAll({
    where: {
      imageUrl: {
        [require("sequelize").Op.ne]: null,
      },
    },
  });

  let orphanedCount = 0;
  let okCount = 0;

  for (const boat of boatsWithImage) {
    // imageUrl est stocké comme "/uploads/boats/xxx.jpg" — on reconstruit
    // le chemin absolu réel sur le disque pour vérifier son existence.
    const relativePath = boat.imageUrl.replace(/^\/uploads\//, "");
    const absolutePath = path.join(UPLOADS_ROOT, relativePath);

    if (fs.existsSync(absolutePath)) {
      okCount += 1;
    } else {
      console.log(`❌ Orphelin : bateau "${boat.nom}" (id=${boat.id}) → ${boat.imageUrl}`);
      await boat.update({ imageUrl: null });
      orphanedCount += 1;
    }
  }

  console.log(`\n${okCount} image(s) valide(s).`);
  console.log(`${orphanedCount} image(s) orpheline(s) nettoyée(s) (imageUrl remis à null).`);

  await sequelize.close();
}

cleanOrphanedImages().catch((error) => {
  console.error("Erreur pendant le nettoyage :", error);
  process.exit(1);
});