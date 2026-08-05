const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Production — Neon / Railway / Render avec URL complète
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Développement local — variables séparées
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    String(process.env.DB_PASSWORD),
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
      port: Number(process.env.DB_PORT) || 5432,
      logging: false,
    }
  );
}

module.exports = sequelize;