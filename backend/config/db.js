const mongoose = require("mongoose");

const DB_URI = "mongodb+srv://mohamedmensi24_db_user:Mohamed240603!@cluster0.aavzur2.mongodb.net/";

mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Atlas connected ✅"))
.catch(err => console.error("MongoDB connection error:", err));