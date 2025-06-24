"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  File.init(
    {
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fileSize: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("uploading", "completed"),
        defaultValue: "uploading",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "File",
    }
  );
  return File;
};
