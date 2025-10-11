const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["local", "regional"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }]
});

module.exports = mongoose.model("Competition", competitionSchema);
