const fs = require("fs");

// Le fileFilter de multer ne regarde que le mimetype déclaré par le client
// (ex: Content-Type envoyé dans le formulaire), qui est trivialement
// falsifiable : rien n'empêche d'envoyer un script renommé "photo.jpg" avec
// mimetype: "image/jpeg". Cette vérification lit les premiers octets réels
// du fichier une fois écrit sur disque et les compare à la signature
// (magic bytes) attendue pour le type déclaré.
//
// Signatures couvrant les 4 formats acceptés par la plateforme (cf.
// uploadMiddleware) : JPEG, PNG, WEBP, PDF.
const SIGNATURES = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  // RIFF....WEBP : "RIFF" puis 4 octets de taille puis "WEBP"
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

function matchesSignature(buffer, signature) {
  return signature.every((byte, index) => buffer[index] === byte);
}

// Vérifie que le contenu réel du fichier correspond bien au mimetype déclaré.
// Retourne true/false. À utiliser juste après l'écriture du fichier par
// multer, avant de considérer l'upload comme valide.
function isFileSignatureValid(filePath, declaredMimetype) {
  const expectedSignatures = SIGNATURES[declaredMimetype];

  if (!expectedSignatures) {
    return false;
  }

  const handle = fs.openSync(filePath, "r");
  const buffer = Buffer.alloc(12);
  fs.readSync(handle, buffer, 0, 12, 0);
  fs.closeSync(handle);

  // Cas particulier WEBP : "WEBP" doit aussi apparaître aux octets 8-11.
  if (declaredMimetype === "image/webp") {
    const hasRiff = matchesSignature(buffer, [0x52, 0x49, 0x46, 0x46]);
    const hasWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return hasRiff && hasWebp;
  }

  return expectedSignatures.some((signature) =>
    matchesSignature(buffer, signature)
  );
}

module.exports = { isFileSignatureValid };