require("dotenv").config();

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
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
const messageRoutes = require("./routes/messageRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();
const httpServer = createServer(app);

const app = express();
app.set("trust proxy", 1); 

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });
  socket.on("typing", ({ conversationId, prenom }) => {
    socket.to(`conversation:${conversationId}`).emit("typing", { prenom });
  });
  socket.on("stop_typing", ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit("stop_typing");
  });
});

app.set("io", io);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan("dev"));

app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 10000,
  max: 100000,
  message: { message: "Trop de requêtes, veuillez réessayer plus tard." },
});
app.use("/api", apiLimiter);

const boatUploadsDir = path.join(__dirname, "../uploads/boats");
fs.mkdirSync(boatUploadsDir, { recursive: true });
app.use("/uploads/boats", express.static(boatUploadsDir));

const contractsUploadsDir = path.join(__dirname, "../uploads/contracts");
fs.mkdirSync(contractsUploadsDir, { recursive: true });
app.use("/uploads/contracts", express.static(contractsUploadsDir));

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
app.use("/api/conversations", messageRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  res.status(404).json({ message: "Ressource introuvable." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production"
      ? "Une erreur interne est survenue."
      : err.message,
  });
});

const PORT = process.env.NODE_ENV === "test" ? 0 : (process.env.PORT || 5000);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connexion PostgreSQL réussie.");

    if (process.env.NODE_ENV !== "production") {
  await sequelize.sync({ alter: true });
  console.log("Tables synchronisées avec PostgreSQL (mode développement).");
} else {
  console.log("Mode production : sync désactivé.");
}

    httpServer.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT} (HTTP + WebSocket)`);
    });
  } catch (error) {
    console.error("Erreur de connexion PostgreSQL :", error.message);
  }
};


if (require.main === module) {
  startServer();
}

module.exports = httpServer;