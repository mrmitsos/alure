const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const {
  uploadImage,
  uploadMultiple,
} = require("../controllers/uploadController");
const { protect, hostOnly } = require("../middleware/authMiddleware");

router.post("/", protect, hostOnly, upload.single("image"), uploadImage);
router.post(
  "/multiple",
  protect,
  hostOnly,
  upload.array("images", 10),
  uploadMultiple,
);

module.exports = router;
