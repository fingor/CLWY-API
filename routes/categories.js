const express = require("express");
const router = express.Router();
// 引入分类模型
const { Category } = require("../models");
const { success, failure } = require("../utils/responses");

/**
 * 获取所有分类
 */
router.get("/", async function (req, res, next) {
  try {
    const categories = await Category.findAll();
    success(res, "获取分类成功。", categories);
  } catch (error) {
    failure(res, error);
  }
});
// 导出
module.exports = router;
