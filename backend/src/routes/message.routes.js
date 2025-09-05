const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const messageModel = require("../models/message.model");

const router = express.Router();

// GET /api/message/:chatId -> list messages for a chat
router.get("/:chatId", authMiddleware.authUser, async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });
    res.status(200).json({
      message: "Messages fetched successfully",
      messages: messages.map((m) => ({
        id: m._id,
        chat: m.chat,
        content: m.content,
        role: m.role,
        createdAt: m.createdAt,
      })),
    });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: e.message });
  }
});

module.exports = router;
