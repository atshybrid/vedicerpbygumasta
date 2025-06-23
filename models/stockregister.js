"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class StockRegister extends Model {
    static associate(models) {
      // Association with Items
      this.belongsTo(models.Item, {
        foreignKey: "item_id",
        as: "item",
      });

      // Association with ItemVariations
      this.belongsTo(models.ItemVariation, {
        foreignKey: "variation_id",
        as: "variation",
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

  StockRegister.init(
    {
      stock_register_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      variation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      transaction_type: {
        type: DataTypes.ENUM(
          "SALE",
          "SALE_RETURN",
          "PURCHASE",
          "TRANSFER",
          "ADJUSTMENT"
        ),
        allowNull: false,
        validate: {
          isIn: {
            args: [
              ["SALE", "SALE_RETURN", "PURCHASE", "TRANSFER", "ADJUSTMENT"],
            ],
            msg: "Transaction type must be one of 'SALE', 'SALE_RETURN', 'PURCHASE', 'TRANSFER', or 'ADJUSTMENT'",
          },
        },
      },
      flow_type: {
        type: DataTypes.ENUM("IN", "OUT"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["IN", "OUT"]],
            msg: "Flow type must be either 'IN' or 'OUT'",
          },
        },
      },
      rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: {
            args: [0],
            msg: "Rate cannot be negative",
          },
        },
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Quantity cannot be negative",
          },
        },
      },
      loss_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: {
            args: [0],
            msg: "Loss quantity cannot be negative",
          },
        },
      },
      sub_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      grand_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      batch_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transaction_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "StockRegister",
      tableName: "stock_register",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return StockRegister;
};
