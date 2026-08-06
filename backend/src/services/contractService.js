const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const cloudinary = require("cloudinary").v2;

const CONTRACTS_DIR = path.join(__dirname, "../../uploads/contracts");

const isProduction = process.env.NODE_ENV === "production" && process.env.CLOUDINARY_CLOUD_NAME;

if (isProduction) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  fs.mkdirSync(CONTRACTS_DIR, { recursive: true });
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const NAVY = "#0A2A43";
const SKY = "#1DA1F2";
const SABLE = "#C9A96E";
const LIGHT_GRAY = "#F5F7FA";
const MID_GRAY = "#6B7280";

// Génère le PDF dans un buffer mémoire
function generatePdfBuffer({ booking, boat, renter, owner }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;
    const H = doc.page.height;

    // Filigrane
    doc.save();
    doc.opacity(0.04);
    doc.fontSize(72).fillColor(NAVY);
    for (let y = 0; y < H; y += 180) {
      for (let x = -100; x < W; x += 280) {
        doc.save();
        doc.translate(x, y);
        doc.rotate(-35, { origin: [0, 0] });
        doc.text("SailingLoc", 0, 0);
        doc.restore();
      }
    }
    doc.restore();

    // Header
    doc.rect(0, 0, W, 110).fill(NAVY);
    doc.rect(0, 110, W, 3).fill(SABLE);
    doc.fillColor("#FFFFFF").fontSize(26).font("Helvetica-Bold").text("SailingLoc", 50, 32);
    doc.fillColor(SABLE).fontSize(10).font("Helvetica").text("Location de bateaux entre particuliers", 50, 62);
    doc.fillColor("white").opacity(0.7).fontSize(9).text("Agence Pandawan © 2026 — sailingloc.fr", 50, 82);
    doc.opacity(1);
    doc.fillColor("#FFFFFF").fontSize(14).font("Helvetica-Bold").text("CONTRAT DE LOCATION", W - 260, 36, { width: 210, align: "right" });
    doc.fillColor(SABLE).fontSize(10).font("Helvetica").text(`Réservation n°${booking.id}`, W - 260, 58, { width: 210, align: "right" });
    doc.fillColor("white").opacity(0.7).fontSize(9).text(`Émis le ${formatDate(new Date())}`, W - 260, 78, { width: 210, align: "right" });
    doc.opacity(1);

    // Section 1 — Parties
    let y = 130;
    doc.rect(40, y, W - 80, 120).fill(LIGHT_GRAY).stroke("#E5E7EB");
    doc.rect(40, y, 4, 120).fill(SKY);
    doc.fillColor(NAVY).fontSize(12).font("Helvetica-Bold").text("PARTIES AU CONTRAT", 56, y + 12);
    doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica").text("PROPRIÉTAIRE", 56, y + 32);
    doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold").text(`${owner.prenom} ${owner.nom}`, 56, y + 44);
    doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica").text(owner.email, 56, y + 57);
    doc.moveTo(W / 2, y + 30).lineTo(W / 2, y + 100).stroke("#D1D5DB");
    doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica").text("LOCATAIRE", W / 2 + 20, y + 32);
    doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold").text(`${renter.prenom} ${renter.nom}`, W / 2 + 20, y + 44);
    doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica").text(renter.email, W / 2 + 20, y + 57);
    y += 140;

    // Section 2 — Bateau
    doc.rect(40, y, W - 80, 100).fill(LIGHT_GRAY).stroke("#E5E7EB");
    doc.rect(40, y, 4, 100).fill(SABLE);
    doc.fillColor(NAVY).fontSize(12).font("Helvetica-Bold").text("BATEAU", 56, y + 12);
    const boatFields = [
      ["Nom", boat.nom], ["Type", boat.type],
      ["Localisation", boat.localisation], ["Capacité", `${boat.capacite} personne${boat.capacite > 1 ? "s" : ""} max.`],
    ];
    boatFields.forEach(([label, value], i) => {
      const col = i % 2 === 0 ? 56 : W / 2 + 20;
      const row = y + 32 + Math.floor(i / 2) * 24;
      doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica").text(label.toUpperCase(), col, row);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold").text(value || "—", col, row + 10);
    });
    y += 120;

    // Section 3 — Période et tarif
    doc.rect(40, y, W - 80, 120).fill(LIGHT_GRAY).stroke("#E5E7EB");
    doc.rect(40, y, 4, 120).fill(NAVY);
    doc.fillColor(NAVY).fontSize(12).font("Helvetica-Bold").text("PÉRIODE ET TARIF", 56, y + 12);
    const sousTotal = booking.montantTotal - booking.commission;
    const tariffFields = [
      ["Date d'arrivée", formatDate(booking.dateDebut), 56, y + 32],
      ["Date de départ", formatDate(booking.dateFin), W / 2 + 20, y + 32],
      ["Voyageurs", `${booking.nombrePersonnes} personne${booking.nombrePersonnes > 1 ? "s" : ""}`, 56, y + 68],
    ];
    tariffFields.forEach(([label, value, x, row]) => {
      doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica").text(label.toUpperCase(), x, row);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold").text(value || "—", x, row + 10);
    });
    const tarifX = W / 2 + 20;
    doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica").text("SOUS-TOTAL", tarifX, y + 68);
    doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold").text(`${sousTotal} €`, tarifX, y + 78);
    doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica").text("COMMISSION (10%)", tarifX + 90, y + 68);
    doc.fillColor(MID_GRAY).fontSize(10).font("Helvetica").text(`${booking.commission} €`, tarifX + 90, y + 78);
    doc.rect(56, y + 98, W - 112, 16).fill(NAVY);
    doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold").text(`TOTAL PAYÉ : ${booking.montantTotal} €`, 60, y + 101, { width: W - 120 });
    y += 152;

    // Clauses
    doc.fillColor(NAVY).fontSize(11).font("Helvetica-Bold").text("CONDITIONS GÉNÉRALES", 40, y);
    y += 16;
    const clauses = [
      "1. Le locataire s'engage à utiliser le bateau dans le respect des règles de navigation et à restituer le véhicule dans l'état initial.",
      "2. Annulation gratuite jusqu'à 48h avant le départ. Passé ce délai, une retenue peut être appliquée selon accord entre les parties.",
      "3. Le locataire est responsable de tout dommage causé au bateau pendant la période de location.",
      "4. Le propriétaire certifie que le bateau est conforme aux réglementations en vigueur et couvert par une assurance responsabilité civile.",
      "5. Litige : tout différend sera soumis aux tribunaux compétents selon la législation française.",
    ];
    clauses.forEach((clause) => {
      doc.fillColor("#374151").fontSize(8.5).font("Helvetica").text(clause, 40, y, { width: W - 80, align: "justify" });
      y += 24;
    });

    // Signatures
    y += 10;
    doc.moveTo(40, y).lineTo(W - 40, y).stroke("#E5E7EB");
    y += 16;
    doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold").text("SIGNATURES", 40, y);
    y += 20;
    doc.rect(40, y, 220, 60).stroke("#D1D5DB");
    doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica").text("Signature du propriétaire", 50, y + 6);
    doc.fillColor(NAVY).fontSize(9).font("Helvetica-Bold").text(`${owner.prenom} ${owner.nom}`, 50, y + 44);
    doc.rect(W - 260, y, 220, 60).stroke("#D1D5DB");
    doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica").text("Signature du locataire", W - 250, y + 6);
    doc.fillColor(NAVY).fontSize(9).font("Helvetica-Bold").text(`${renter.prenom} ${renter.nom}`, W - 250, y + 44);

    // Footer
    doc.rect(0, H - 36, W, 36).fill(NAVY);
    doc.fillColor("white").opacity(0.6).fontSize(7.5).font("Helvetica")
      .text(`SailingLoc — Agence Pandawan © ${new Date().getFullYear()} — Ce contrat est généré automatiquement après confirmation du paiement — sailingloc.fr`, 0, H - 22, { width: W, align: "center" });
    doc.opacity(1);
    doc.fillColor("white").opacity(0.5).fontSize(7).text(`Contrat n°${booking.id}`, W - 100, H - 22);

    doc.end();
  });
}

// Génère le PDF et le stocke (Cloudinary en prod, disque en dev)
exports.generateContractPdf = async ({ booking, boat, renter, owner }) => {
  const buffer = await generatePdfBuffer({ booking, boat, renter, owner });

  if (isProduction) {
    // Upload sur Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "sailingloc/contracts",
          public_id: `contrat-${booking.id}-${Date.now()}`,
          resource_type: "raw",
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Retourne l'URL Cloudinary complète
    return result.secure_url;
  } else {
    // Stocke sur disque en local
    const filename = `contrat-${booking.id}-${Date.now()}.pdf`;
    const filePath = path.join(CONTRACTS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return filename;
  }
};

exports.CONTRACTS_DIR = CONTRACTS_DIR;