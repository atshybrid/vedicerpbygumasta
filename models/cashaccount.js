"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CashAccount extends Model {
    static associate(models) {
      // Association with Branches
      this.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });

      // Association with Users
      this.belongsTo(models.User, {
        foreignKey: "last_updated_by",
        as: "updatedBy",
      });
    }
  }

  CashAccount.init(
    {
      cash_account_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: {
            args: [0],
            msg: "Balance cannot be negative",
          },
        },
      },
      last_updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CashAccount",
      tableName: "branch_cash_accounts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return CashAccount;
};
