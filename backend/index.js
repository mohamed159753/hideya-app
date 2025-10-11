const express = require("express");
const cors = require("cors");
const User = require("./models/user");

const app = express();
app.use(cors());
app.use(express.json());

require("./config/db");

app.get("/", (req, res) => {
  res.send("API Quran Competition is running ");
});

app.get("/test-db", (req, res) => {
    res.send("MongoDB Atlas is working ");
});

async function createUser() {
  const user = new User({
    firstName: "Ahmed",
    lastName: "Ali",
    role: "jury",
    canBePresident: true,
    expertiseLevel: 5
  });

  await user.save();  // This actually creates the document and collection
  console.log("User created!");
  mongoose.connection.close();
}

createUser();

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
