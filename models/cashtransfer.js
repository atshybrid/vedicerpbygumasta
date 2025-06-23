"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CashTransfer extends Model {
    static associate(models) {
      // Association with Branch
      this.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });

      // Association with Company
      this.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });

      // Association with Employee
      this.belongsTo(models.Employee, {
        foreignKey: "created_by",
        as: "employee",
      });
    }
  }

  CashTransfer.init(
    {
      transfer_id: {
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
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CashTransfer",
      tableName: "cash_transfers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return CashTransfer;
};
