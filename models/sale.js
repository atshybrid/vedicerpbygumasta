"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    static associate(models) {
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

      // Association with Employees
      this.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        as: "employee",
      });
    }
  }

  Sale.init(
    {
      sale_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
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
        defaultValue: 1,
      },
      sub_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Sub total cannot be negative",
          },
        },
      },

      gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "GST amount cannot be negative",
          },
        },
      },
      discount_percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Discount percentage cannot be negative",
          },
        },
        defaultValue: 0,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Discount amount cannot be negative",
          },
        },
        defaultValue: 0,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Total amount cannot be negative",
          },
        },
      },
      sale_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM("Paid", "Due"),
        allowNull: false,
        defaultValue: "Due",
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Sale",
      tableName: "sales",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Sale;
};
