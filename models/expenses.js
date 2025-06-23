"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      // Association with Branch
      this.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });

      // Association with Employee (who recorded the expense)
      this.belongsTo(models.Employee, {
        foreignKey: "recorded_by",
        as: "employee",
      });

      // Association with Petty Cash Account
      this.belongsTo(models.BranchPettyCashAccount, {
        foreignKey: "branch_id",
        as: "petty_cash_account",
      });

      // Association with Bank Account
      this.belongsTo(models.BankAccount, {
        foreignKey: "bank_account_id",
        as: "bank_account",
      });

      // Association with Company
      this.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });
    }
  }

  Expense.init(
    {
      expense_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        onDelete: "CASCADE",
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,

        onDelete: "CASCADE",
      },
      bank_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        onDelete: "CASCADE",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Amount must be a non-negative value",
          },
        },
      },
      photo_proof: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: {
            args: true,
            msg: "Photo proof must be a valid URL",
          },
          len: {
            args: [0, 255],
            msg: "Photo proof cannot exceed 255 characters",
          },
        },
      },
      type: {
        type: DataTypes.ENUM(
          "Product Purchases",
          "Freight and Shipping Costs",
          "Inventory Shrinkage",
          "Inventory Storage",
          "Salaries and Wages",
          "Overtime Pay",
          "Employee Benefits",
          "Training and Development",
          "Commissions and Bonuses",
          "Rent or Lease",
          "Utilities",
          "Maintenance and Repairs",
          "Cleaning and Sanitation",
          "Security Services",
          "In-Store Promotions",
          "Social Media Advertising",
          "Print Ads",
          "Loyalty Programs",
          "Seasonal Decorations",
          "POS System Costs",
          "Software Subscriptions",
          "Website Maintenance",
          "Data Security",
          "Delivery Costs",
          "Vehicle Maintenance",
          "Fuel Costs",
          "Shipping Materials",
          "Bank Fees",
          "Loan Repayments",
          "Tax Payments",
          "Accounting and Legal Services",
          "Packaging Materials",
          "Office Supplies",
          "Cleaning Supplies",
          "Fixtures and Fittings",
          "Equipment",
          "Leasehold Improvements",
          "Staff Uniforms",
          "Professional Services",
          "Unexpected Repairs"
        ),
        allowNull: false,
        validate: {
          isIn: {
            args: [
              [
                "Product Purchases",
                "Freight and Shipping Costs",
                "Inventory Shrinkage",
                "Inventory Storage",
                "Salaries and Wages",
                "Overtime Pay",
                "Employee Benefits",
                "Training and Development",
                "Commissions and Bonuses",
                "Rent or Lease",
                "Utilities",
                "Maintenance and Repairs",
                "Cleaning and Sanitation",
                "Security Services",
                "In-Store Promotions",
                "Social Media Advertising",
                "Print Ads",
                "Loyalty Programs",
                "Seasonal Decorations",
                "POS System Costs",
                "Software Subscriptions",
                "Website Maintenance",
                "Data Security",
                "Delivery Costs",
                "Vehicle Maintenance",
                "Fuel Costs",
                "Shipping Materials",
                "Bank Fees",
                "Loan Repayments",
                "Tax Payments",
                "Accounting and Legal Services",
                "Packaging Materials",
                "Office Supplies",
                "Cleaning Supplies",
                "Fixtures and Fittings",
                "Equipment",
                "Leasehold Improvements",
                "Staff Uniforms",
                "Professional Services",
                "Unexpected Repairs",
              ],
            ],
            msg: "Invalid expense type",
          },
        },
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: "Remarks cannot exceed 255 characters",
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
            msg: "Status must be either 'PENDING', 'APPROVED', or 'REJECTED'",
          },
        },
      },
      recorded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "employees",
          key: "employee_id",
        },
        onDelete: "CASCADE",
      },
      expense_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Expense",
      tableName: "expenses",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Expense;
};
