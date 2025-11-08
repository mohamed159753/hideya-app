const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["local", "regional"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  genderGroups: [
    {
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
      gender: { type: String, enum: ["male", "female", "children"], required: true },
      ageGroupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "AgeGroup" }] // optional
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Competition", competitionSchema);