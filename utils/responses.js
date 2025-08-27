const createError = require("http-errors");
const multer = require("multer");

/**
 * 请求成功
 * @param res
 * @param message
 * @param data
 * @param code
 */
function success(res, message, data = {}, code = 200) {
  res.status(code).json({
    status: true,
    message,
    data,
  });
}

/**
 * 请求失败
 * @param res
 * @param error
 */
function failure(res, error) {
  // 默认响应为 500，服务器错误
  let statusCode = 500;
  let errors = "服务器错误";
  let errorType = "SERVER_ERROR"; // 声明 errorType 变量

  if (error.name === "SequelizeValidationError") {
    // Sequelize 验证错误
    statusCode = 400;
    errors = error.errors.map((e) => e.message);
  } else if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
  ) {
    // Token 验证错误
    statusCode = 401;
    errors = "您提交的token错误或已过期。";
    errorType = "TOKEN_EXPIRED";
  } else if (error instanceof createError.HttpError) {
    // http-errors 库创建的错误
    statusCode = error.status;
    errors = error.message;
  } else if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      errors = "文件大小超出限制。";
    } else {
      statusCode = 400;
      errors = error.message;
    }
  }

  res.status(statusCode).json({
    status: false,
    message: `请求失败: ${error.name}`,
    errors: Array.isArray(errors) ? errors : [errors],
    errorType: errorType,
  });
}

module.exports = {
  success,
  failure,
};
