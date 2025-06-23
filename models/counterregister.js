"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CounterRegister extends Model {
    static associate(models) {
      // Association with Employees (Biller)
      this.belongsTo(models.Employee, {
        foreignKey: "biller_id",
        as: "biller",
      });

      // Association with Branches
      this.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });

      // Association with Companies
      this.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });
    }
  }

  CounterRegister.init(
    {
      register_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      biller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Biller ID cannot be empty",
          },
        },
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Branch ID cannot be empty",
          },
        },
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Company ID cannot be empty",
          },
        },
      },
      opening_balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: {
            args: [0],
            msg: "Opening balance cannot be negative",
          },
        },
      },
      closing_balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        validate: {
          min: {
            args: [0],
            msg: "Closing balance cannot be negative",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("OPEN", "CLOSED"),
        allowNull: false,
        defaultValue: "OPEN",
        validate: {
          isIn: {
            args: [["OPEN", "CLOSED"]],
            msg: 'Status must be either "OPEN" or "CLOSED"',
          },
        },
      },
      shift_start: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      shift_end: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CounterRegister",
      tableName: "counter_registers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return CounterRegister;
};
