const express = require("express");
const router = express.Router();
const { Like, Course, User } = require("../models");
const { success, failure } = require("../utils/responses");
const { Op } = require("sequelize");
const { NotFound } = require('http-errors');

router.post("/", async (req, res) => {
  const userId = req.userId;
  const { courseId } = req.body;
  console.log("courseIdcourseIdcourseId", courseId);

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new NotFound("课程不存在");
    }
    const like = await Like.findOne({
      where: {
        userId,
        courseId,
      },
    });
    if (!like) {
      await Like.create({
        userId,
        courseId,
      });
      await course.increment("likesCount"); //对数据库中的数据进行自增
      success(res, "点赞成功");
    } else {
      await like.destroy();
      await course.decrement("likesCount"); //对数据库中的数据进行自减
      success(res, "取消点赞成功");
    }
  } catch (err) {
    failure(res, err.message);
  }
});
router.get("/", async function (req, res) {
  try {
    // 通过课程查询点赞的用户(写死课程1测试一下)
    // const courses = await Course.findByPk(1, {
    //   include: {
    //     model: User,
    //     as: "likeUsers",
    //   },
    // });
    // success(res, "查询当前课程点赞的客户成功。", {
    //   courses,
    // });
    // 通过用户查询点赞的课程
    // const user = await User.findByPk(req.userId, {
    //   include: {
    //     model: Course,
    //     as: "likeCourses",
    //   },
    // });
    // success(res, "查询当前用户点赞的课程成功。", {
    //   user,
    // });
    // 查询数据很多时需要用分页，但是多对多关系中的include没法用limit这些参数，接口会报错，所以用下面的方式
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    // 查询当前用户
    const user = await User.findByPk(req.userId);

    // 查询当前用户点赞过的课程
    // getLikeCourses是sequelize自动生成的函数，即get+多对多定义的as别名，查询当前用户点赞过的课程
    const courses = await user.getLikeCourses({
      joinTableAttributes: [],//中间表Likes不展示
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    });

    // 查询当前用户点赞过的课程总数
    // countLikeCourses是sequelize自动生成的函数，即count+多对多定义的as别名，查询当前用户点赞过的课程总数
    const count = await user.countLikeCourses();
    success(res, "查询用户点赞的课程成功。", {
      courses,
      pagination: {
        total: count,
        currentPage,
        pageSize,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});
module.exports = router;
