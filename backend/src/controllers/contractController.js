const { Contract, Booking, Boat } = require("../models");

// Générer un contrat pour une réservation
exports.generateContract = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Boat,
        },
      ],
    });

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

    const existingContract = await Contract.findOne({
      where: {
        bookingId,
      },
    });

    if (existingContract) {
      return res.status(400).json({
        message: "Un contrat existe déjà pour cette réservation",
        contract: existingContract,
      });
    }

    const fakePdfUrl = `https://sailingloc.fr/contracts/booking-${bookingId}.pdf`;

    const contract = await Contract.create({
      bookingId,
      urlPdf: fakePdfUrl,
      statut: "genere",
      signatureElectronique: false,
      dateGeneration: new Date(),
    });

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

// Voir mes contrats
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

// Voir un contrat par id
exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id, {
      include: [
        {
          model: Booking,
          include: [
            {
              model: Boat,
            },
          ],
        },
      ],
    });

    if (!contract) {
      return res.status(404).json({
        message: "Contrat introuvable",
      });
    }

    if (
      contract.Booking.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
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