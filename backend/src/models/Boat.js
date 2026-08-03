const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Boat = sequelize.define("Boat", {
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
    type: DataTypes.ENUM("voilier", "bateau_moteur", "catamaran", "yacht", "semi_rigide", "autre"),
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  localisation: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  prixJour: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  capacite: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  longueur: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  avecSkipper: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  latitude: {
  type: DataTypes.FLOAT,
  allowNull: true,
},

longitude: {
  type: DataTypes.FLOAT,
  allowNull: true,
},

  statut: {
    type: DataTypes.ENUM("brouillon", "en_attente", "publie", "suspendu"),
    defaultValue: "en_attente",
  },
});

module.exports = Boat;