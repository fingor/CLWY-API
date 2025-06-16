const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const { BadRequest, NotFound } = require('http-errors');
const bcrypt = require("bcryptjs");

/**
 * 查询当前登录用户详情
 * GET /users/me
 */
router.get("/me", async function (req, res) {
  try {
    const user = await getUser(req);
    success(res, "查询当前用户信息成功。", { user });
  } catch (error) {
    failure(res, error);
  }
});
/**
 * 更新用户信息
 * PUT /users/info
 */
router.put("/info", async function (req, res) {
  try {
    const body = {
      nickname: req.body.nickname,
      sex: req.body.sex,
      company: req.body.company,
      introduce: req.body.introduce,
      avatar: req.body.avatar,
    };

    const user = await getUser(req);
    await user.update(body);
    success(res, "更新用户信息成功。", { user });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 公共方法：查询当前用户
 */
async function getUser(req, showPassword = false) {
  const id = req.userId;
  let condition = {};
  if (!showPassword) {
    condition = {
      attributes: { exclude: ["password"] },
    };
  }
  const user = await User.findByPk(id, condition);

  if (!user) {
    throw new NotFound(`ID: ${id}的用户未找到。`);
  }

  return user;
}

module.exports = router;
