const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  seenBy: {type:String,
  enum:["Seen","Unseen"],
  default:"Unseen"},
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  edited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);
module.exports = ChatMessage;
