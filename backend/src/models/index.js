const sequelize = require("../config/database");

const User = require("./User");
const Boat = require("./Boat");
const Availability = require("./Availability");
const Booking = require("./Booking");
const Payment = require("./Payment");
const Review = require("./Review");
const Contract = require("./Contract");
const Document = require("./Document");
const RefreshToken = require("./RefreshToken");

// =======================
// USER RELATIONS
// =======================

User.hasMany(Boat, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Boat.belongsTo(User, {
  foreignKey: "userId",
});

// =======================
// BOAT / AVAILABILITY
// =======================

Boat.hasMany(Availability, {
  foreignKey: "boatId",
  onDelete: "CASCADE",
  as: "availabilities",
});

Availability.belongsTo(Boat, {
  foreignKey: "boatId",
});

// =======================
// USER / BOOKING
// =======================

User.hasMany(Booking, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Booking.belongsTo(User, {
  foreignKey: "userId",
});

// =======================
// BOAT / BOOKING
// =======================

Boat.hasMany(Booking, {
  foreignKey: "boatId",
  onDelete: "CASCADE",
});

Booking.belongsTo(Boat, {
  foreignKey: "boatId",
});

// =======================
// BOOKING / PAYMENT
// =======================

Booking.hasOne(Payment, {
  foreignKey: "bookingId",
  onDelete: "CASCADE",
});

Payment.belongsTo(Booking, {
  foreignKey: "bookingId",
});

// =======================
// BOOKING / CONTRACT
// =======================

Booking.hasOne(Contract, {
  foreignKey: "bookingId",
  onDelete: "CASCADE",
});

Contract.belongsTo(Booking, {
  foreignKey: "bookingId",
});

// =======================
// REVIEWS
// =======================

User.hasMany(Review, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Review.belongsTo(User, {
  foreignKey: "userId",
});

Boat.hasMany(Review, {
  foreignKey: "boatId",
  onDelete: "CASCADE",
});

Review.belongsTo(Boat, {
  foreignKey: "boatId",
});

Booking.hasOne(Review, {
  foreignKey: "bookingId",
  onDelete: "CASCADE",
});

Review.belongsTo(Booking, {
  foreignKey: "bookingId",
});

// =======================
// DOCUMENTS
// =======================

User.hasMany(Document, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Document.belongsTo(User, {
  foreignKey: "userId",
});

Boat.hasMany(Document, {
  foreignKey: "boatId",
  onDelete: "CASCADE",
});

Document.belongsTo(Boat, {
  foreignKey: "boatId",
});

// =======================
// REFRESH TOKENS
// =======================

User.hasMany(RefreshToken, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

RefreshToken.belongsTo(User, {
  foreignKey: "userId",
});

const Article = require("./Article");

module.exports = {
  sequelize,
  User,
  Boat,
  Availability,
  Booking,
  Payment,
  Review,
  Contract,
  Document,
  RefreshToken,
  Article,
};