"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Directory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 自关联 - 父子目录关系
      Directory.belongsTo(Directory, { as: "parent", foreignKey: "parentId" });
      Directory.hasMany(Directory, { as: "children", foreignKey: "parentId" });

      // 目录与文档的关系
      Directory.hasMany(models.Document, {
        as: "documents",
        foreignKey: "directoryId",
      });
    }
  }
  Directory.init(
    {
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: "目录名称必须填写。" },
          notEmpty: { msg: "目录名称不能为空。" },
          len: { args: [1, 50], msg: "目录名称长度必须在1-50之间。" },
        },
      },
      parentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        validate: {
          async isPresent(value) {
            if (value !== null) {
              const parent = await sequelize.models.Directory.findByPk(value);
              if (!parent) {
                throw new Error(`ID为：${value} 的父目录不存在。`);
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
    },
    {
      sequelize,
      modelName: "Directory",
    }
  );
  return Directory;
};
