const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFound, BadRequest, Unauthorized } = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const validateCaptcha = require("../middlewares/validate-captcha");
const { delKey } = require("../utils/redis");
const sendMail = require("../utils/mail");

/**
 * 用户注册
 * POST /auth/sign_up
 */
router.post("/sign_up", validateCaptcha, async function (req, res) {
  try {
    const body = {
      email: req.body.email,
      username: req.body.username,
      nickname: req.body.nickname,
      password: req.body.password,
      sex: 2,
      role: 0,
    };

    const user = await User.create(body);
    delete user.dataValues.password; // 创建用户后不需要显示密码给前台，所以要删除密码,但这里不是查询，不能用exclude来排除掉数据，要用delete来删除
    // 请求成功，删除验证码，防止重复使用
    await delKey(req.body.captchaKey);
    // 发送邮件
    const html = `
      您好，<span style="color: red">${user.nickname}。</span><br><br>
      恭喜，您已成功注册会员！<br><br>
      请访问<a href="http://www.fingor.cn/">「fingor的博客」</a>，了解更多。<br><br>
      ━━━━━━━━━━━━━━━━<br>
      fingor的博客
    `;
    await sendMail(user.email, "「fingor的博客」的注册成功通知", html);
    // 返回的数据里，要从user对象的dataValues中，delete掉密码字段，这是sequelize里的固定用法。
    success(res, "创建用户成功。", { user }, 201);
  } catch (error) {
    failure(res, error);
  }
});
/**
 * 用户登录
 * POST /auth/sign_in
 */
router.post("/sign_in", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login) {
      throw new BadRequest("邮箱/用户名必须填写。");
    }

    if (!password) {
      throw new BadRequest("密码必须填写。");
    }

    const condition = {
      where: {
        [Op.or]: [{ email: login }, { username: login }],
      },
    };

    // 通过email或username，查询用户是否存在
    const user = await User.findOne(condition);
    if (!user) {
      throw new NotFound("用户不存在，无法登录。");
    }

    // 验证密码
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new Unauthorized("密码错误。");
    }

    // 生成身份验证令牌
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.SECRET,
      { expiresIn: "30d" }
    );
    success(res, "前台登录成功。", { token });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;
