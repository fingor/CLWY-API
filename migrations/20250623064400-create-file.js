"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Files", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fileSize: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("uploading", "completed"),
        defaultValue: "uploading",
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Files");
  },
};
