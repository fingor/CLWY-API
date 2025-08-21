"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Documents", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: "文档标题",
      },
      directoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Directories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "所属目录ID，NULL表示根目录",
      },
      index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "排序字段",
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "文档内容",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex("Documents", ["directoryId", "index"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Documents");
  },
};