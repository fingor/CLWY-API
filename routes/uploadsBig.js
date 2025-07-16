const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const multerConfig = require("../config/multerConfig");

// 初始化上传
router.post("/init", uploadController.initUpload);

// 上传分片（使用multer处理文件上传）
router.post(
  "/chunk",
  multerConfig.single("chunk"),
  uploadController.uploadChunk
);

// 完成上传
router.post("/complete", uploadController.completeUpload);

// 取消上传
router.post("/cancel", uploadController.cancelUpload);

module.exports = router;
