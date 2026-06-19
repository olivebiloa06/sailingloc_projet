const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, RefreshToken } = require("../models");
const {
  ACCESS_TOKEN_TTL,
  REFRESH_COOKIE_NAME,
  createRefreshToken,
  hashToken,
  refreshCookieOptions,
} = require("../utils/tokens");

// Rôles qu'un utilisateur peut choisir lui-même à l'inscription.
// "admin" ne doit JAMAIS pouvoir être obtenu via /register : la promotion
// vers admin se fait uniquement via PATCH /api/admin/users/:id/role, route
// déjà protégée par authorizeRoles("admin").
const ALLOWED_SELF_ROLES = ["locataire", "proprietaire"];

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

// Le defaultScope du modèle User exclut déjà motDePasse, mais on garde cette
// étape explicite en plus (défense en profondeur) : même si un autre point du
// code utilisait .unscoped() ou .scope(null) par erreur, motDePasse ne sort
// jamais d'ici.
const sanitizeUser = (user) => {
  const { motDePasse, ...safeUser } = user.toJSON();
  return safeUser;
};

const generateAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_TTL,
    }
  );

// Crée un nouveau refresh token en base pour cet utilisateur et pose le
// cookie HttpOnly correspondant sur la réponse.
const issueRefreshToken = async (user, res) => {
  const { raw, hash, expiresAt } = createRefreshToken();

  await RefreshToken.create({
    userId: user.id,
    tokenHash: hash,
    expiresAt,
  });

  res.cookie(REFRESH_COOKIE_NAME, raw, refreshCookieOptions());
};

// =========================
// REGISTER
// =========================

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Adresse email invalide.",
      });
    }

    if (motDePasse.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    // Vérifier si email existe déjà
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Cet email existe déjà",
      });
    }

    // SÉCURITÉ : le rôle envoyé par le client n'est accepté que s'il fait
    // partie des rôles auto-attribuables. Toute autre valeur (notamment
    // "admin") retombe silencieusement sur "locataire".
    const safeRole = ALLOWED_SELF_ROLES.includes(role) ? role : "locataire";

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      role: safeRole,
    });

    // Connexion directe après inscription
    const accessToken = generateAccessToken(user);
    await issueRefreshToken(user, res);

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      accessToken,
      user: sanitizeUser(user),
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

    if (!email || !motDePasse) {
      return res.status(400).json({
        message: "Email et mot de passe requis.",
      });
    }

    // .unscoped() : seul endroit du code où on a explicitement besoin du
    // hash du mot de passe (motDePasse), pour pouvoir le comparer avec
    // bcrypt. Partout ailleurs, le defaultScope de User l'exclut.
    const user = await User.unscoped().findOne({
      where: { email },
    });

    // Message volontairement identique que l'email soit inconnu ou le mot de
    // passe incorrect, pour ne pas permettre à un attaquant de deviner quels
    // emails sont inscrits sur la plateforme (énumération de comptes).
    const invalidCredentials = () =>
      res.status(401).json({
        message: "Email ou mot de passe incorrect",
      });

    if (!user) {
      return invalidCredentials();
    }

    const isPasswordValid = await bcrypt.compare(
      motDePasse,
      user.motDePasse
    );

    if (!isPasswordValid) {
      return invalidCredentials();
    }

    const accessToken = generateAccessToken(user);
    await issueRefreshToken(user, res);

    res.status(200).json({
      message: "Connexion réussie",
      accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// REFRESH — renouvelle l'access token à partir du cookie HttpOnly
// =========================

exports.refresh = async (req, res) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!rawToken) {
      return res.status(401).json({
        message: "Session expirée, veuillez vous reconnecter.",
      });
    }

    const tokenHash = hashToken(rawToken);

    const storedToken = await RefreshToken.findOne({
      where: { tokenHash },
    });

    const reject = () => {
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
      return res.status(401).json({
        message: "Session expirée, veuillez vous reconnecter.",
      });
    };

    if (!storedToken || storedToken.revokedAt) {
      return reject();
    }

    if (new Date(storedToken.expiresAt) < new Date()) {
      await storedToken.update({ revokedAt: new Date() });
      return reject();
    }

    const user = await User.findByPk(storedToken.userId);

    if (!user) {
      return reject();
    }

    // Rotation du refresh token : on révoque l'ancien et on en émet un
    // nouveau à chaque renouvellement. Ça limite la fenêtre de rejeu si un
    // refresh token venait à être intercepté.
    await storedToken.update({ revokedAt: new Date() });
    await issueRefreshToken(user, res);

    const accessToken = generateAccessToken(user);

    res.status(200).json({
      message: "Token renouvelé",
      accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// LOGOUT — révoque le refresh token courant
// =========================

exports.logout = async (req, res) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { tokenHash, revokedAt: null } }
      );
    }

    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());

    res.status(200).json({
      message: "Déconnexion réussie",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// PROFILE (utilisateur connecté)
// =========================

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    res.status(200).json({
      message: "Profil utilisateur récupéré avec succès",
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};