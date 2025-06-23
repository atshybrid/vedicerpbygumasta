"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class StockRequest extends Model {
    static associate(models) {
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

      // Association with Employees (Managers)
      this.belongsTo(models.Employee, {
        foreignKey: "manager_id",
        as: "manager",
      });

      // Association with Item Variations
      this.belongsTo(models.ItemVariation, {
        foreignKey: "variation_id",
        as: "variation",
      });
    }
  }

  StockRequest.init(
    {
      stock_request_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      batch_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      variation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stock_requested: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [1],
            msg: "Stock requested must be at least 1",
          },
        },
      },
      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "REJECTED",
          "PARTIALLY APPROVED",
          "APPROVED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      request_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      response_date: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "StockRequest",
      tableName: "stock_requests",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return StockRequest;
};
