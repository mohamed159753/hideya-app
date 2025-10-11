const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

require("./config/db");

app.get("/", (req, res) => {
  res.send("API Quran Competition is running ✅");
});

app.get("/test-db", (req, res) => {
    res.send("MongoDB Atlas is working ✅");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
