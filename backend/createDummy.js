// createDummy.js
require('dotenv').config();            // load env variables
const mongoose = require("./config/db");  // db.js is now in config/

// models
const User = require("./models/user");
const Category = require("./models/Category");
const Competition = require("./models/Competition");
const Competitor = require("./models/Competitor");
const JuryAssignment = require("./models/JuryAssignment");
const Score = require("./models/Score");

async function createDummyDocuments() {
  try {
    // Users
    const user = await User.create({ firstName: "John", lastName: "Doe", role: "admin" });

    // Category
    const category = await Category.create({ name: "Quran Recitation" });

    // Competition
    const competition = await Competition.create({
      title: "Local Competition",
      type: "local",
      startDate: new Date(),
      endDate: new Date(),
      categoryIds: [category._id]
    });

    // Competitor
    const competitor = await Competitor.create({
      firstName: "Ali",
      lastName: "Khan",
      age: 12,
      competitionId: competition._id,
      categoryIds: [category._id]
    });

    // JuryAssignment
    await JuryAssignment.create({
      competitionId: competition._id,
      categoryId: category._id,
      juryMembers: [{ userId: user._id, role: "president" }]
    });

    // Score
    await Score.create({
      competitorId: competitor._id,
      categoryId: category._id,
      juryMemberId: user._id,
      hifdhScore: 90,
      tajweedScore: 85,
      performanceScore: 88,
      errors: 2,
      totalScore: 263
    });

    console.log("All dummy documents created!");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();  // close connection when done
  }
}

createDummyDocuments();
