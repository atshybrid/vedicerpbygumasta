"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BranchPettyCashAccount extends Model {
    static associate(models) {
      // Association with Branch
      this.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
        onDelete: "CASCADE",
      });
    }
  }

  BranchPettyCashAccount.init(
    {
      petty_cash_account_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "branches",
          key: "id",
        },
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
    },
    {
      sequelize,
      modelName: "BranchPettyCashAccount",
      tableName: "branch_petty_cash_accounts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return BranchPettyCashAccount;
};
