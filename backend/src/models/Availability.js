const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Availability = sequelize.define("Availability", {
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

  statut: {
    type: DataTypes.ENUM("disponible", "reserve", "indisponible"),
    defaultValue: "disponible",
  },
});

module.exports = Availability;