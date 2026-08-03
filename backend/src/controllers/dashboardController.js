const { Boat, Booking, Payment, Review, Contract } = require("../models");

// Dashboard propriétaire complet
exports.getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const boats = await Boat.findAll({
      where: {
        userId: ownerId,
      },
      include: [
        {
          model: Booking,
          include: [
            {
              model: Payment,
            },
          ],
        },
        {
          model: Review,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Dashboard propriétaire récupéré avec succès",
      boats,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Statistiques propriétaire
exports.getOwnerStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const boats = await Boat.findAll({
      where: {
        userId: ownerId,
      },
      include: [
        {
          model: Booking,
          include: [
            {
              model: Payment,
            },
          ],
        },
        {
          model: Review,
        },
      ],
    });

    const totalBoats = boats.length;

    let totalBookings = 0;
    let confirmedBookings = 0;
    let totalRevenue = 0;
    let totalReviews = 0;
    let totalNotes = 0;

    boats.forEach((boat) => {
      totalBookings += boat.Bookings.length;
      totalReviews += boat.Reviews.length;

      boat.Reviews.forEach((review) => {
        totalNotes += review.note;
      });

      boat.Bookings.forEach((booking) => {
        if (booking.statut === "confirmee") {
          confirmedBookings += 1;
          totalRevenue += booking.montantTotal;
        }
      });
    });

    const averageRating =
      totalReviews > 0 ? totalNotes / totalReviews : 0;

    return res.status(200).json({
      message: "Statistiques propriétaire récupérées avec succès",
      stats: {
        totalBoats,
        totalBookings,
        confirmedBookings,
        totalRevenue,
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};