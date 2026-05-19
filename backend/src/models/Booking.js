const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  dateDebut: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  dateFin: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  nombrePersonnes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

  montantTotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  commission: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  statut: {
    type: DataTypes.ENUM(
      "en_attente",
      "confirmee",
      "annulee",
      "terminee"
    ),
    defaultValue: "en_attente",
  },
});

module.exports = Booking;