const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define("Message", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  conversationId: { type: DataTypes.INTEGER, allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: false },

  contenu: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: { msg: "Le message ne peut pas être vide." } },
  },

  // null = non lu, Date = heure de lecture
  luAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
});

module.exports = Message;