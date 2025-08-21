const express = require("express");
const router = express.Router();
const { Directory, Document } = require("../../models");
const { success, failure } = require("../../utils/responses");

// 获取树形结构
router.get("/getData", async (req, res) => {
  try {
    // 获取所有目录
    const directories = await Directory.findAll({
      attributes: ["id", "title", "parentId", "index"],
      order: [
        ["index", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    // 获取所有文档
    const documents = await Document.findAll({
      attributes: ["id", "title", "directoryId", "index"],
      order: [
        ["index", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    // 构建单层级数组
    const notesData = [];

    // 添加目录
    directories.forEach((dir) => {
      notesData.push({
        id: dir.id.toString(),
        pid: dir.parentId ? dir.parentId.toString() : null,
        title: dir.title,
        type: "folder",
        index: dir.index,
      });
    });

    // 添加文档
    documents.forEach((doc) => {
      notesData.push({
        id: doc.id.toString(),
        pid: doc.directoryId.toString(),
        title: doc.title,
        type: "document",
        index: doc.index,
      });
    });

    success(res, "获取笔记数据成功。", { notesData });
  } catch (error) {
    failure(res, error);
  }
});

// 创建目录
router.post("/directory", async (req, res) => {
  try {
    const { title, parentId, index = 0 } = req.body;
    const directory = await Directory.create({
      title,
      parentId: parentId || null,
      index,
    });
    success(res, "创建目录成功。", { directory });
  } catch (error) {
    failure(res, error);
  }
});
// 获取文档内容
router.get("/document/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    success(res, "获取文档内容成功。", { document });
  } catch (error) {
    failure(res, error);
  }
});
// 创建文档
router.post("/document", async (req, res) => {
  try {
    const { title, directoryId, content, index = 0 } = req.body;
    const document = await Document.create({
      title,
      directoryId,
      content,
      index,
    });

    success(res, "创建文档成功。", { document });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;
