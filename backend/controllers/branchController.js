const Branch = require("../models/Branch");

exports.createBranch = async (req, res) => {
  try {
    const branch = await Branch.create({ name: req.body.name });
    res.status(201).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBranches = async (req, res) => {
  const branches = await Branch.find();
  res.json(branches);
};

exports.deleteBranch = async (req, res) => {
  await Branch.findByIdAndDelete(req.params.id);
  res.json({ message: "Branch deleted" });
};
