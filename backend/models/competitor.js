const mongoose = require("mongoose");

const competitorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }]
});

module.exports = mongoose.model("Competitor", competitorSchema);