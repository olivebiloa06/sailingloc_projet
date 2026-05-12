const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const {
  verifyToken,
} = require("../middlewares/authMiddleware");

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// ROUTE PROTEGEE
router.get(
  "/profile",
  verifyToken,
  (req, res) => {
    res.json({
      message: "Route protégée",
      user: req.user,
    });
  }
);

module.exports = router;