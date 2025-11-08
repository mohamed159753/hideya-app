// routes/competitionCategories.js
const router = require("express").Router();
const CompetitionCategory = require("../models/CompetitionCategory");

router.post("/", async (req, res) => {
  try {
    const { competitionId, categoryId, ageGroupId, gender } = req.body;

    if (!competitionId || !categoryId)
      return res.status(400).json({ error: "competitionId and categoryId are required" });

    const created = await CompetitionCategory.create({
      competitionId,
      categoryId,
      ageGroupId,
      gender,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating competition category" });
  }
});

module.exports = router;
