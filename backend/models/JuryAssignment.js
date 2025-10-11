const mongoose = require("mongoose");

const juryAssignmentSchema = new mongoose.Schema({
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  juryMembers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["member", "president"], required: true }
    }
  ]
});

module.exports = mongoose.model("JuryAssignment", juryAssignmentSchema);
