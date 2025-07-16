"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UploadChunks", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uploadId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Uploads", // 确保与 Upload 表名一致
          key: "id",
        },
        onDelete: "CASCADE", // 重要级联删除
      },
      chunkIndex: Sequelize.INTEGER,
      chunkData: Sequelize.BLOB,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    // 首先删除外键约束
    await queryInterface.removeConstraint(
      "UploadChunks",
      "UploadChunks_uploadId_fkey" // 约束名称可能在您的数据库中不同
    );

    // 然后才删除表
    await queryInterface.dropTable("UploadChunks");
  },
};
