const express = require("express");
const router = express.Router();
const Participation = require("../models/Participation");

// GET all participations
router.get("/", async (req, res, next) => {
  try {
    const participations = await Participation.find()
      .populate("competitorId", "firstName lastName")
      .populate({
        path: "competitionCategoryId",
        populate: [
          { path: "categoryId", select: "name" },
          { path: "ageGroupId", select: "name from to" }
        ]
      })
      .populate("competitionId", "title type");

    res.json(participations);
  } catch (err) {
    next(err);
  }
});

// GET participations for one competition
router.get("/competition/:competitionId", async (req, res, next) => {
  try {
    const participations = await Participation.find({
      competitionId: req.params.competitionId,
    })
      .populate("competitorId", "firstName lastName branch")
      .populate({
        path: "competitionCategoryId",
        populate: [
          { path: "categoryId", select: "name" },
          { path: "ageGroupId", select: "name from to" }
        ]
      });

    res.json(participations);
  } catch (err) {
    next(err);
  }
});

// POST create new participation
router.post("/", async (req, res, next) => {
  try {
    const { competitorId, competitionId, competitionCategoryId } = req.body;

    const participation = new Participation({
      competitorId,
      competitionId,
      competitionCategoryId
    });

    await participation.save();
    await participation.populate([
      { path: "competitorId", select: "firstName lastName" },
      { path: "competitionId", select: "title" },
      {
        path: "competitionCategoryId",
        populate: [
          { path: "categoryId", select: "name" },
          { path: "ageGroupId", select: "name from to" }
        ]
      }
    ]);

    res.status(201).json(participation);
  } catch (err) {
    next(err);
  }
});

// PUT update participation
router.put("/:id", async (req, res, next) => {
  try {
    const updated = await Participation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("competitorId", "firstName lastName")
      .populate("competitionId", "title")
      .populate({
        path: "competitionCategoryId",
        populate: [
          { path: "categoryId", select: "name" },
          { path: "ageGroupId", select: "name from to" }
        ]
      });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE participation
router.delete("/:id", async (req, res, next) => {
  try {
    await Participation.findByIdAndDelete(req.params.id);
    res.json({ message: "Participation deleted" });
  } catch (err) {
    next(err);
  }
});

// ✅ Register Multiple Participants
router.post("/register-multiple", async (req, res) => {
  const { competitionId, competitionCategoryId, competitorIds } = req.body;

  if (!competitionId || !competitionCategoryId || !competitorIds?.length) {
    return res
      .status(400)
      .json({ message: "Competition, competitionCategoryId and competitors are required" });
  }

  try {
    const participations = competitorIds.map(id => ({
      competitionId,
      competitionCategoryId,
      competitorId: id
    }));

    const result = await Participation.insertMany(participations);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
