const {
  User, Booking, Boat, Payment, Document,
  Review, Contract, Favorite, RefreshToken,
  Conversation, Message, Availability,
} = require("../models");

// Voir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["motDePasse"] },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ message: "Utilisateurs récupérés avec succès", users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Changer le rôle d'un utilisateur
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["locataire", "proprietaire", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    await user.update({ role });
    return res.status(200).json({
      message: "Rôle utilisateur mis à jour",
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// SUPPRIMER UN UTILISATEUR (admin)
// =========================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // L'admin ne peut pas se supprimer lui-même
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Suppression en cascade manuelle pour éviter les erreurs FK
    // 1. Messages des conversations
    const conversations = await Conversation.findAll({
      where: { participant1Id: id },
    });
    for (const conv of conversations) {
      await Message.destroy({ where: { conversationId: conv.id } });
    }
    await Conversation.destroy({
      where: { participant1Id: id },
    });
    await Message.destroy({ where: { senderId: id } });

    // 2. Conversations où il est participant2
    const convs2 = await Conversation.findAll({ where: { participant2Id: id } });
    for (const conv of convs2) {
      await Message.destroy({ where: { conversationId: conv.id } });
    }
    await Conversation.destroy({ where: { participant2Id: id } });

    // 3. Favoris
    await Favorite.destroy({ where: { userId: id } });

    // 4. Avis
    await Review.destroy({ where: { userId: id } });

    // 5. Contrats liés aux réservations de l'utilisateur
    const bookings = await Booking.findAll({ where: { userId: id } });
    for (const booking of bookings) {
      await Contract.destroy({ where: { bookingId: booking.id } });
    }

    // 6. Paiements
    await Payment.destroy({ where: { bookingId: bookings.map((b) => b.id) } });

    // 7. Réservations
    await Booking.destroy({ where: { userId: id } });

    // 8. Documents
    await Document.destroy({ where: { userId: id } });

    // 9. Disponibilités et bateaux
    const boats = await Boat.findAll({ where: { userId: id } });
    for (const boat of boats) {
      await Availability.destroy({ where: { boatId: boat.id } });
      await Review.destroy({ where: { boatId: boat.id } });
      await Favorite.destroy({ where: { boatId: boat.id } });
    }
    await Boat.destroy({ where: { userId: id } });

    // 10. Refresh tokens
    await RefreshToken.destroy({ where: { userId: id } });

    // 11. Supprime l'utilisateur
    await user.destroy();

    return res.status(200).json({ message: `Utilisateur ${user.email} supprimé avec succès.` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
    return res.status(200).json({ message: "Réservations récupérées avec succès", bookings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
    return res.status(200).json({ message: "Paiements récupérés avec succès", payments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
    return res.status(200).json({ message: "Documents récupérés avec succès", documents });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
    return res.status(200).json({ message: "Avis récupérés avec succès", reviews });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Supprimer un avis (modération)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Avis introuvable" });
    await review.destroy();
    return res.status(200).json({ message: "Avis supprimé" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};