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
const Article = require("./Article");
const Conversation = require("./Conversation");
const Message = require("./Message");
const Favorite = require("./Favorite");

// User <-> Boat
User.hasMany(Boat, { foreignKey: "userId", onDelete: "CASCADE" });
Boat.belongsTo(User, { foreignKey: "userId" });

// Boat <-> Availability
Boat.hasMany(Availability, { as: "availabilities", foreignKey: "boatId", onDelete: "CASCADE" });
Availability.belongsTo(Boat, { foreignKey: "boatId" });

// User <-> Booking
User.hasMany(Booking, { foreignKey: "userId", onDelete: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "userId" });

// Boat <-> Booking
Boat.hasMany(Booking, { foreignKey: "boatId", onDelete: "CASCADE" });
Booking.belongsTo(Boat, { foreignKey: "boatId" });

// Booking <-> Payment
Booking.hasOne(Payment, { foreignKey: "bookingId", onDelete: "CASCADE" });
Payment.belongsTo(Booking, { foreignKey: "bookingId", include: [{ model: Boat }, { model: User }] });

// Booking <-> Contract
Booking.hasOne(Contract, { foreignKey: "bookingId", onDelete: "CASCADE" });
Contract.belongsTo(Booking, { foreignKey: "bookingId" });

// User <-> Review
User.hasMany(Review, { foreignKey: "userId", onDelete: "CASCADE" });
Review.belongsTo(User, { foreignKey: "userId" });

// Boat <-> Review
Boat.hasMany(Review, { foreignKey: "boatId", onDelete: "CASCADE" });
Review.belongsTo(Boat, { foreignKey: "boatId" });

// Booking <-> Review
Booking.hasOne(Review, { foreignKey: "bookingId", onDelete: "CASCADE" });
Review.belongsTo(Booking, { foreignKey: "bookingId" });

// User <-> Document
User.hasMany(Document, { foreignKey: "userId", onDelete: "CASCADE" });
Document.belongsTo(User, { foreignKey: "userId" });

// User <-> RefreshToken
User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

// Conversation / Message
Conversation.belongsTo(User, { as: "participant1", foreignKey: "participant1Id" });
Conversation.belongsTo(User, { as: "participant2", foreignKey: "participant2Id" });
User.hasMany(Conversation, { foreignKey: "participant1Id" });
User.hasMany(Conversation, { foreignKey: "participant2Id" });
Conversation.hasMany(Message, { as: "messages", foreignKey: "conversationId", onDelete: "CASCADE" });
Message.belongsTo(Conversation, { foreignKey: "conversationId" });
Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
User.hasMany(Message, { as: "sentMessages", foreignKey: "senderId" });
Conversation.belongsTo(Booking, { foreignKey: "bookingId" });

// Favorites
Favorite.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Favorite, { foreignKey: "userId" });
Favorite.belongsTo(Boat, { foreignKey: "boatId" });
Boat.hasMany(Favorite, { foreignKey: "boatId" });

module.exports = {
  sequelize,
  User, Boat, Availability, Booking, Payment, Review,
  Contract, Document, RefreshToken, Article,
  Conversation, Message, Favorite,
};