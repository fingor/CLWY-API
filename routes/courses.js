const express = require("express");
const router = express.Router();
const { Course, Category, Chapter, User } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFound, BadRequest } = require("http-errors");

/**
 * 查询课程列表
 * GET /courses
 */
router.get("/", async function (req, res) {
  try {
    const { categoryId } = req.query;
    const currentPage = Math.abs(Number(req.query.currentPage)) || 1;
    const pageSize = Math.abs(Number(req.query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;
    if (!categoryId) {
      // 报错提示（关键点：这样不要用封装的failure函数，因为failure第二个参数是一个error对象，而这里是一个字符串，直接用throw new Error()抛出错误即可）
      throw new BadRequest("获取课程列表失败，分类ID不能为空。");
    }
    const condition = {
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      // 可选：看看课程是否需要展示分类和作者（注意一定要用as别名否则会报错）
      //   include: [
      //     { model: Category, as: "category", attributes: ["id", "name"] },
      //     { model: User, as: "user", attributes: ["id", "username"] },
      //   ],
      where: {
        categoryId,
      },
      limit: pageSize,
      offset,
    };
    const { count, rows } = await Course.findAndCountAll(condition);
    success(res, "查询课程列表成功", {
      courses: rows,
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

/**
 * 查询课程详情
 * GET /courses/:id
 */
/**
 * 查询课程详情
 * GET /courses/:id
 */
router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const condition = {
      attributes: { exclude: ["CategoryId", "UserId"] },
    };

    const course = await Course.findByPk(id, condition);
    if (!course) {
      throw new NotFound(`ID: ${id}的课程未找到。`);
    }

    const [category, user, chapters] = await Promise.all([
      // 查询课程关联的分类
      course.getCategory({
        attributes: ["id", "name"],
      }),
      // 查询课程关联的用户
      course.getUser({
        attributes: ["id", "username", "nickname", "avatar", "company"],
      }),
      // 查询课程关联的章节
      course.getChapters({
        attributes: ["id", "title", "rank", "createdAt"],
        order: [
          ["rank", "ASC"],
          ["id", "DESC"],
        ],
      }),
    ]);

    success(res, "查询课程成功。", { course, category, user, chapters });
  } catch (error) {
    failure(res, error);
  }
});
// router.get("/:id", async function (req, res) {
//   try {
//     const { id } = req.params;
//     const condition = {
//       attributes: { exclude: ["CategoryId", "UserId"] },
//       include: [
//         {
//           model: Category,
//           as: "category",
//           attributes: ["id", "name"],
//         },
//         {
//           model: Chapter,
//           as: "chapters",
//           attributes: ["id", "title", "rank", "createdAt"],
//           //关联模型排序，这样写不会生效的，order不能放include里面， 需要在外层的order中指定
//           // order: [
//           //   ["rank", "ASC"],
//           //   ["id", "DESC"],
//           // ],
//         },
//         {
//           model: User,
//           as: "user",
//           attributes: ["id", "username", "nickname", "avatar", "company"],
//         },
//       ],
//       order: [
//         [{ model: Chapter, as: "chapters" }, "rank", "ASC"],
//         [{ model: Chapter, as: "chapters" }, "id", "DESC"],
//       ],
//     };

//     const course = await Course.findByPk(id, condition);
//     if (!course) {
//       throw new NotFound(`ID: ${id}的课程未找到。`);
//     }

//     success(res, "查询课程成功。", { course });
//   } catch (error) {
//     failure(res, error);
//   }
// });

module.exports = router;
