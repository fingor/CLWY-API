"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Document.belongsTo(models.Directory, {
        as: "directory",
        foreignKey: "directoryId",
      });
    }
  }
  Document.init(
    {
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notNull: { msg: "文档标题必须填写。" },
          notEmpty: { msg: "文档标题不能为空。" },
          len: { args: [1, 200], msg: "文档标题长度必须在1-200之间。" },
        },
      },
      directoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "目录ID必须填写。" },
          async isPresent(value) {
            const directory = await sequelize.models.Directory.findByPk(value);
            if (!directory) {
              throw new Error(`ID为：${value} 的目录不存在。`);
            }
          },
        },
      },
      index: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Document",
    }
  );
  return Document;
};
