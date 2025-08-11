const express = require("express");
const router = express.Router();
// 导出一个User的基本信息
router.post("/user", async (req, res) => {
  res.json({
    name: "张三",
    age: "18",
    gender: "男",
  });
});
router.post("/lists", async (req, res) => {
  const { page, pageSize } = req.body;
  if (page && pageSize) {
    res.json({
      list: [
        {
          name: "张三",
          age: 18,
          gender: "男",
        },
      ],
      page,
      pageSize,
    });
  } else {
    res.json({
      code: 400,
      message: "参数错误",
    });
  }
});
// 导出
module.exports = router;
