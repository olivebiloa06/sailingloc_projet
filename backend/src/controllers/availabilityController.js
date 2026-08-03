const { Op } = require("sequelize");
const { Availability, Boat } = require("../models");


async function hasOverlappingAvailability(boatId, dateDebut, dateFin, excludeId) {
  const overlapping = await Availability.findOne({
    where: {
      boatId,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      dateDebut: { [Op.lt]: dateFin },
      dateFin: { [Op.gt]: dateDebut },
    },
  });
  return !!overlapping;
}

// Ajouter une disponibilité
exports.createAvailability = async (req, res) => {
  try {
    const { boatId, dateDebut, dateFin, statut } = req.body;

    const boat = await Boat.findByPk(boatId);

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

    if (await hasOverlappingAvailability(boatId, dateDebut, dateFin)) {
      return res.status(409).json({
        message: "Une autre fenêtre de disponibilité existe déjà sur une partie de cette période pour ce bateau.",
      });
    }

    const availability = await Availability.create({
      boatId,
      dateDebut,
      dateFin,
      statut,
    });

    return res.status(201).json({
      message: "Disponibilité ajoutée avec succès",
      availability,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir les disponibilités d’un bateau
exports.getAvailabilitiesByBoat = async (req, res) => {
  try {
    const { boatId } = req.params;

    const availabilities = await Availability.findAll({
      where: { boatId },
      order: [["dateDebut", "ASC"]],
    });

    return res.status(200).json({
      message: "Disponibilités récupérées avec succès",
      availabilities,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Modifier une disponibilité
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await Availability.findByPk(id, {
      include: [{ model: Boat }],
    });

    if (!availability) {
      return res.status(404).json({
        message: "Disponibilité introuvable",
      });
    }

    if (
      availability.Boat.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Accès interdit",
      });
    }

    const dateDebut = req.body.dateDebut ?? availability.dateDebut;
    const dateFin = req.body.dateFin ?? availability.dateFin;

    if (await hasOverlappingAvailability(availability.boatId, dateDebut, dateFin, availability.id)) {
      return res.status(409).json({
        message: "Une autre fenêtre de disponibilité existe déjà sur une partie de cette période pour ce bateau.",
      });
    }

    await availability.update(req.body);

    return res.status(200).json({
      message: "Disponibilité modifiée avec succès",
      availability,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Supprimer une disponibilité
exports.deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await Availability.findByPk(id, {
      include: [{ model: Boat }],
    });

    if (!availability) {
      return res.status(404).json({
        message: "Disponibilité introuvable",
      });
    }

    if (
      availability.Boat.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Accès interdit",
      });
    }

    await availability.destroy();

    return res.status(200).json({
      message: "Disponibilité supprimée avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};