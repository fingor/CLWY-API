"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Upload extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.UploadChunk, {
        foreignKey: "uploadId",
        as: "chunks",
        // 下面的选项确保关系与数据库约束一致
        onDelete: "CASCADE",
        hooks: true, // 确保删除操作触发钩子
      });
    }
  }
  Upload.init(
    {
      fileName: DataTypes.STRING,
      fileSize: DataTypes.BIGINT,
      fileHash: DataTypes.STRING,
      totalChunks: DataTypes.INTEGER,
      uploadedChunks: DataTypes.INTEGER,
      status: DataTypes.STRING,
      filePath: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Upload",
    }
  );
  return Upload;
};
