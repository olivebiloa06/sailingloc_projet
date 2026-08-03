const {
  User,
  Booking,
  Boat,
  Payment,
  Document,
  Review,
} = require("../models");

// Voir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["motDePasse"] },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Utilisateurs récupérés avec succès",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Changer le rôle d’un utilisateur
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["locataire", "proprietaire", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Rôle invalide",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    await user.update({ role });

    return res.status(200).json({
      message: "Rôle utilisateur mis à jour",
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir toutes les réservations
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ["id", "nom", "prenom", "email", "role"] },
        { model: Boat },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Réservations récupérées avec succès",
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir tous les paiements
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Booking,
          include: [
            { model: User, attributes: ["id", "nom", "prenom", "email"] },
            { model: Boat },
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

// Voir tous les documents
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      include: [
        { model: User, attributes: ["id", "nom", "prenom", "email", "role"] },
        { model: Boat },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Documents récupérés avec succès",
      documents,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir tous les avis
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ["id", "nom", "prenom", "email"] },
        { model: Boat },
        { model: Booking },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Avis récupérés avec succès",
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
// Supprimer un avis (modération)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }
    await review.destroy();
    return res.status(200).json({ message: "Avis supprimé" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};