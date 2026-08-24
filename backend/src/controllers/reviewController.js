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
// DERNIERS AVIS (public)
// =========================
// Utilisé par la homepage. Volontairement limité aux champs affichables :
// pas d'email ni de données de réservation, la route est ouverte à tous.
exports.getLatestReviews = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 20);

    const reviews = await Review.findAll({
      attributes: ["id", "note", "commentaire", "createdAt"],
      include: [
        {
          model: User,
          attributes: ["id", "prenom", "nom", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    });

    return res.status(200).json({ reviews, count: reviews.length });
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

    const review = await Review.create({
      bookingId,
      boatId: booking.boatId,
      userId: req.user.id,
      note,
      commentaire: commentaire || "",
    });

    return res.status(201).json({
      message: "Avis publié avec succès",
      review,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};