const AgeGroup = require("../models/AgeGroup");

// Create Age Group
exports.createGroupAge = async (req, res) => {
  try {
    const { name, from, to } = req.body;

    console.log(name, from, to);

    if (from > to) {
      return res.status(400).json({ error: "from age cannot be greater than to age" });
    }

    const newAgeGroup = new AgeGroup({ name, from, to });
    await newAgeGroup.save();

    res.status(201).json(newAgeGroup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all Age Groups
exports.getGroupAge = async (req, res) => {
  try {
    const groups = await AgeGroup.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Age Group
exports.deleteGroupAge = async (req, res) => {
  try {
    await AgeGroup.findByIdAndDelete(req.params.id);
    res.json({ message: "Age group deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
