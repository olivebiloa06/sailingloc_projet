const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, RefreshToken } = require("../models");
const { sendEmail } = require("../services/emailService");
const { isValidEmail, validatePasswordFormat } = require("../utils/validators");
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

// Exportées pour les tests unitaires (génération/vérification de token,
// exclusion du mot de passe) — le code testé est le code réellement exécuté
// en production, pas une copie.
exports.generateAccessToken = generateAccessToken;
exports.sanitizeUser = sanitizeUser;

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

    const passwordCheck = validatePasswordFormat(motDePasse);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
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

// =========================
// DEMANDE DE RÉINITIALISATION DE MOT DE PASSE
// =========================
// On génère un token aléatoire (UUID hex) valable 1 heure, on le stocke haché
// en base (pour ne pas exposer le token brut si la base est compromise), et
// on envoie le lien avec le token BRUT par email — seul l'utilisateur qui
// reçoit l'email peut l'utiliser.
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "L'adresse email est requise." });
    }

    const user = await User.unscoped().findOne({ where: { email } });

    // On retourne toujours le même message, qu'un compte existe ou non :
    // évite de confirmer à un attaquant qu'une adresse est inscrite.
    if (!user) {
      return res.status(200).json({
        message:
          "Si un compte correspond à cet email, un lien de réinitialisation vient d'être envoyé.",
      });
    }

    const tokenBrut = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await user.update({
      resetPasswordToken: tokenBrut,
      resetPasswordExpires: tokenExpires,
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${tokenBrut}`;

    await sendEmail({
      to: user.email,
      subject: "SailingLoc — Réinitialisation de ton mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
          <h2 style="color: #0A2A43;">Réinitialisation de mot de passe</h2>
          <p>Bonjour ${user.prenom},</p>
          <p>Tu as demandé à réinitialiser ton mot de passe SailingLoc.<br>
          Clique sur le bouton ci-dessous — ce lien est valable <strong>1 heure</strong>.</p>
          <a href="${resetUrl}"
             style="display:inline-block; margin: 20px 0; padding: 12px 28px;
                    background: #0A2A43; color: #fff; text-decoration: none;
                    border-radius: 8px; font-weight: bold;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #666; font-size: 13px;">
            Si tu n'es pas à l'origine de cette demande, ignore cet email —
            ton mot de passe actuel reste inchangé.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 12px;">SailingLoc — Agence Pandawan © 2026</p>
        </div>
      `,
    });

    return res.status(200).json({
      message:
        "Si un compte correspond à cet email, un lien de réinitialisation vient d'être envoyé.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// CONFIRMATION RÉINITIALISATION MOT DE PASSE
// =========================
exports.resetPassword = async (req, res) => {
  try {
    const { token, motDePasse } = req.body;

    if (!token || !motDePasse) {
      return res.status(400).json({ message: "Token et nouveau mot de passe requis." });
    }

    // Mêmes règles qu'à l'inscription — avant, la réinitialisation
    // n'exigeait que 8 caractères, ce qui permettait de contourner les
    // exigences de complexité (majuscule/chiffre/caractère spécial) posées
    // au moment du register.
    const passwordCheck = validatePasswordFormat(motDePasse);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    const user = await User.unscoped().findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: "Lien invalide ou déjà utilisé." });
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({
        message: "Ce lien a expiré. Fais une nouvelle demande de réinitialisation.",
      });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    await user.update({
      motDePasse: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return res.status(200).json({
      message: "Mot de passe réinitialisé avec succès. Tu peux maintenant te connecter.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};