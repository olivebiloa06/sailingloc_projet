const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.use(verifyToken);

router.get("/", messageController.getMyConversations);
router.get("/unread", messageController.getUnreadCount);
router.post("/", messageController.getOrCreateConversation);
router.get("/:id/messages", messageController.getMessages);
router.post("/:id/messages", messageController.sendMessage);

module.exports = router;
