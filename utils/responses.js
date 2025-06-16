const createError = require("http-errors");

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
    errors = "您提交的 token 错误或已过期。";
  } else if (error instanceof createError.HttpError) {
    // http-errors 库创建的错误
    statusCode = error.status;
    errors = error.message;
  }

  res.status(statusCode).json({
    status: false,
    message: `请求失败: ${error.name}`,
    errors: Array.isArray(errors) ? errors : [errors],
  });
}
// function failure(res, error) {
//   console.log('error',error);

//   if (error.name === "SequelizeValidationError") {
//     const errors = error.errors.map((e) => e.message);
//     return res.status(400).json({
//       status: false,
//       message: "请求参数错误",
//       errors,
//     });
//   }

//   if (error.name === "NotFound") {
//     return res.status(404).json({
//       status: false,
//       message: "资源不存在",
//       errors: [error.message],
//     });
//   }
//   if (error.name === "BadRequest") {
//     return res.status(400).json({
//       status: false,
//       message: "请求参数错误",
//       errors: [error.message],
//     });
//   }

//   if (error.name === "Unauthorized") {
//     return res.status(401).json({
//       status: false,
//       message: "认证失败",
//       errors: [error.message],
//     });
//   }
//   if (error.name === "JsonWebTokenError") {
//     return res.status(401).json({
//       status: false,
//       message: "认证失败",
//       errors: ["您提交的 token 错误。"],
//     });
//   }

//   if (error.name === "TokenExpiredError") {
//     return res.status(401).json({
//       status: false,
//       message: "认证失败",
//       errors: ["您的 token 已过期。"],
//     });
//   }

//   res.status(500).json({
//     status: false,
//     message: "服务器错误",
//     errors: [error.message],
//   });
// }

module.exports = {
  success,
  failure,
};
