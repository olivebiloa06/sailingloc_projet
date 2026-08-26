const { Op } = require("sequelize");
const { sequelize, Booking, Boat, Availability, Payment, User } = require("../models");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paypalService = require("../services/paypalService");
const { calculerMontant, calculerCommission, validerDates, validerPersonnes } = require("../utils/bookingCalculations");

// =========================
// CRÉER UNE RÉSERVATION
// =========================
// Avant correction, cette fonction se contentait de vérifier qu'IL EXISTAIT
// une Availability "disponible" pour le bateau, sans comparer les dates
// demandées à cette période, et sans vérifier qu'aucune autre réservation
// (non annulée) ne chevauchait déjà ces dates. Deux utilisateurs pouvaient
// donc réserver le même bateau sur les mêmes dates en même temps.
//
// Le tout est désormais exécuté dans une transaction avec verrou sur la ligne
// du bateau, pour éviter qu'une situation de course (deux requêtes
// quasi-simultanées) ne fasse passer les deux vérifications avant que l'une
// des deux réservations ne soit enregistrée.
exports.createBooking = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { boatId, dateDebut, dateFin, nombrePersonnes = 1 } = req.body;

    if (!boatId || !dateDebut || !dateFin) {
      await transaction.rollback();
      return res.status(400).json({
        message: "boatId, dateDebut et dateFin sont obligatoires.",
      });
    }

    const start = new Date(dateDebut);
    const end = new Date(dateFin);

    if (!validerDates(dateDebut, dateFin)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "La date de fin doit être après la date de début.",
      });
    }

    // Verrouille la ligne du bateau pendant la durée de la transaction : si
    // deux requêtes de réservation arrivent en même temps pour le même
    // bateau, la seconde attend que la première soit terminée (commit ou
    // rollback) avant de continuer, ce qui élimine la course critique.
    const boat = await Boat.findByPk(boatId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!boat) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    // Le nombre de voyageurs déclaré ne doit pas dépasser la capacité du
    // bateau — cette vérification n'existait pas avant : n'importe quel
    // nombre était accepté tel quel.
    if (!validerPersonnes(nombrePersonnes, boat.capacite)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Le nombre de voyageurs doit être compris entre 1 et ${boat.capacite} (capacité du bateau).`,
      });
    }

    // Le bateau doit être couvert par une période "disponible" qui englobe
    // ENTIÈREMENT les dates demandées (pas juste "il existe une dispo
    // quelque part" comme avant).
    const availability = await Availability.findOne({
      where: {
        boatId,
        statut: "disponible",
        dateDebut: { [Op.lte]: start },
        dateFin: { [Op.gte]: end },
      },
      transaction,
    });

    if (!availability) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Le bateau n'est pas disponible sur la période demandée.",
      });
    }

    // Aucune réservation existante non annulée ne doit chevaucher les dates
    // demandées (chevauchement classique : début < fin_autre ET fin > début_autre).
    const overlappingBooking = await Booking.findOne({
      where: {
        boatId,
        statut: { [Op.ne]: "annulee" },
        dateDebut: { [Op.lt]: end },
        dateFin: { [Op.gt]: start },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (overlappingBooking) {
      await transaction.rollback();
      return res.status(409).json({
        message: "Ces dates viennent d'être réservées par quelqu'un d'autre. Merci de choisir une autre période.",
      });
    }

    const montantTotal = calculerMontant(boat.prixJour, dateDebut, dateFin);
    const commission = calculerCommission(montantTotal);

    const booking = await Booking.create(
      {
        userId: req.user.id,
        boatId,
        dateDebut,
        dateFin,
        nombrePersonnes,
        montantTotal,
        commission,
        statut: "en_attente",
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      message: "Réservation créée",
      booking,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// MES RÉSERVATIONS
// =========================

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
        {
          model: Payment,
          required: false,
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

// =========================
// DÉTAIL D'UNE RÉSERVATION
// =========================
// Nécessaire pour que la page de paiement fonctionne aussi en accès direct
// (lien partagé, rechargement de page), pas seulement juste après création.

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Boat }],
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

    res.status(200).json({
      message: "Réservation récupérée avec succès",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// DEMANDES DE RÉSERVATION REÇUES (PROPRIÉTAIRE)
// =========================
// Nouveau : avant, une réservation passait directement de "en_attente" au
// paiement, sans jamais demander l'avis du propriétaire — incohérent avec
// la promesse "vous ne serez débité qu'en cas d'acceptation". Cette route
// liste, pour le propriétaire connecté, toutes les demandes faites sur SES
// bateaux (peu importe le statut, pour qu'il voie aussi l'historique).

exports.getOwnerBookingRequests = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Boat,
          where: { userId: req.user.id },
        },
        {
          model: User,
          attributes: ["id", "nom", "prenom", "email"],
        },
        {
          model: Payment,
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Demandes de réservation récupérées avec succès",
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// ACCEPTER / REFUSER UNE DEMANDE (PROPRIÉTAIRE)
// =========================
// C'est CE verrou qui rend vraie la promesse "vous ne serez débité qu'en cas
// d'acceptation" : tant que le propriétaire n'a pas accepté, createStripeSession
// et createPaypalOrder refusent de créer la moindre session de paiement (voir
// paymentController.js).

exports.respondToBookingRequest = async (req, res) => {
  try {
    const { action } = req.body;

    if (action !== "accepter" && action !== "refuser") {
      return res.status(400).json({
        message: "Le champ action doit valoir \"accepter\" ou \"refuser\"",
      });
    }

    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Boat }],
    });

    if (!booking) {
      return res.status(404).json({
        message: "Réservation introuvable",
      });
    }

    if (!booking.Boat || booking.Boat.userId !== req.user.id) {
      return res.status(403).json({
        message: "Accès interdit : vous n'êtes pas propriétaire de ce bateau",
      });
    }

    if (booking.statut !== "en_attente") {
      return res.status(400).json({
        message: "Cette demande a déjà été traitée",
      });
    }

    booking.statut = action === "accepter" ? "acceptee" : "annulee";
    await booking.save();

    return res.status(200).json({
      message: action === "accepter" ? "Demande acceptée" : "Demande refusée",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// ANNULER UNE RÉSERVATION
// =========================
// Avant correction : changeait juste le statut en "annulee", sans jamais
// rembourser un paiement déjà encaissé chez Stripe — la réservation
// disparaissait côté site, mais le client restait débité. Corrigé pour :
// (1) refuser d'annuler une réservation déjà annulée/terminée, (2) appliquer
// la politique "annulation gratuite sous 48h avant le départ" (un admin peut
// passer au-delà, pour gérer un litige au cas par cas), (3) déclencher un
// vrai remboursement Stripe si un paiement "paye" existe, et ne basculer la
// réservation en "annulee" QUE si ce remboursement a réussi — pour ne jamais
// se retrouver avec une réservation annulée mais un client non remboursé.
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

    if (booking.statut === "annulee") {
      return res.status(400).json({
        message: "Cette réservation est déjà annulée",
      });
    }

    if (booking.statut === "terminee") {
      return res.status(400).json({
        message: "Une réservation terminée ne peut plus être annulée",
      });
    }

    const hoursUntilDeparture =
      (new Date(booking.dateDebut) - new Date()) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 48 && req.user.role !== "admin") {
      return res.status(400).json({
        message:
          "L'annulation gratuite n'est possible que jusqu'à 48h avant le départ. Contacte le propriétaire pour ce cas précis.",
      });
    }

    const existingPayment = await Payment.findOne({
      where: { bookingId: booking.id, statut: "paye" },
    });

    if (existingPayment) {
      try {
        if (existingPayment.methode === "paypal") {
          await paypalService.refundCapture(existingPayment.referenceTransaction);
        } else {
          await stripe.refunds.create({
            payment_intent: existingPayment.referenceTransaction,
          });
        }
      } catch (refundError) {
        return res.status(502).json({
          message:
            "Le remboursement a échoué, la réservation n'a pas été annulée : " +
            refundError.message,
        });
      }

      existingPayment.statut = "rembourse";
      await existingPayment.save();
    }

    booking.statut = "annulee";
    await booking.save();

    return res.status(200).json({
      message: existingPayment
        ? "Réservation annulée et paiement remboursé"
        : "Réservation annulée",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// PÉRIODES DÉJÀ RÉSERVÉES (public)
// =========================
// Utilisé par la fiche bateau pour signaler par texte les dates déjà prises
// AVANT que le visiteur ne choisisse une période (CDC accessibilité D.2.d :
// "dates indisponibles signalées par texte", pas seulement via une erreur
// après coup). Ne renvoie que des dates — aucune donnée personnelle sur le
// locataire, donc pas besoin d'authentification.
exports.getBookedDates = async (req, res) => {
  try {
    const { boatId } = req.params;

    const bookings = await Booking.findAll({
      where: {
        boatId,
        statut: { [Op.ne]: "annulee" },
      },
      attributes: ["dateDebut", "dateFin"],
      order: [["dateDebut", "ASC"]],
    });

    return res.status(200).json({
      bookedDates: bookings.map((b) => ({
        dateDebut: b.dateDebut,
        dateFin: b.dateFin,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};