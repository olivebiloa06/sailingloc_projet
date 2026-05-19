const { Payment, Booking, Boat } = require("../models");

exports.payBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const {
      paymentMethod,
      cardNumber,
    } = req.body;

    // Vérifier réservation
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

    // Vérifier propriétaire réservation
    if (
      booking.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Accès interdit",
      });
    }

    // Vérifier si déjà payé
    const existingPayment = await Payment.findOne({
      where: {
        bookingId,
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Cette réservation est déjà payée",
      });
    }

    // Génération fausse transaction Stripe
    const transactionId =
      "PAY-" + Date.now();

    // Création paiement
    const payment = await Payment.create({
      bookingId,
      montant: booking.montantTotal,
      methodePaiement: paymentMethod,
      statut: "paye",
      transactionId,
      cardLast4: cardNumber.slice(-4),
    });

    // Mise à jour réservation
    booking.statut = "confirmee";

    await booking.save();

    res.status(201).json({
      message: "Paiement effectué avec succès",
      payment,
      booking,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getMyPayments = async (req, res) => {
  try {

    const payments = await Payment.findAll({
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

    res.status(200).json({
      message: "Paiements récupérés avec succès",
      payments,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};