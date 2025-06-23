"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class GST extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  GST.init(
    {
      gst_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      gst_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      cgst_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0,
        },
      },
      sgst_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0,
        },
      },
      igst_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: "GST",
      tableName: "gst",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeValidate: (gst) => {
          // Ensure gst_rate matches the sum of cgst_rate and sgst_rate for intra-state
          if (
            gst.cgst_rate + gst.sgst_rate !== gst.gst_rate &&
            gst.igst_rate === 0
          ) {
            throw new Error(
              "For intra-state transactions, gst_rate must equal the sum of cgst_rate and sgst_rate."
            );
          }
          // Ensure igst_rate is the gst_rate for inter-state
          if (
            gst.igst_rate !== 0 &&
            (gst.cgst_rate !== 0 || gst.sgst_rate !== 0)
          ) {
            throw new Error(
              "For inter-state transactions, only igst_rate should be set, and cgst_rate and sgst_rate must be 0."
            );
          }
        },
      },
    }
  );

  return GST;
};
