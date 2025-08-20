"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Directories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "目录名称",
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // 外键
        references: {
          model: "Directories",
          key: "id",
        },
        // 级联更新
        onUpdate: "CASCADE",
        // 级联删除
        onDelete: "CASCADE",
        comment: "父目录ID，NULL表示根目录",
      },
      index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "排序字段",
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
    await queryInterface.addIndex("Directories", ["parentId", "index"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Directories");
  },
};
