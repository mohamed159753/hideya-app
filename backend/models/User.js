const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ["admin", "jury"], required: true },
  canBePresident: { type: Boolean },      // optional
  expertiseLevel: { type: Number }         // optional
});

module.exports = mongoose.model("User", userSchema);