require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const { sequelize } = require("./models");
const paymentController = require("./controllers/paymentController");

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const boatRoutes = require("./routes/boatRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contractRoutes = require("./routes/contractRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const articleRoutes = require("./routes/articleRoutes");
const documentRoutes = require("./routes/documentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(helmet());
app.use(morgan("dev"));

// ---------------------------------------------------------------------------
// Webhook Stripe — DOIT être monté avant express.json(), avec son propre
// express.raw(), et appeler directement le contrôleur (pas le routeur
// paymentRoutes). Avant ce correctif, cette route était aussi atteignable via
// app.use("/api/payments", paymentRoutes) plus bas, déjà passé par
// express.json() : stripe.webhooks.constructEvent() recevait alors un objet
// JS au lieu du buffer brut attendu, et la vérification de signature échouait
// systématiquement. Le routeur paymentRoutes ne définit donc plus cette route
// du tout (voir routes/paymentRoutes.js) : il n'y a plus qu'un seul chemin
// possible pour /api/payments/stripe/webhook.
app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

// CORS restreint à l'origine du front (pas de wildcard "*"), nécessaire pour
// que le cookie HttpOnly du refresh token puisse être envoyé/reçu en
// cross-origin (credentials: true). FRONTEND_URL doit être défini dans .env.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Trop de requêtes, veuillez réessayer plus tard.",
  },
});

app.use("/api", apiLimiter);

// ---------------------------------------------------------------------------
// Fichiers statiques — uniquement les visuels publics (photos de bateaux).
// Les documents sensibles (permis, pièce d'identité, assurance...) ne sont
// JAMAIS servis via express.static : ils passent par
// GET /api/documents/:id/file, qui vérifie l'authentification ET la
// propriété du document avant d'envoyer le fichier (voir documentController).
const boatUploadsDir = path.join(__dirname, "../uploads/boats");
fs.mkdirSync(boatUploadsDir, { recursive: true });
app.use("/uploads/boats", express.static(boatUploadsDir));

app.get("/", (req, res) => {
  res.send("API SailingLoc fonctionne !");
});

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/boats", boatRoutes);
app.use("/api/availabilities", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Gestion centralisée des routes inconnues et des erreurs non interceptées,
// pour ne jamais laisser fuiter une stack trace brute au client.
app.use((req, res) => {
  res.status(404).json({ message: "Ressource introuvable." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Une erreur interne est survenue."
        : err.message,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connexion PostgreSQL réussie.");

    if (process.env.NODE_ENV === "production") {
      // En production, AUCUN sync automatique : le schéma de base doit être
      // géré par de vraies migrations Sequelize (sequelize-cli db:migrate),
      // pas par sync({ alter: true }), qui peut modifier/supprimer des
      // colonnes en production de façon imprévisible.
      console.log(
        "Mode production : sync désactivé, exécutez les migrations manuellement."
      );
    } else {
      await sequelize.sync({ alter: true });
      console.log("Tables synchronisées avec PostgreSQL (mode développement).");
    }

    app.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de connexion PostgreSQL :", error.message);
  }
};

startServer();