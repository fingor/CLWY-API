"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require('uuid');

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
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
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
        type: DataTypes.UUID,
        allowNull: true,
        validate: {
          async isPresent(value) {
            if (value !== null && value !== undefined) {
              const directory = await sequelize.models.Directory.findByPk(value);
              if (!directory) {
                throw new Error(`ID为：${value} 的目录不存在。`);
              }
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
      hooks: {
        beforeCreate: async (document, options) => {
          // 构建查询条件
          const whereCondition = {};
          if (document.directoryId !== null && document.directoryId !== undefined) {
            whereCondition.directoryId = document.directoryId;
          } else {
            whereCondition.directoryId = null;
          }
          
          // 获取同目录下文档的最大index值
          const maxIndex = await Document.max('index', {
            where: whereCondition,
            transaction: options.transaction
          });
          document.index = (maxIndex || 0) + 1;
        }
      }
    }
  );
  return Document;
};
