const { Op } = require("sequelize");
const { Conversation, Message, User } = require("../models");

// Helper — vérifie que l'utilisateur fait partie de la conversation
async function findConversationForUser(conversationId, userId) {
  return Conversation.findOne({
    where: {
      id: conversationId,
      [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
    },
  });
}

// =========================
// LISTER MES CONVERSATIONS
// =========================
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id },
        ],
      },
      include: [
        { model: User, as: "participant1", attributes: ["id", "prenom", "nom"] },
        { model: User, as: "participant2", attributes: ["id", "prenom", "nom"] },
        {
          model: Message,
          order: [["createdAt", "DESC"]],
          limit: 1,
          as: "messages",
        },
      ],
      order: [["lastMessageAt", "DESC"]],
    });

    return res.status(200).json({ conversations });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// CRÉER OU RÉCUPÉRER UNE CONVERSATION
// =========================
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId, bookingId } = req.body;
    const myId = req.user.id;

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId est requis." });
    }

    if (otherUserId === myId) {
      return res.status(400).json({ message: "Impossible de créer une conversation avec soi-même." });
    }

    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }


  
    const participant1Id = Math.min(myId, otherUserId);
    const participant2Id = Math.max(myId, otherUserId);

    // Cherche une conversation existante entre les deux utilisateurs
    let conversation = await Conversation.findOne({
      where: {
        participant1Id,
        participant2Id,
        ...(bookingId ? { bookingId } : {}),
      },
    });

    if (!conversation) {
      try {
        conversation = await Conversation.create({
          participant1Id,
          participant2Id,
          bookingId: bookingId || null,
          lastMessageAt: new Date(),
        });
      } catch (createError) {

        if (createError.name !== "SequelizeUniqueConstraintError") throw createError;
        conversation = await Conversation.findOne({
          where: {
            participant1Id,
            participant2Id,
            ...(bookingId ? { bookingId } : {}),
          },
        });
      }
    }

    return res.status(200).json({ conversation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// MESSAGES D'UNE CONVERSATION
// =========================
exports.getMessages = async (req, res) => {
  try {
    const conversation = await findConversationForUser(req.params.id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation introuvable." });
    }

    const messages = await Message.findAll({
      where: { conversationId: conversation.id },
      include: [{ model: User, as: "sender", attributes: ["id", "prenom", "nom"] }],
      order: [["createdAt", "ASC"]],
    });

    // Marque comme lus les messages de l'autre utilisateur
    await Message.update(
      { luAt: new Date() },
      {
        where: {
          conversationId: conversation.id,
          senderId: { [Op.ne]: req.user.id },
          luAt: null,
        },
      }
    );

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// ENVOYER UN MESSAGE (REST — socket.io fait l'émission temps réel)
// =========================
exports.sendMessage = async (req, res) => {
  try {
    const { contenu } = req.body;

    if (!contenu?.trim()) {
      return res.status(400).json({ message: "Le message ne peut pas être vide." });
    }

    const conversation = await findConversationForUser(req.params.id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation introuvable." });
    }

    const message = await Message.create({
      conversationId: conversation.id,
      senderId: req.user.id,
      contenu: contenu.trim(),
    });

    await conversation.update({ lastMessageAt: new Date() });

    // Récupère le message avec le sender pour l'émission socket
    const full = await Message.findByPk(message.id, {
      include: [{ model: User, as: "sender", attributes: ["id", "prenom", "nom"] }],
    });

    // Émet l'événement temps réel (le serveur Socket.io est monté dans server.js)
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversation.id}`).emit("new_message", full);
    }

    return res.status(201).json({ message: full });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// NOMBRE DE MESSAGES NON LUS
// =========================
exports.getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ participant1Id: req.user.id }, { participant2Id: req.user.id }],
      },
      attributes: ["id"],
    });

    const ids = conversations.map((c) => c.id);

    const count = await Message.count({
      where: {
        conversationId: { [Op.in]: ids },
        senderId: { [Op.ne]: req.user.id },
        luAt: null,
      },
    });

    return res.status(200).json({ unread: count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};