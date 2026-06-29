const fs = require("fs");
const path = require("path");
const { Contract, Booking, Boat, User } = require("../models");
const { generateContractPdf, CONTRACTS_DIR } = require("../services/contractService");

// =========================
// GÉNÉRATION INTERNE (réutilisée par la route HTTP ET par paymentController)
// =========================
// Avant correction : le contrat n'était jamais généré qu'à la demande
// explicite d'un appel à cette route — rien ne le déclenchait après un
// paiement réussi. Cette fonction interne est désormais appelée directement
// par le webhook Stripe ET la capture PayPal dès qu'une réservation passe à
// "confirmee", en plus de rester disponible via la route HTTP ci-dessous.
async function generateContractForBooking(bookingId) {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Boat, include: [{ model: User }] },
      { model: User },
    ],
  });

  if (!booking || booking.statut !== "confirmee") {
    return null;
  }

  const existingContract = await Contract.findOne({ where: { bookingId } });
  if (existingContract) {
    return existingContract;
  }

  const filename = await generateContractPdf({
    booking,
    boat: booking.Boat,
    renter: booking.User,
    owner: booking.Boat.User,
  });

  return Contract.create({
    bookingId,
    urlPdf: filename,
    statut: "genere",
    signatureElectronique: false,
    dateGeneration: new Date(),
  });
}

// =========================
// GÉNÉRER UN CONTRAT (route HTTP, déclenchement manuel/de secours)
// =========================

exports.generateContract = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Réservation introuvable",
      });
    }

    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : cette réservation ne vous appartient pas",
      });
    }

    if (booking.statut !== "confirmee") {
      return res.status(400).json({
        message: "Le contrat ne peut être généré que pour une réservation confirmée",
      });
    }

    const contract = await generateContractForBooking(bookingId);

    return res.status(201).json({
      message: "Contrat généré avec succès",
      contract,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// VOIR MES CONTRATS
// =========================

exports.getMyContracts = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      include: [
        {
          model: Booking,
          where: {
            userId: req.user.id,
          },
          include: [
            {
              model: Boat,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Contrats récupérés avec succès",
      contracts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// VOIR UN CONTRAT PAR ID
// =========================
// Élargi pour inclure le propriétaire du bateau concerné, pas seulement le
// locataire : un contrat engage les deux parties, les deux doivent pouvoir
// le consulter.

exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id, {
      include: [
        {
          model: Booking,
          include: [{ model: Boat }],
        },
      ],
    });

    if (!contract) {
      return res.status(404).json({
        message: "Contrat introuvable",
      });
    }

    const isRenter = contract.Booking.userId === req.user.id;
    const isOwner = contract.Booking.Boat?.userId === req.user.id;

    if (!isRenter && !isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : ce contrat ne vous appartient pas",
      });
    }

    return res.status(200).json({
      message: "Contrat récupéré avec succès",
      contract,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// TÉLÉCHARGER LE FICHIER PDF DU CONTRAT
// =========================
// Même logique de sécurité que documentController.getDocumentFile : jamais
// de service statique, vérification de propriété (locataire OU propriétaire
// du bateau OU admin), garde-fou anti-traversée de chemin.

exports.getContractFile = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id, {
      include: [
        {
          model: Booking,
          include: [{ model: Boat }],
        },
      ],
    });

    if (!contract) {
      return res.status(404).json({
        message: "Contrat introuvable",
      });
    }

    const isRenter = contract.Booking.userId === req.user.id;
    const isOwner = contract.Booking.Boat?.userId === req.user.id;

    if (!isRenter && !isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : ce contrat ne vous appartient pas",
      });
    }

    if (!contract.urlPdf) {
      return res.status(404).json({
        message: "Aucun fichier pour ce contrat",
      });
    }

    const filePath = path.join(CONTRACTS_DIR, contract.urlPdf);

    if (!filePath.startsWith(CONTRACTS_DIR) || !fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Fichier introuvable",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="contrat-${contract.id}.pdf"`
    );

    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Exporté pour être appelé directement par paymentController (webhook
// Stripe, capture PayPal), sans repasser par une requête HTTP.
exports.generateContractForBooking = generateContractForBooking;