const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Contract = sequelize.define("Contract", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  urlPdf: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  statut: {
    type: DataTypes.ENUM("genere", "envoye", "signe", "annule"),
    defaultValue: "genere",
  },

  signatureElectronique: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  dateGeneration: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Contract;