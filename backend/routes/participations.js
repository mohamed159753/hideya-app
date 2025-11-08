// routes/participation.js (or similar)
const express = require("express");
const router = express.Router();
const Participation = require("../models/Participation");

// Register multiple competitors
router.post("/register-multiple", async (req, res) => {
  try {
    const { competitionId, categoryId, subCategory, competitorIds } = req.body;

    if (
      !competitionId ||
      !categoryId ||
      !subCategory ||
      !competitorIds ||
      !Array.isArray(competitorIds)
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: competitionId, categoryId, subCategory, competitorIds",
      });
    }

    const participations = [];
    const errors = [];

    for (const competitorId of competitorIds) {
      try {
        // Check if participation already exists
        const existing = await Participation.findOne({
          competitorId,
          competitionId,
          subCategory,
        });

        if (existing) {
          errors.push({
            competitorId,
            error: "Competitor already registered for this subcategory",
          });
          continue;
        }

        const participation = new Participation({
          competitorId,
          competitionId,
          categoryId,
          subCategory,
        });

        await participation.save();
        participations.push(participation);
      } catch (err) {
        errors.push({ competitorId, error: err.message });
      }
    }

    res.status(201).json({
      message: `Registered ${participations.length} participants`,
      participations,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error registering participants:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all participations (with population)
router.get("/", async (req, res) => {
  try {
    const participations = await Participation.find()
      .populate("competitorId")
      .populate("competitionId")
      .populate("categoryId")
      .sort({ createdAt: -1 });

    res.json(participations);
  } catch (error) {
    console.error("Error fetching participations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete participation
router.delete("/:id", async (req, res) => {
  try {
    const participation = await Participation.findByIdAndDelete(req.params.id);

    if (!participation) {
      return res.status(404).json({ message: "Participation not found" });
    }

    res.json({ message: "Participation deleted successfully" });
  } catch (error) {
    console.error("Error deleting participation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// get participation by competitonId
router.get("/competition/:competitionId", async (req, res) => {
  try {
    const participations = await Participation.find({
      competitionId: req.params.competitionId,
    })
      .populate("competitorId")
      .populate("competitionId")
      .populate("categoryId")
      .sort({ createdAt: -1 });

    res.json(participations);
  } catch (error) {
    console.error("Error fetching participations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// get participants by competition/category/subCategory
router.get("/by-category", async (req, res) => {
  try {
    const { competitionId, categoryId, subCategory } = req.query;
    if (!competitionId || !categoryId || !subCategory) {
      return res
        .status(400)
        .json({
          message: "competitionId, categoryId and subCategory are required",
        });
    }
    const participations = await Participation.find({
      competitionId,
      categoryId,
      subCategory,
    })
      .populate("competitorId")
      .populate("competitionId")
      .populate("categoryId")
      .sort({ createdAt: -1 });
    res.json(participations);
  } catch (error) {
    console.error("Error fetching participations by category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
