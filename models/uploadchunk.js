"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UploadChunk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Upload, {
        foreignKey: "uploadId",
        as: "upload",
      });
    }
  }
  UploadChunk.init(
    {
      uploadId: DataTypes.STRING,
      chunkIndex: DataTypes.INTEGER,
      chunkHash: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UploadChunk",
    }
  );
  return UploadChunk;
};
