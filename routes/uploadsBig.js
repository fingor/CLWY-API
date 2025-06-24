const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  uploadChunk,
  mergeChunks,
  checkChunks,
} = require("../controllers/uploadController");

const upload = multer({ dest: "temp" });

router.post("/chunk", upload.single("chunk"), uploadChunk);
router.post("/merge", mergeChunks);
router.post("/check", checkChunks);

module.exports = router;
