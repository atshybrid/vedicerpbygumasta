"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {
    static associate(models) {
      // Define associations if needed
    }
  }

  Vendor.init(
    {
      vendor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      vendor_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Vendor name cannot be empty",
          },
        },
      },
      contact_person: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Phone number cannot be empty",
          },
          is: {
            args: /^[0-9]{10,15}$/,
            msg: "Phone number must be valid and contain 10 to 15 digits",
          },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: {
            msg: "Must be a valid email address",
          },
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Vendor",
      tableName: "vendors",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["phone_number"],
        },
        {
          unique: true,
          fields: ["email"],
        },
      ],
    }
  );

  return Vendor;
};
