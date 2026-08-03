const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Une conversation entre deux utilisateurs, optionnellement liée à une
// réservation (pour que locataire et propriétaire puissent discuter du
// contexte précis de leur location).
const Conversation = sequelize.define("Conversation", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  // Les deux participants — aucun ordre défini, on vérifie les deux
  participant1Id: { type: DataTypes.INTEGER, allowNull: false },
  participant2Id: { type: DataTypes.INTEGER, allowNull: false },

  // Rattachement optionnel à une réservation
  bookingId: { type: DataTypes.INTEGER, allowNull: true },

  // Dernier message affiché en aperçu dans la liste des conversations
  lastMessageAt: { type: DataTypes.DATE, allowNull: true },
});

module.exports = Conversation;