"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CashHandover extends Model {
    static associate(models) {
      // Association with CounterRegister
      this.belongsTo(models.CounterRegister, {
        foreignKey: "register_id",
        as: "register",
      });

      // Association with Employee (Manager)
      this.belongsTo(models.Employee, {
        foreignKey: "manager_id",
        as: "manager",
      });

      // Association with Employee (Biller)
      this.belongsTo(models.Employee, {
        foreignKey: "biller_id",
        as: "biller",
      });

      // Association with Branch
      this.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });
    }
  }

  CashHandover.init(
    {
      handover_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      register_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "counter_registers",
          key: "register_id",
        },
        onDelete: "CASCADE",
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "employees",
          key: "employee_id",
        },
      },
      biller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "employees",
          key: "employee_id",
        },
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "branches",
          key: "id",
        },
      },
      cash_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Cash amount cannot be negative",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        allowNull: false,
        defaultValue: "PENDING",
        validate: {
          isIn: {
            args: [["PENDING", "APPROVED", "REJECTED"]],
            msg: "Status must be one of 'PENDING', 'APPROVED', or 'REJECTED'",
          },
        },
      },
      approval_date: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CashHandover",
      tableName: "cash_handover",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return CashHandover;
};
