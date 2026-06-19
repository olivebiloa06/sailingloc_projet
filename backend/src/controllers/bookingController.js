const { Op } = require("sequelize");
const { sequelize, Booking, Boat, Availability } = require("../models");

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
    const { boatId, dateDebut, dateFin, nombrePersonnes } = req.body;

    if (!boatId || !dateDebut || !dateFin) {
      await transaction.rollback();
      return res.status(400).json({
        message: "boatId, dateDebut et dateFin sont obligatoires.",
      });
    }

    const start = new Date(dateDebut);
    const end = new Date(dateFin);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
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

    const nombreJours = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const montantTotal = nombreJours * boat.prixJour;
    const commission = montantTotal * 0.1;

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
// ANNULER UNE RÉSERVATION
// =========================

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