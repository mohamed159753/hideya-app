const mongoose = require("mongoose");

const juryAssignmentSchema = new mongoose.Schema({
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  // new field to distinguish subcategories
  subCategory: { type: String, required: true }, // e.g., 'male', 'female', 'children_7_10'
  classRoom: { type: String },
  juryMembers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["member", "president"], required: true }
    }
  ]
});

// Ensure classRoom is unique per competition+subcategory
juryAssignmentSchema.index(
  { competitionId: 1, subCategory: 1, classRoom: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("JuryAssignment", juryAssignmentSchema);