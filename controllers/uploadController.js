const { Upload, UploadChunk } = require("../models");
const {
  mergeFileChunks,
  calculateFileHash,
  cleanUploadTempFiles,
} = require("../utils/fileUtils");
const { Op } = require("sequelize");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs"); // 标准fs
const fsp = require("fs").promises; // promises版本

// 初始化上传 (创建上传记录)
exports.initUpload = async (req, res) => {
  try {
    const { fileName, fileSize, fileHash } = req.body;
    if (!fileName || !fileSize || !fileHash) {
      throw new Error("无效的初始化参数");
    }
    // 检查文件是否已存在 (秒传)
    const existingFile = await Upload.findOne({
      where: { fileHash, status: "completed" },
    });

    if (existingFile) {
      return res.json({
        success: true,
        exists: true,
        url: `/uploads/completed/${encodeURIComponent(fileName)}`,
      });
    }

    // 检查是否有未完成的上传记录
    let upload = await Upload.findOne({
      where: { fileHash, status: { [Op.ne]: "completed" } },
    });

    if (!upload) {
      // 创建新上传记录
      const totalChunks = Math.ceil(fileSize / (2 * 1024 * 1024));

      upload = await Upload.create({
        fileName,
        fileSize,
        fileHash,
        totalChunks,
        uploadedChunks: 0,
        status: "uploading",
      });
    }

    // 获取已上传的分片索引
    const uploadedChunks = await UploadChunk.findAll({
      where: { uploadId: upload.id },
      attributes: ["chunkIndex"],
      raw: true,
    });

    res.json({
      success: true,
      uploadId: upload.id,
      uploadedChunks: uploadedChunks.map((c) => c.chunkIndex),
    });
  } catch (error) {
    console.error("初始化上传失败:", error);
    res.status(500).json({
      success: false,
      error: `初始化失败: ${error.message}`,
    });
  }
};

// 上传分片
exports.uploadChunk = async (req, res) => {
  try {
    const { chunkIndex, originalname, uploadId = originalname } = req.body;
    const file = req.file;

    // 验证必要参数
    if (!file || !chunkIndex || !originalname) {
      return res.status(400).json({
        success: false,
        error: "缺少必要参数：分片文件、分片索引或文件名",
      });
    }

    // 创建文件的专属目录
    const fileDir = path.join(__dirname, "../uploads/temp", uploadId);
    if (!fs.existsSync(fileDir)) {
      await fsp.mkdir(fileDir, { recursive: true });
    }
    // 保存分片到文件系统
    const chunkPath = path.join(fileDir, `${chunkIndex}`);
    fs.writeFileSync(chunkPath, file.buffer);

    // 成功响应
    res.json({
      success: true,
      message: `分片 ${chunkIndex} 上传成功`,
      chunkIndex,
    });
  } catch (error) {
    console.error("分片上传失败:", error);
    res.status(500).json({
      success: false,
      error: `分片上传失败: ${error.message}`,
    });
  }
};

// 完成上传
exports.completeUpload = async (req, res) => {
  try {
    const { uploadId, fileHash, fileName } = req.body;

    // 参数验证
    if (!uploadId || !fileHash || !fileName) {
      return res.status(400).json({
        success: false,
        error: "缺少必要参数: uploadId, fileHash 或 fileName",
      });
    }

    // 合并分片（不再传入 totalChunks）
    const filePath = await mergeFileChunks(fileName, uploadId);
    // 验证文件完整性
    // const finalHash = await calculateFileHash(filePath);
    // if (finalHash !== fileHash) {
    //   fs.unlinkSync(filePath);
    //   return res.status(400).json({
    //     success: false,
    //     error: "文件哈希不匹配",
    //   });
    // }

    res.json({
      success: true,
      url: `/uploads/completed/${encodeURIComponent(fileName)}`,
      filePath,
      message: `文件 ${fileName} 合并完成`,
    });
  } catch (error) {
    console.error("文件合并失败:", error);
    res.status(500).json({
      success: false,
      error: `文件合并失败: ${error.message}`,
    });
  }
};
// 取消上传
exports.cancelUpload = async (req, res) => {
  try {
    const { uploadId } = req.body;

    if (!uploadId) {
      return res.status(400).json({
        success: false,
        error: "缺少必要参数",
      });
    }

    // 更新状态为取消
    await Upload.update({ status: "canceled" }, { where: { id: uploadId } });

    // 清理临时文件
    await cleanUploadTempFiles(uploadId);

    // 删除分片记录
    await UploadChunk.destroy({ where: { uploadId } });

    res.json({
      success: true,
      message: `上传 ${uploadId} 已取消`,
    });
  } catch (error) {
    console.error("取消上传失败:", error);
    res.status(500).json({
      success: false,
      error: `取消上传失败: ${error.message}`,
    });
  }
};
