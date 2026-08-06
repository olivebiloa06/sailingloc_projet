const fs = require("fs");
const path = require("path");
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

  // En prod → retourne une URL Cloudinary
  // En dev → retourne un filename local
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

    // En production → urlPdf est une URL Cloudinary complète → redirect
    if (isProduction && contract.urlPdf.startsWith("http")) {
      return res.redirect(contract.urlPdf);
    }

    // En local → urlPdf est un filename
    const filePath = path.join(CONTRACTS_DIR, contract.urlPdf);
    if (!filePath.startsWith(CONTRACTS_DIR) || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="contrat-${contract.id}.pdf"`);
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.generateContractForBooking = generateContractForBooking;