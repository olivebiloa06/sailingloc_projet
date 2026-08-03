const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Une conversation entre deux utilisateurs, optionnellement liée à une
// réservation (pour que locataire et propriétaire puissent discuter du
// contexte précis de leur location).
const Conversation = sequelize.define(
  "Conversation",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

 
    participant1Id: { type: DataTypes.INTEGER, allowNull: false },
    participant2Id: { type: DataTypes.INTEGER, allowNull: false },

    bookingId: { type: DataTypes.INTEGER, allowNull: true },


    lastMessageAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
   
    indexes: [
      { unique: true, fields: ["participant1Id", "participant2Id", "bookingId"] },
    ],
  }
);

module.exports = Conversation;