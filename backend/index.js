const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const Participation = require("./models/Participation");

const competitionRoutes = require('./routes/competitions');
const categoryRoutes = require('./routes/categories');
const competitorRoutes = require("./routes/competitors");
const participationRoutes = require('./routes/participations'); // your router file
const branchRoutes = require("./routes/branchRoutes");
const groupAgeRoutes = require("./routes/ageGroupRoutes");
const competitionCategoryRoutes = require("./routes/competitionCategories");
const adminResultRoutes = require('./routes/adminResultRoutes');

const dashboardRoutes = require('./routes/dashboard');



const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth" , authRoutes)
app.use('/api/competitions', competitionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/competitors', competitorRoutes);
app.use("/api/participations", participationRoutes);
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);
const juryRoutes = require('./routes/juryAssignments');
app.use('/api/jury-assignments', juryRoutes);
const marksRoutes = require('./routes/marks');
app.use('/api/marks', marksRoutes);
const resultsRoutes = require('./routes/results');
app.use('/api/results', resultsRoutes);
const juryResultsRoutes = require('./routes/juryResults');
app.use('/api/jury-results', juryResultsRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/age-groups", groupAgeRoutes);
app.use("/api/competition-categories", competitionCategoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/results', adminResultRoutes);





require("./config/db");

app.get("/", (req, res) => {
  res.send("API Quran Competition is running ");
});

app.get("/test-db", (req, res) => {
    res.send("MongoDB Atlas is working ");
});



const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
