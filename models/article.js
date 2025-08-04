"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Article.init(
    {
      // title: DataTypes.STRING,
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "标题必须存在。",
          },
          notEmpty: {
            msg: "标题不能为空。",
          },
          len: {
            args: [3, 45],
            msg: "标题长度需要在3 ~ 45个字符之间。",
          },
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      paranoid: true,
      modelName: "Article",
    }
  );
  return Article;
};
