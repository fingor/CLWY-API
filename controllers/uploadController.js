const path = require("path");
const fs = require("fs");
const { File } = require("../models");

const UPLOAD_DIR = path.resolve(__dirname, "..", "uploads");

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

exports.uploadChunk = async (req, res) => {
  try {
    const { hash, filename, chunkIndex } = req.body;
    const chunk = req.file;

    // 创建文件hash目录
    const chunkDir = path.resolve(UPLOAD_DIR, hash);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }

    // 移动切片到对应目录
    const chunkPath = path.resolve(chunkDir, `${chunkIndex}`);
    fs.renameSync(chunk.path, chunkPath);

    res.json({
      code: 0,
      message: "切片上传成功",
    });
  } catch (error) {
    res.status(500).json({
      code: 1,
      message: "切片上传失败",
    });
  }
};

exports.mergeChunks = async (req, res) => {
  try {
    const { filename, hash } = req.body;
    const chunkDir = path.resolve(UPLOAD_DIR, hash);
    const filePath = path.resolve(UPLOAD_DIR, filename);

    // 读取所有切片
    const chunks = fs.readdirSync(chunkDir);
    chunks.sort((a, b) => a - b); // 按照切片索引排序

    await Promise.all(
      chunks.map((chunk, index) => {
        return new Promise((resolve) => {
          const chunkPath = path.resolve(chunkDir, chunk);
          const ws = fs.createWriteStream(filePath, {
            start: index * 5 * 1024 * 1024,
            flags: index === 0 ? "w" : "a",
          });
          const rs = fs.createReadStream(chunkPath);
          rs.pipe(ws);
          rs.on("end", resolve);
        });
      })
    );

    // 删除切片目录
    fs.rmSync(chunkDir, { recursive: true });

    // 更新数据库记录
    const fileSize = fs.statSync(filePath).size;
    await File.create({
      filename,
      hash,
      fileSize,
      filePath,
      status: "completed",
    });

    res.json({
      code: 0,
      message: "文件合并成功",
    });
  } catch (error) {
    res.status(500).json({
      code: 1,
      message: "文件合并失败",
    });
  }
};

exports.checkChunks = async (req, res) => {
  const { filename, hash } = req.body;
  const chunksDir = path.resolve(__dirname, `../uploads/${hash}`);

  try {
    let uploaded = [];
    if (fs.existsSync(chunksDir)) {
      const files = await fs.readdir(chunksDir);
      uploaded = files.map((file) => parseInt(file.split("-")[1]));
    }
    res.json({ uploaded });
  } catch (error) {
    res.status(500).json({ error: "检查切片失败" });
  }
};
