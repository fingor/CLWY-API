const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadId = req.body.uploadId || "temp";
    const tempDir = path.join(__dirname, "../uploads/temp", uploadId);
    require("fs-extra").ensureDirSync(tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const chunkIndex = req.body.chunkIndex || "0";
    cb(null, `${chunkIndex}.part`);
  },
});

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 2 * 1024 * 1024, // 限制单个分片大小为2MB
//   },
// });
const upload = multer({ storage: multer.memoryStorage() });


module.exports = upload;
