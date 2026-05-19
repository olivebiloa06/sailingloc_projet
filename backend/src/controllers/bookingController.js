const { Booking, Boat, Availability } = require("../models");

exports.createBooking = async (req, res) => {
  try {
    const { boatId, dateDebut, dateFin, nombrePersonnes } = req.body;

    // Vérifier bateau
    const boat = await Boat.findByPk(boatId);

    if (!boat) {
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    // Vérifier que les dates sont cohérentes
    const start = new Date(dateDebut);
    const end = new Date(dateFin);

    if (end <= start) {
      return res.status(400).json({
        message: "La date de fin doit être après la date de début",
      });
    }

    // Vérifier disponibilité
    const availability = await Availability.findOne({
      where: {
        boatId: boatId,
        statut: "disponible",
      },
    });

    if (!availability) {
      return res.status(400).json({
        message: "Bateau non disponible",
      });
    }

    // Calcul du nombre de jours
    const nombreJours = Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24)
    );

    // Calcul du montant total
    const montantTotal = nombreJours * boat.prixJour;

    // Commission SailingLoc 10 %
    const commission = montantTotal * 0.1;

    // Créer réservation
    const booking = await Booking.create({
      userId: req.user.id,
      boatId: boatId,
      dateDebut,
      dateFin,
      nombrePersonnes,
      montantTotal,
      commission,
      statut: "en_attente",
    });

    res.status(201).json({
      message: "Réservation créée",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: Boat,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Mes réservations récupérées avec succès",
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Réservation introuvable",
      });
    }

    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : vous ne pouvez pas annuler cette réservation",
      });
    }

    booking.statut = "annulee";

    await booking.save();

    res.status(200).json({
      message: "Réservation annulée",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};