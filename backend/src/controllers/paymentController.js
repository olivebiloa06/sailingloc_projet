const { Payment, Booking, Boat, User } = require("../models");
const { sendPaymentConfirmation } = require("../services/emailService");
const { createCheckoutSession } = require("../services/stripeService");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// =========================
// ENCAISSEMENT MANUEL — réservé admin
// =========================
// Avant correction, cette route ("paiement simulé") permettait à n'importe
// quel locataire connecté de marquer SA PROPRE réservation comme payée en
// appelant simplement l'endpoint, sans qu'aucun argent ne transite réellement
// — et elle acceptait en plus un champ cardNumber jamais utilisé (on ne fait
// JAMAIS transiter de numéro de carte par notre propre serveur, même sans le
// stocker : c'est le rôle de Stripe Checkout).
//
// Cette route ne doit servir qu'à un usage interne précis : enregistrer
// qu'une réservation a été réglée par un moyen hors plateforme (virement,
// espèces lors d'un litige, etc.), à l'initiative d'un administrateur — elle
// est donc maintenant verrouillée par authorizeRoles("admin") au niveau de la
// route (paymentRoutes.js) ET revérifiée ici par sécurité.
exports.markBookingAsPaidManually = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : réservé à l'administrateur",
      });
    }

    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Boat },
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

    const existingPayment = await Payment.findOne({
      where: { bookingId },
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Cette réservation est déjà payée",
      });
    }

    const transactionId = "MANUAL-" + Date.now();

    const payment = await Payment.create({
      bookingId,
      montant: booking.montantTotal,
      methode: "manuel",
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
      message: "Réservation marquée comme payée (encaissement manuel)",
      payment,
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// WEBHOOK STRIPE
// =========================
// Monté directement dans server.js, AVANT express.json(), avec express.raw().
// req.body doit impérativement être le buffer brut non parsé : c'est ce que
// stripe.webhooks.constructEvent() utilise pour recalculer la signature HMAC
// et la comparer à l'en-tête "stripe-signature". Voir server.js pour le détail
// du correctif (cette route n'est plus dupliquée via paymentRoutes).
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

// =========================
// CRÉER UNE SESSION STRIPE CHECKOUT
// =========================

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

// =========================
// VOIR MES PAIEMENTS
// =========================

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