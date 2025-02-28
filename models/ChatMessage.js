const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, 
    content: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["food", "refund", "food-reply", "system"], 
      required: true 
    },
    queryId: { type: String, required: true, index: true }, // Indexed for fast lookups
    resolved: { type: Boolean, default: false }, 
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create an index for optimized queries
messageSchema.index({ queryId: 1, receiverId: 1 });

module.exports = mongoose.model("ChatMessage", messageSchema);
