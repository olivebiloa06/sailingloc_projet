const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    // Récupérer header Authorization
    const authHeader = req.headers.authorization;

    // Vérifier si token existe
    if (!authHeader) {
      return res.status(401).json({
        message: "Token manquant",
      });
    }

    // Extraire token
    const token = authHeader.split(" ")[1];

    // Vérifier token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Ajouter utilisateur dans req
    req.user = decoded;

    // Passer à la suite
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token invalide",
    });
  }
};