const { Review, Booking, Boat } = require("../models");

// Créer un avis
exports.createReview = async (req, res) => {
  try {
    const { bookingId, note, commentaire } = req.body;

    const booking = await Booking.findByPk(bookingId, {
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

    if (booking.statut !== "terminee" && booking.statut !== "confirmee") {
      return res.status(400).json({
        message: "Vous ne pouvez laisser un avis que pour une réservation confirmée ou terminée",
      });
    }

    const existingReview = await Review.findOne({
      where: {
        bookingId,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Un avis existe déjà pour cette réservation",
      });
    }

    const review = await Review.create({
      bookingId,
      boatId: booking.boatId,
      userId: req.user.id,
      note,
      commentaire,
    });

    return res.status(201).json({
      message: "Avis ajouté avec succès",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir les avis d’un bateau
exports.getReviewsByBoat = async (req, res) => {
  try {
    const { boatId } = req.params;

    const reviews = await Review.findAll({
      where: {
        boatId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Avis du bateau récupérés avec succès",
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir mes avis
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
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

    return res.status(200).json({
      message: "Mes avis récupérés avec succès",
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Supprimer un avis
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        message: "Avis introuvable",
      });
    }

    if (review.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : vous ne pouvez pas supprimer cet avis",
      });
    }

    await review.destroy();

    return res.status(200).json({
      message: "Avis supprimé avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};