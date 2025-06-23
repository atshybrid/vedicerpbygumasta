"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class StockTransfer extends Model {
    static associate(models) {
      // Association with Branches (from_branch and to_branch)
      this.belongsTo(models.Branch, {
        foreignKey: "from_branch_id",
        as: "fromBranch",
      });
      this.belongsTo(models.Branch, {
        foreignKey: "to_branch_id",
        as: "toBranch",
      });

      // Association with Companies (from_company)
      this.belongsTo(models.Company, {
        foreignKey: "from_company_id",
        as: "fromCompany",
      });

      // Association with ItemVariations
      this.belongsTo(models.ItemVariation, {
        foreignKey: "variation_id",
        as: "variation",
      });
    }
  }

  StockTransfer.init(
    {
      transfer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      batch_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      from_branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: "from_branch_id must be an integer",
          },
        },
      },
      from_company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: "from_company_id must be an integer",
          },
        },
      },
      to_branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "to_branch_id must be an integer",
          },
        },
      },
      variation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "variation_id must be an integer",
          },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [1],
            msg: "Quantity must be greater than zero",
          },
        },
      },
      received_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "Received quantity cannot be negative",
          },
        },
      },
      lost_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "Lost quantity cannot be negative",
          },
        },
      },
      transfer_date: {
        type: DataTypes.BIGINT, // Storing timestamp
        allowNull: false,
        validate: {
          isInt: {
            msg: "transfer_date must be a valid timestamp",
          },
        },
      },

      acknowledge: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "StockTransfer",
      tableName: "stock_transfer",
      timestamps: true, // Automatically manage createdAt and updatedAt
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return StockTransfer;
};
