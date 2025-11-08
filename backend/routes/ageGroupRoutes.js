const express = require("express");
const router = express.Router();
const ageGroupController = require("../controllers/groupAgeController");

router.post("/", ageGroupController.createGroupAge);
router.get("/", ageGroupController.getGroupAge);
router.delete("/:id", ageGroupController.deleteGroupAge);

module.exports = router;
