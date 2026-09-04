// Rattrapage ponctuel : les documents (pièces d'identité, assurances...)
// uploadés AVANT le correctif du 2026-09 sur documentController.js n'ont
// aucune extension dans leur URL Cloudinary (ex: ".../doc-15-172...", sans
// ".pdf") — le fichier est intact et se télécharge, mais ni le navigateur
// ni Windows ne savent quoi en faire faute d'extension.
//
// Ce script, pour chaque document Cloudinary concerné :
//   1. télécharge les octets du fichier (déjà accessible, juste sans ext.)
//   2. déduit le vrai format via ses "magic bytes" (PDF/JPEG/PNG/WEBP)
//   3. renomme la ressource sur Cloudinary pour lui donner l'extension
//   4. met à jour l'URL stockée en base
//
// Les nouveaux documents (uploadés après le correctif) ont déjà leur
// extension dès l'upload — ce script n'a besoin d'être lancé qu'une fois.
//
// Usage : npm run backfill:document-extensions (depuis backend/)
// Nécessite les mêmes variables d'environnement que le serveur en
// production : DATABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
// CLOUDINARY_API_SECRET.

require("dotenv").config();
const { sequelize, Document } = require("../models");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAGIC_BYTES = [
  { ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  { ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

function detectExtension(buffer) {
  for (const { ext, bytes } of MAGIC_BYTES) {
    if (bytes.every((b, i) => buffer[i] === b)) return ext;
  }
  // WEBP : "RIFF" en tête + "WEBP" aux octets 8-11.
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

function hasExtension(url) {
  const lastSegment = url.split("/").slice(-1)[0];
  return lastSegment.includes(".");
}

function publicIdFromUrl(url) {
  // ".../upload/v<version>/sailingloc/documents/doc-xxx" -> "sailingloc/documents/doc-xxx"
  const marker = "/upload/";
  const afterUpload = url.slice(url.indexOf(marker) + marker.length);
  const parts = afterUpload.split("/");
  // Le premier segment après "upload/" est la version (v123...) — à ignorer.
  return parts.slice(1).join("/");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  await sequelize.authenticate();

  const documents = await Document.findAll({
    where: {},
  });

  const affected = documents.filter((d) => d.url?.startsWith("http") && !hasExtension(d.url));

  console.log(`${affected.length} document(s) Cloudinary sans extension à corriger.`);

  let fixed = 0;
  let failed = 0;

  for (const doc of affected) {
    try {
      const publicId = publicIdFromUrl(doc.url);

      const signedUrl = cloudinary.url(publicId, {
        resource_type: "raw",
        type: "upload",
        sign_url: true,
        secure: true,
      });

      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error(`téléchargement échoué (${response.status})`);
      const buffer = Buffer.from(await response.arrayBuffer());

      const ext = detectExtension(buffer);
      if (!ext) {
        console.warn(`✗ Document ${doc.id} (${doc.nom}) — format non reconnu, ignoré.`);
        failed += 1;
        continue;
      }

      const newPublicId = `${publicId}.${ext}`;
      await cloudinary.uploader.rename(publicId, newPublicId, { resource_type: "raw" });

      const newUrl = cloudinary.url(newPublicId, {
        resource_type: "raw",
        type: "upload",
        secure: true,
      });

      await doc.update({ url: newUrl });
      fixed += 1;
      console.log(`✓ Document ${doc.id} (${doc.nom}) -> .${ext}`);
    } catch (err) {
      failed += 1;
      console.warn(`✗ Document ${doc.id} (${doc.nom}) — ${err.message}`);
    }

    await sleep(300);
  }

  console.log(`Terminé : ${fixed} corrigé(s), ${failed} échec(s).`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
