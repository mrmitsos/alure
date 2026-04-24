// @route POST /api/upload
// @access Host/Admin only
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ url: req.file.path });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// @route POST /api/upload/multiple
// @access Host/Admin only
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const urls = req.files.map((file) => file.path);
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

module.exports = { uploadImage, uploadMultiple };
