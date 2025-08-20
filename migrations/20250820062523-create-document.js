"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Documents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: "文档标题",
      },
      directoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Directories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "所属目录ID",
      },
      index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "排序字段",
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
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
