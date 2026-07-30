const { Review, User, Booking, Boat } = require("../models");

// =========================
// AVIS PAR BATEAU (public)
// =========================
// Utilisé sur la fiche bateau ET pour calculer la note moyenne
// affichée sur les cartes de la liste et de la homepage.
exports.getReviewsByBoat = async (req, res) => {
  try {
    const { boatId } = req.params;

    const reviews = await Review.findAll({
      where: { boatId },
      include: [
        {
          model: User,
          attributes: ["id", "prenom", "nom"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Note moyenne calculée ici pour éviter de le faire côté client
    // sur chaque appel — une seule requête, tout est renvoyé.
    const average =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length
        : null;

    return res.status(200).json({
      reviews,
      average: average ? Math.round(average * 10) / 10 : null,
      count: reviews.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// DERNIERS AVIS (public — page "Avis" et témoignages de la homepage)
// =========================
// Contrairement à GET /admin/reviews (réservé aux admins), cet endpoint est
// public : il ne renvoie que ce qui est déjà affiché publiquement sur une
// fiche bateau (note, commentaire, auteur, bateau), donc rien de sensible.
exports.getLatestReviews = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ["id", "prenom", "nom", "role"] },
        { model: Boat, attributes: ["id", "nom"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    });

    return res.status(200).json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// CRÉER UN AVIS (locataire authentifié)
// =========================
exports.createReview = async (req, res) => {
  try {
    const { bookingId, note, commentaire } = req.body;

    if (!bookingId || !note) {
      return res.status(400).json({
        message: "bookingId et note sont obligatoires.",
      });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({
        message: "La note doit être comprise entre 1 et 5.",
      });
    }

    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Boat }],
    });

    if (!booking) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        message: "Vous ne pouvez laisser un avis que sur vos propres réservations.",
      });
    }

    if (!["confirmee", "terminee"].includes(booking.statut)) {
      return res.status(400).json({
        message: "Vous ne pouvez laisser un avis que sur une réservation confirmée ou terminée.",
      });
    }

    const existing = await Review.findOne({ where: { bookingId } });
    if (existing) {
      return res.status(400).json({
        message: "Vous avez déjà laissé un avis pour cette réservation.",
      });
    }

    let review;
    try {
      review = await Review.create({
        bookingId,
        boatId: booking.boatId,
        userId: req.user.id,
        note,
        commentaire: commentaire || "",
      });
    } catch (createError) {

      if (createError.name !== "SequelizeUniqueConstraintError") throw createError;
      return res.status(400).json({
        message: "Vous avez déjà laissé un avis pour cette réservation.",
      });
    }

    return res.status(201).json({
      message: "Avis publié avec succès",
      review,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};