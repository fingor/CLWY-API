const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();
const {
  uploadChunk,
  mergeChunks,
  checkChunks,
} = require("../controllers/uploadController");

const tempDir = path.join(__dirname, "../temp");
const upload = multer({ dest: tempDir });

router.post("/chunk", upload.single("chunk"), uploadChunk);
router.post("/merge", mergeChunks);
router.post("/check", checkChunks);

module.exports = router;
