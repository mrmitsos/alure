const express = require("express");
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { protect, hostOnly } = require("../middleware/authMiddleware");

router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", protect, hostOnly, createProperty);
router.put("/:id", protect, hostOnly, updateProperty);
router.delete("/:id", protect, hostOnly, deleteProperty);

module.exports = router;
