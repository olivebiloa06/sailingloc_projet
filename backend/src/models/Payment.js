const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  montant: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  methode: {
    type: DataTypes.ENUM("stripe", "paypal", "carte_bancaire"),
    defaultValue: "stripe",
  },

  statut: {
    type: DataTypes.ENUM("en_attente", "paye", "echoue", "rembourse"),
    defaultValue: "en_attente",
  },

  referenceTransaction: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  datePaiement: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Payment;