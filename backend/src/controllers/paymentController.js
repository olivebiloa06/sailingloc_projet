const { Payment, Booking, Boat, User } = require("../models");
const { sendPaymentConfirmation } = require("../services/emailService");
const { createCheckoutSession } = require("../services/stripeService");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Paiement simulé
exports.payBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod, cardNumber } = req.body;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Boat,
        },
        {
          model: User,
          attributes: ["id", "email", "nom", "prenom"],
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
        message: "Accès interdit",
      });
    }

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

    const transactionId = "PAY-" + Date.now();

    const payment = await Payment.create({
      bookingId,
      montant: booking.montantTotal,
      methode: paymentMethod || "carte_bancaire",
      statut: "paye",
      referenceTransaction: transactionId,
      datePaiement: new Date(),
    });

    booking.statut = "confirmee";
    await booking.save();

    if (booking.User && booking.User.email) {
      await sendPaymentConfirmation(booking.User.email, payment);
    }

    return res.status(201).json({
      message: "Paiement effectué avec succès",
      payment,
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      const booking = await Booking.findByPk(bookingId);

      if (!booking) {
        return res.status(404).json({
          message: "Réservation introuvable",
        });
      }

      const existingPayment = await Payment.findOne({
        where: { bookingId },
      });

      if (!existingPayment) {
        await Payment.create({
          bookingId,
          montant: booking.montantTotal,
          methode: "stripe",
          statut: "paye",
          referenceTransaction: session.payment_intent,
          datePaiement: new Date(),
        });
      }

      booking.statut = "confirmee";
      await booking.save();
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// Créer une session Stripe Checkout
exports.createStripeSession = async (req, res) => {
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
        message: "Accès interdit",
      });
    }

    if (booking.statut === "confirmee") {
      return res.status(400).json({
        message: "Cette réservation est déjà confirmée",
      });
    }

    const session = await createCheckoutSession({ booking });

    return res.status(200).json({
      message: "Session Stripe créée avec succès",
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir mes paiements
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

    return res.status(200).json({
      message: "Paiements récupérés avec succès",
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};