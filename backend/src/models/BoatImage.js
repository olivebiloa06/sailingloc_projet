const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Photos additionnelles d'un bateau — Boat.imageUrl reste la photo de
// couverture (utilisée dans les cartes/listes), BoatImage porte la galerie
// affichée sur la fiche détail.
const BoatImage = sequelize.define("BoatImage", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = BoatImage;
