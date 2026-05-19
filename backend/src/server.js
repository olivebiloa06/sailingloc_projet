const { sequelize } = require("./models");
const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const path = require("path");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const boatRoutes = require("./routes/boatRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contractRoutes = require("./routes/contractRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const documentRoutes = require("./routes/documentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/boats", boatRoutes);
app.use("/api/availabilities", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/documents", documentRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/uploads", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
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