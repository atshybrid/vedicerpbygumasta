"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SaleReturn extends Model {
    static associate(models) {
      // Association with Sale
      this.belongsTo(models.Sale, {
        foreignKey: "sale_id",
        as: "sale",
      });

      // Association with Customer
      this.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
      });
    }
  }

  SaleReturn.init(
    {
      return_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
      },
      return_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Return amount cannot be negative",
          },
        },
      },
      return_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "SaleReturn",
      tableName: "sale_returns",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return SaleReturn;
};
