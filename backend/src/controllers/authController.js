const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;

    // Vérifier si email existe déjà
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Cet email existe déjà",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// LOGIN
// =========================

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérifier utilisateur
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    // Vérifier mot de passe
    const isPasswordValid = await bcrypt.compare(
      motDePasse,
      user.motDePasse
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Mot de passe incorrect",
      });
    }

    // Générer token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};