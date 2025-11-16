const express = require("express");
const cors = require("cors");

// Models (optional)
const User = require("./models/User");
const Participation = require("./models/Participation");

// Routes
const authRoutes = require("./routes/authRoutes");
const competitionRoutes = require("./routes/competitions");
const categoryRoutes = require("./routes/categories");
const competitorRoutes = require("./routes/competitors");
const participationRoutes = require("./routes/participations");
const branchRoutes = require("./routes/branchRoutes");
const groupAgeRoutes = require("./routes/ageGroupRoutes");
const competitionCategoryRoutes = require("./routes/competitionCategories");
const adminResultRoutes = require("./routes/adminResultRoutes");
const dashboardRoutes = require("./routes/dashboard");
const usersRoutes = require("./routes/users");
const juryRoutes = require("./routes/juryAssignments");
const marksRoutes = require("./routes/marks");
const resultsRoutes = require("./routes/results");
const juryResultsRoutes = require("./routes/juryResults");

const app = express();

// ✅ CORS configuration for Vercel frontend
app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
}));

app.use(express.json());

// Database connection
require("./config/db");

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/competitors", competitorRoutes);
app.use("/api/participations", participationRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/jury-assignments", juryRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/jury-results", juryResultsRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/age-groups", groupAgeRoutes);
app.use("/api/competition-categories", competitionCategoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin/results", adminResultRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API Quran Competition is running");
});

// Simple DB test
app.get("/test-db", (req, res) => {
  res.send("MongoDB Atlas is working");
});

// ❌ Do NOT use app.listen() in Vercel serverless
module.exports = app;
