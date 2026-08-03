const { Payment, Booking, Boat, User, Contract } = require("../models");
const {
  sendPaymentConfirmation,
  sendOwnerBookingNotification,
} = require("../services/emailService");
const { createCheckoutSession } = require("../services/stripeService");
const paypalService = require("../services/paypalService");
const contractController = require("./contractController");
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

    try {
      await contractController.generateContractForBooking(bookingId);
    } catch (contractError) {
      console.error("Génération du contrat échouée pour la réservation", bookingId, contractError);
    }

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
          // Filet de sécurité : session.payment_intent doit normalement
          // toujours être présent sur un événement checkout.session.completed
          // en mode "payment", mais on ne veut jamais se retrouver avec une
          // référence de transaction nulle — on retombe sur l'ID de session
          // Stripe lui-même, qui permet toujours de retrouver le paiement
          // dans le Dashboard Stripe.
          referenceTransaction: session.payment_intent || session.id,
          datePaiement: new Date(),
        });
      }

      booking.statut = "confirmee";
      await booking.save();

      // Générer le contrat PDF
      let contract = null;
      try {
        contract = await contractController.generateContractForBooking(bookingId);
      } catch (contractError) {
        console.error("Génération du contrat échouée pour la réservation", bookingId, contractError);
      }

      // Recharger avec toutes les relations pour les emails
      const bookingFull = await Booking.findByPk(bookingId, {
        include: [
          { model: Boat, include: [{ model: User }] },
          { model: User },
        ],
      });

      if (bookingFull?.User?.email) {
        try {
          await sendPaymentConfirmation(bookingFull.User.email, { montant: bookingFull.montantTotal }, bookingFull, contract);
        } catch (e) { console.error("Email locataire:", e.message); }
      }

      const ownerEmail = bookingFull?.Boat?.User?.email;
      if (ownerEmail) {
        try {
          await sendOwnerBookingNotification(ownerEmail, bookingFull);
        } catch (e) { console.error("Email propriétaire:", e.message); }
      }
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

// =========================
// CONFIRMER VIA SESSION STRIPE (fallback si webhook lent/absent)
// =========================
// La page BookingSuccess appelle cet endpoint avec le session_id Stripe.
// Si le webhook a déjà confirmé → idempotent, ne fait rien.
// Si le webhook n'a pas encore tourné → confirme maintenant.

exports.confirmStripeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Récupère la session Stripe pour obtenir les métadonnées
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Session non payée ou introuvable." });
    }

    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      return res.status(400).json({ message: "Métadonnées de réservation manquantes." });
    }

    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Boat, include: [{ model: User }] },
        { model: User },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    // Déjà confirmée par le webhook — on renvoie juste les données
    if (booking.statut === "confirmee") {
      const contract = await Contract.findOne({ where: { bookingId } });
      return res.status(200).json({ booking, contract, alreadyConfirmed: true });
    }

    // Pas encore confirmée — on le fait maintenant
    const existing = await Payment.findOne({ where: { bookingId } });
    if (!existing) {
      await Payment.create({
        bookingId,
        montant: booking.montantTotal,
        methode: "stripe",
        statut: "paye",
        referenceTransaction: session.payment_intent || session.id,
        datePaiement: new Date(),
      });
    }

    booking.statut = "confirmee";
    await booking.save();

    let contract = null;
    try {
      contract = await contractController.generateContractForBooking(bookingId);
    } catch (e) {
      console.error("Contrat:", e.message);
    }

    // Emails
    if (booking.User?.email) {
      try {
        await sendPaymentConfirmation(booking.User.email, { montant: booking.montantTotal }, booking, contract);
      } catch (e) { console.error("Email locataire:", e.message); }
    }
    const ownerEmail = booking.Boat?.User?.email;
    if (ownerEmail) {
      try {
        await sendOwnerBookingNotification(ownerEmail, booking);
      } catch (e) { console.error("Email propriétaire:", e.message); }
    }

    return res.status(200).json({ booking, contract });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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

    // Le paiement est autorisé dès que la réservation existe (en_attente)
    // ou a été explicitement acceptée (acceptee). Bloqué si déjà confirmée,
    // annulée ou terminée.
    if (!["en_attente", "acceptee"].includes(booking.statut)) {
      return res.status(400).json({
        message: "Cette réservation n'est pas en attente de paiement.",
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

// =========================
// PAYPAL — CRÉER UNE COMMANDE
// =========================

exports.createPaypalOrder = async (req, res) => {
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

    if (!["en_attente", "acceptee"].includes(booking.statut)) {
      return res.status(400).json({
        message: "Cette réservation n'est pas en attente de paiement.",
      });
    }

    const order = await paypalService.createOrder({ booking });
    const approveLink = (order.links || []).find((link) => link.rel === "approve");

    return res.status(200).json({
      message: "Commande PayPal créée avec succès",
      orderId: order.id,
      url: approveLink ? approveLink.href : null,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// PAYPAL — CAPTURER LE PAIEMENT APRÈS APPROBATION
// =========================
// Pas de webhook ici (contrairement à Stripe) : sur un parcours redirect
// simple, PayPal renvoie l'utilisateur sur le site avec ?token=ORDER_ID, et
// c'est CET appel explicite, déclenché par le frontend à ce retour, qui
// capture réellement l'argent et enregistre le paiement.

exports.capturePaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const capture = await paypalService.captureOrder(orderId);

    const bookingId = capture.purchase_units?.[0]?.custom_id;
    const captureId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;

    if (!bookingId) {
      return res.status(400).json({
        message: "Identifiant de réservation manquant dans la réponse PayPal",
      });
    }

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

    const existingPayment = await Payment.findOne({ where: { bookingId } });

    if (!existingPayment) {
      await Payment.create({
        bookingId,
        montant: booking.montantTotal,
        methode: "paypal",
        statut: "paye",
        referenceTransaction: captureId,
        datePaiement: new Date(),
      });

      booking.statut = "confirmee";
      await booking.save();

      try {
        await contractController.generateContractForBooking(bookingId);
      } catch (contractError) {
        console.error("Génération du contrat échouée pour la réservation", bookingId, contractError);
      }
    }

    return res.status(200).json({
      message: "Paiement PayPal confirmé",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};