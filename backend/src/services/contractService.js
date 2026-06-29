const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// Même logique que pour les documents : jamais servi en statique, seulement
// accessible via une route authentifiée avec vérification de propriété
// (voir contractController.getContractFile).
const CONTRACTS_DIR = path.join(__dirname, "../../uploads/contracts");
fs.mkdirSync(CONTRACTS_DIR, { recursive: true });

function formatDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Génère un vrai PDF récapitulant la réservation (avant : une simple chaîne
// d'URL fictive était stockée en base, sans aucun fichier réel derrière).
exports.generateContractPdf = ({ booking, boat, renter, owner }) => {
  return new Promise((resolve, reject) => {
    const filename = `contrat-${booking.id}-${Date.now()}.pdf`;
    const filePath = path.join(CONTRACTS_DIR, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(18).text("Contrat de location — SailingLoc", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(`Réservation n°${booking.id} — généré le ${formatDate(new Date())}`, {
        align: "center",
      });
    doc.moveDown(2);

    doc.fillColor("#000000").fontSize(13).text("Parties au contrat", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Propriétaire : ${owner.prenom} ${owner.nom} (${owner.email})`);
    doc.text(`Locataire : ${renter.prenom} ${renter.nom} (${renter.email})`);
    doc.moveDown();

    doc.fontSize(13).text("Bateau", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Nom : ${boat.nom}`);
    doc.text(`Type : ${boat.type}`);
    doc.text(`Localisation : ${boat.localisation}`);
    doc.moveDown();

    doc.fontSize(13).text("Période et tarif", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Du ${formatDate(booking.dateDebut)} au ${formatDate(booking.dateFin)}`);
    doc.text(`Nombre de personnes : ${booking.nombrePersonnes}`);
    doc.text(`Montant total : ${booking.montantTotal} €`);
    doc.text(`Dont commission SailingLoc : ${booking.commission} €`);
    doc.moveDown(2);

    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(
        "Ce contrat est généré automatiquement après confirmation du paiement. Il atteste de l'accord entre les deux parties sur les conditions de location ci-dessus. Toute annulation est soumise à la politique d'annulation affichée sur la plateforme au moment de la réservation (annulation gratuite jusqu'à 48h avant le départ).",
        { align: "justify" }
      );

    doc.end();

    stream.on("finish", () => resolve(filename));
    stream.on("error", reject);
  });
};

exports.CONTRACTS_DIR = CONTRACTS_DIR;