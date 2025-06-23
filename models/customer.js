"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      // Define associations if needed
    }
  }

  Customer.init(
    {
      customer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customer_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Customer name cannot be empty",
          },
        },
      },
      customer_type: {
        type: DataTypes.ENUM("B2B", "B2C"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["B2B", "B2C"]],
            msg: 'Customer type must be either "B2B" or "B2C"',
          },
        },
      },
      gst_number: {
        type: DataTypes.STRING(15),
        allowNull: true,
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
          is: /^[0-9]{10,15}$/, // Validate phone number format
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
      credit_limit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: {
            args: [0],
            msg: "Credit limit cannot be negative",
          },
        },
      },
      credit_period: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "Credit period cannot be negative",
          },
        },
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0, // Allows positive and negative balances
      },
    },
    {
      sequelize,
      modelName: "Customer",
      tableName: "customers",
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
        {
          unique: true,
          fields: ["gst_number"],
        },
      ],
    }
  );

  return Customer;
};
