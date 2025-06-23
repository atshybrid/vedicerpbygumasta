"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OTP extends Model {
    static associate(models) {
      // No associations for OTP currently
    }
  }
  OTP.init(
    {
      otp_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      otp_code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      sent_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "OTP",
      tableName: "otp",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return OTP;
};
