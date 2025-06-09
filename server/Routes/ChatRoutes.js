const express = require("express");
const router = express.Router();
const chatController = require("../Controllers/ChatController");

router.post("/send", chatController.sendMessage);
router.get("/unread-counts", chatController.getUnreadCountsForUser);


router.get("/", chatController.getMessages);
router.get("/:messageId", chatController.getMessageById);
router.patch("/edit/:messageId", chatController.editMessage);
router.patch("/deleteforme/:messageId", chatController.deleteMessageForMe);
router.delete("/deleteforeveryone/:messageId", chatController.deleteMessageForEveryone);
router.patch("/seen/:messageId", chatController.markAsSeen);


module.exports = router;
