const multer = require('multer');
const MAO = require('multer-aliyun-oss');
const OSS = require('ali-oss');
const { BadRequest } = require('http-errors');

// 阿里云配置信息
const config = {
  region: process.env.ALIYUN_REGION,
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  bucket: process.env.ALIYUN_BUCKET,
};

const client = new OSS(config);

// multer 配置信息
const upload = multer({
  storage: MAO({
    config: config,
    destination: 'uploads', // 自定义上传目录
  }),
  fileFilter: function (req, file, cb) {
    // 只允许上传图片
    const fileType = file.mimetype.split('/')[0];
    const isImage = fileType === 'image';

    if (!isImage) {
      return cb(new BadRequest('只允许上传图片。'));
    }

    cb(null, true);
  },
});

/**
 * 使用 http 请求头中的 content-length 限制文件大小
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const fileSizeLimits = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length']);
  // 限制上传文件的大小为：5MB
  if (contentLength > 5 * 1024 * 1024) {
    return next(new BadRequest('文件大小不能超过5MB'));
  }
  next();
};

/**
 * 单文件上传，指定表单字段名为 file
 * @param req
 * @param res
 * @param next
 */
const singleFileUpload = (req, res, next) => {
  // 检查文件大小是否超出限制
  fileSizeLimits(req, res, (err) => {
    if (err) return next(err);
    upload.single('file')(req, res, next);
  });
};

module.exports = {
  config,
  client,
  singleFileUpload,
};