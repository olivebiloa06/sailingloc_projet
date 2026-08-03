const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    motDePasse: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("locataire", "proprietaire", "admin"),
      defaultValue: "locataire",
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    defaultScope: {
      // Sécurité : le hash du mot de passe ne sort JAMAIS par défaut d'une
      // requête User.findAll/findOne/findByPk, même si un contrôleur oublie
      // de l'exclure explicitement. Pour le login (qui a besoin du hash pour
      // bcrypt.compare), utiliser User.unscoped().findOne(...).
      attributes: { exclude: ["motDePasse"] },
    },
  }
);

module.exports = User;