const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fsExtra = require("fs-extra");

// 确保目录存在
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

// 清理上传临时文件
const cleanUploadTempFiles = async (uploadId) => {
  const tempDir = path.join(__dirname, "../uploads/temp", uploadId);
  if (fs.existsSync(tempDir)) {
    await fsExtra.remove(tempDir);
  }
};

// 合并文件分片
const mergeFileChunks = async (fileName, uploadId) => {
  // 确保参数为字符串
  fileName = String(fileName);
  uploadId = String(uploadId);
  const tempDir = path.join(__dirname, "../uploads/temp", uploadId);
  const completedDir = ensureDir(path.join(__dirname, "../uploads/completed"));
  const outputPath = path.join(completedDir, fileName);

  // 确保输出目录存在
  ensureDir(path.dirname(outputPath));

  const writeStream = fs.createWriteStream(outputPath);

  // 获取所有分片文件
  const chunks = fs
    .readdirSync(tempDir)
    // .filter((file) => file.endsWith(".part"))
    .filter((file) => /^\d+$/.test(file)) // 只保留纯数字文件名
    .sort((a, b) => parseInt(a) - parseInt(b)) // 按数字顺序排序
    .map(String); // 将数字转换为字符串

  if (chunks.length === 0) {
    throw new Error(`没有找到任何分片文件`);
  }

  // 合并分片
  for (const chunk of chunks) {
    const chunkPath = path.join(tempDir, String(chunk));
    const readStream = fs.createReadStream(chunkPath);

    await new Promise((resolve, reject) => {
      readStream.pipe(writeStream, { end: false });
      readStream.on("end", resolve);
      readStream.on("error", reject);
    });
  }

  writeStream.end();
  await new Promise((resolve) => writeStream.on("finish", resolve));

  // 清理临时文件
  await cleanUploadTempFiles(uploadId);

  return outputPath;
};

// 计算文件哈希 (SHA-256)
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
};

module.exports = {
  ensureDir,
  cleanUploadTempFiles,
  mergeFileChunks,
  calculateFileHash,
};
