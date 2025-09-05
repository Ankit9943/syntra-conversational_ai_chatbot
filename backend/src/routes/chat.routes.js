const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const chatController = require("../controllers/chat.controller");

const router = express.Router();

router.post("/", authMiddleware.authUser, chatController.createChat);

/* to get all the chats */
router.get("/", authMiddleware.authUser, chatController.getChats);
module.exports = router;
