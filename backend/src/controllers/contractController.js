const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { Contract, Booking, Boat, User } = require("../models");
const { generateContractPdf, CONTRACTS_DIR } = require("../services/contractService");

const isProduction = process.env.NODE_ENV === "production" && process.env.CLOUDINARY_CLOUD_NAME;

async function generateContractForBooking(bookingId) {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Boat, include: [{ model: User }] },
      { model: User },
    ],
  });

  if (!booking || booking.statut !== "confirmee") return null;

  const existingContract = await Contract.findOne({ where: { bookingId } });
  if (existingContract) return existingContract;

  const urlPdf = await generateContractPdf({
    booking,
    boat: booking.Boat,
    renter: booking.User,
    owner: booking.Boat.User,
  });

  return Contract.create({
    bookingId,
    urlPdf,
    statut: "genere",
    signatureElectronique: false,
    dateGeneration: new Date(),
  });
}

exports.generateContract = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: "Réservation introuvable" });
    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    if (booking.statut !== "confirmee") {
      return res.status(400).json({ message: "Le contrat ne peut être généré que pour une réservation confirmée" });
    }
    const contract = await generateContractForBooking(bookingId);
    return res.status(201).json({ message: "Contrat généré avec succès", contract });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyContracts = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      include: [{ model: Booking, where: { userId: req.user.id }, include: [{ model: Boat }] }],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ message: "Contrats récupérés avec succès", contracts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id, {
      include: [{ model: Booking, include: [{ model: Boat }] }],
    });
    if (!contract) return res.status(404).json({ message: "Contrat introuvable" });
    const isRenter = contract.Booking.userId === req.user.id;
    const isOwner = contract.Booking.Boat?.userId === req.user.id;
    if (!isRenter && !isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    return res.status(200).json({ message: "Contrat récupéré avec succès", contract });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getContractFile = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id, {
      include: [{ model: Booking, include: [{ model: Boat }] }],
    });
    if (!contract) return res.status(404).json({ message: "Contrat introuvable" });

    const isRenter = contract.Booking.userId === req.user.id;
    const isOwner = contract.Booking.Boat?.userId === req.user.id;
    if (!isRenter && !isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    if (!contract.urlPdf) return res.status(404).json({ message: "Aucun fichier pour ce contrat" });

    const download = req.query.download === "1";

    // En production → retourne l'URL JSON (pas de redirect → évite CORS avec credentials).
    // Cloudinary bloque par défaut l'accès direct aux PDF livrés en resource_type "raw"
    // (restriction de sécurité activée par défaut sur les comptes récents) : on doit donc
    // signer l'URL pour que Cloudinary l'autorise, sinon le navigateur reçoit un 401.
    if (isProduction && contract.urlPdf.startsWith("http")) {
      const publicId = contract.urlPdf.split("/").slice(-1)[0].split(".")[0];
      const signedUrl = cloudinary.url(`sailingloc/contracts/${publicId}`, {
        resource_type: "raw",
        type: "upload",
        format: "pdf",
        sign_url: true,
        secure: true,
        flags: download ? "attachment" : undefined,
      });
      // Sans ça, le navigateur peut mettre en cache cette réponse JSON (via
      // l'ETag qu'Express génère par défaut) et renvoyer un 304 sans corps
      // sur un appel suivant identique — le front reçoit alors un JSON vide
      // et n'a jamais l'URL signée à charger (onglet qui reste blanc).
      res.set("Cache-Control", "no-store");
      return res.status(200).json({ url: signedUrl });
    }

    // En local → sert le fichier
    const filePath = path.join(CONTRACTS_DIR, contract.urlPdf);
    if (!filePath.startsWith(CONTRACTS_DIR) || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${download ? "attachment" : "inline"}; filename="contrat-${contract.id}.pdf"`);
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.generateContractForBooking = generateContractForBooking;