"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FinancialTransaction extends Model {
    static associate(models) {
      // Association with Vendors
      this.belongsTo(models.Vendor, {
        foreignKey: "vendor_id",
        as: "vendor",
      });

      // Association with Customers
      this.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
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

      // Association with BankAccounts
      this.belongsTo(models.BankAccount, {
        foreignKey: "bank_account_id",
        as: "bankAccount",
      });

      // Association with Handover
      this.belongsTo(models.Employee, {
        foreignKey: "handover_id",
        as: "handover",
      });

      // Association with Employees
      this.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        as: "employee",
      });
    }
  }

  FinancialTransaction.init(
    {
      transaction_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      transaction_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Transaction type cannot be empty",
          },
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Amount must be positive",
          },
        },
      },
      transaction_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM(
          "CASH",
          "UPI",
          "CARD",
          "NETBANKING",
          "SPLIT",
          "BALANCE"
        ),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Payment method cannot be empty",
          },
        },
      },
      reference_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "CASCADE",
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "CASCADE",
      },
      bank_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      handover_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "FinancialTransaction",
      tableName: "financial_transactions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return FinancialTransaction;
};
