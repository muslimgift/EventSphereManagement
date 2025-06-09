const ChatMessage = require("../Models/ChatBox");

const ChatController = {
// Send new message
sendMessage : async (req, res) => {
  try {
    const { sender, receiver, group, content, type } = req.body;

    const message = await ChatMessage.create({
      sender,
      receiver,
      group,
      content,
      type,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},
// Fetch messages between two users or for a group
getMessages: async (req, res) => {
  try {
    const { userId, receiverId, groupId } = req.query;

    let query = {
      deletedFor: { $ne: userId }, // exclude messages deleted by this user
    };

    if (groupId) {
      query.group = groupId;
    } else {
      query.$or = [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ];
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},
// Get single message by its ID
getMessageById: async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId).lean();
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},
// Edit message
editMessage : async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, newContent } = req.body;

    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (String(message.sender) !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    message.content = newContent;
    message.edited = true;
    await message.save();

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},

// Delete for self
deleteMessageForMe : async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.json({ success: true, message: "Message deleted for you" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},

// Delete for everyone (only sender can do this)
deleteMessageForEveryone: async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ status: false, message: "Message not found" });
    }
    await ChatMessage.findByIdAndDelete(messageId);

    return res.status(200).json({ status: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Failed to delete message for everyone", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
},

// Mark message as seen
markAsSeen : async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.seenBy !=="Seen") {
      message.seenBy ="Seen";
      await message.save();
    }

    res.json({ success: true, message: "Marked as seen" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},
getUnreadCountsForUser : async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    // Find all unread messages sent to the current user
    const unreadMessages = await ChatMessage.find({
      receiver: userId,
      seenBy: { $ne: "Seen" },
    });

    // Count messages grouped by sender
    const counts = {};

    unreadMessages.forEach((msg) => {
      const senderId = msg.sender.toString();
      counts[senderId] = (counts[senderId] || 0) + 1;
    });

    return res.json({ counts });
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
}
module.exports = ChatController;