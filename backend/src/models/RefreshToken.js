const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Un refresh token n'est jamais stocké en clair côté serveur : on stocke un
// hash SHA-256 du token, et on compare le hash du token reçu dans le cookie.
// Une ligne = une session active (un utilisateur peut être connecté sur
// plusieurs appareils en même temps, chacun avec son propre refresh token).
const RefreshToken = sequelize.define("RefreshToken", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  tokenHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = RefreshToken;