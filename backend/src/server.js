const { sequelize } = require("./models");
const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const boatRoutes = require("./routes/boatRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/boats", boatRoutes);
app.use("/api/availabilities", availabilityRoutes);

app.get("/", (req, res) => {
  res.send("API SailingLoc fonctionne !");
});

const PORT = process.env.PORT || 5000;

    const startServer = async () => {
    try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    console.log("Connexion PostgreSQL réussie.");
    console.log("Tables synchronisées avec PostgreSQL.");

    app.listen(PORT, () => {
        console.log(`Serveur lancé sur le port ${PORT}`);
    });
    } catch (error) {
    console.error("Erreur de connexion PostgreSQL :", error.message);
    }
};

startServer();