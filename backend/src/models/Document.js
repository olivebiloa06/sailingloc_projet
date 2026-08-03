const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Document = sequelize.define("Document", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  type: {
    type: DataTypes.ENUM(
      "permis",
      "assurance",
      "certificat_bateau",
      "piece_identite",
      "autre"
    ),
    allowNull: false,
  },

  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  statutValidation: {
    type: DataTypes.ENUM("en_attente", "valide", "refuse"),
    defaultValue: "en_attente",
  },

  commentaireAdmin: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Document;