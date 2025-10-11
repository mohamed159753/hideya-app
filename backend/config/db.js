const mongoose = require("mongoose");

require("dotenv").config();

const DB_URI = process.env.MONGO_URI;


mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Atlas connected "))
.catch(err => console.error("MongoDB connection error:", err));