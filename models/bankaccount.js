"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BankAccount extends Model {
    static associate(models) {
      // Association with Company
      this.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });
    }
  }

  BankAccount.init(
    {
      bank_account_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
      },
      bank_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Bank name cannot be empty",
          },
        },
      },
      account_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Account number cannot be empty",
          },
        },
      },
      account_type: {
        type: DataTypes.ENUM("Savings", "Current"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["Savings", "Current"]],
            msg: 'Account type must be either "Savings" or "Current"',
          },
        },
      },
      balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: {
            args: [0],
            msg: "Balance cannot be negative",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "BankAccount",
      tableName: "company_bank_accounts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["account_number"], // Define a unique index on account_number
        },
      ],
    }
  );

  return BankAccount;
};
