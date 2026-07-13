const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Article = sequelize.define("Article", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  categorie: {
    type: DataTypes.ENUM(
      "Actualités nautiques",
      "Guide de voyage",
      "Conseils de navigation",
      "Destination tendance"
    ),
    allowNull: false,
  },

  extrait: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: "Résumé court affiché sur la carte",
  },

  contenu: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: "Contenu complet affiché dans la modale",
  },

  // Optionnel : lien vers la page /boats avec filtre pré-rempli
  // Ex: "/boats?localisation=Corse" ou "/boats?type=voilier"
  lienBoats: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "/boats",
  },

  tempsLecture: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "5 min",
  },

  publie: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: "Seuls les articles publiés sont visibles sur le site",
  },
});

module.exports = Article;