const { Op } = require("sequelize");
const { Boat, User } = require("../models");

// Champs qu'un propriétaire est autorisé à modifier lui-même sur son bateau.
// userId et statut sont volontairement exclus : un propriétaire ne doit pas
// pouvoir transférer son bateau à un autre compte (userId) ni s'auto-publier
// en contournant une éventuelle modération (statut). Seul un admin peut
// modifier ces champs (voir updateBoat).
const OWNER_EDITABLE_FIELDS = [
  "nom",
  "type",
  "description",
  "localisation",
  "prixJour",
  "capacite",
  "longueur",
  "avecSkipper",
  "imageUrl",
  "latitude",
  "longitude",
];

// Attributs User strictement nécessaires à l'affichage public d'un bateau.
// L'email et le rôle du propriétaire n'ont rien à faire visibles par un
// visiteur non connecté (fuite de données personnelles).
const PUBLIC_OWNER_ATTRIBUTES = ["id", "nom", "prenom"];

// Ajouter un bateau
exports.createBoat = async (req, res) => {
  try {
    const {
      nom,
      type,
      description,
      localisation,
      prixJour,
      capacite,
      longueur,
      avecSkipper,
      imageUrl,
      latitude,
      longitude,
    } = req.body;

    const boat = await Boat.create({
      nom,
      type,
      description,
      localisation,
      prixJour,
      capacite,
      longueur,
      avecSkipper,
      imageUrl,
      latitude,
      longitude,
      statut: "publie",
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Bateau créé avec succès",
      boat,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/// Voir tous les bateaux + recherche avancée
exports.getAllBoats = async (req, res) => {
  try {
    const {
      localisation,
      type,
      minPrice,
      maxPrice,
      capacite,
      avecSkipper,
      search,
    } = req.query;

    const filters = {};

    if (localisation) {
      filters.localisation = {
        [Op.iLike]: `%${localisation}%`,
      };
    }

    if (type) {
      filters.type = type;
    }

    if (capacite) {
      filters.capacite = {
        [Op.gte]: Number(capacite),
      };
    }

    if (avecSkipper !== undefined) {
      filters.avecSkipper = avecSkipper === "true";
    }

    if (minPrice || maxPrice) {
      filters.prixJour = {};

      if (minPrice) {
        filters.prixJour[Op.gte] = Number(minPrice);
      }

      if (maxPrice) {
        filters.prixJour[Op.lte] = Number(maxPrice);
      }
    }

    if (search) {
      filters[Op.or] = [
        {
          nom: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          description: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          localisation: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const boats = await Boat.findAll({
      where: filters,
      include: [
        {
          model: User,
          attributes: PUBLIC_OWNER_ATTRIBUTES,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Liste des bateaux récupérée avec succès",
      total: boats.length,
      filters: req.query,
      boats,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir détail bateau
exports.getBoatById = async (req, res) => {
  try {
    const { id } = req.params;

    const boat = await Boat.findByPk(id, {
      include: [
        {
          model: User,
          attributes: PUBLIC_OWNER_ATTRIBUTES,
        },
      ],
    });

    if (!boat) {
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    return res.status(200).json({
      message: "Détail du bateau récupéré avec succès",
      boat,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Modifier un bateau
exports.updateBoat = async (req, res) => {
  try {
    const { id } = req.params;

    const boat = await Boat.findByPk(id);

    if (!boat) {
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    if (boat.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : vous n’êtes pas propriétaire de ce bateau",
      });
    }

    // SÉCURITÉ : on ne fait plus boat.update(req.body) tel quel (mass
    // assignment). Un admin peut tout modifier (y compris userId/statut pour
    // de la modération) ; un propriétaire ne peut modifier que les champs de
    // la whitelist OWNER_EDITABLE_FIELDS.
    const payload =
      req.user.role === "admin"
        ? req.body
        : Object.fromEntries(
            Object.entries(req.body).filter(([key]) =>
              OWNER_EDITABLE_FIELDS.includes(key)
            )
          );

    await boat.update(payload);

    return res.status(200).json({
      message: "Bateau modifié avec succès",
      boat,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Supprimer un bateau
exports.deleteBoat = async (req, res) => {
  try {
    const { id } = req.params;

    const boat = await Boat.findByPk(id);

    if (!boat) {
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    if (boat.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : vous n’êtes pas propriétaire de ce bateau",
      });
    }

    await boat.destroy();

    return res.status(200).json({
      message: "Bateau supprimé avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};