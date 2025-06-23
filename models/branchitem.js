"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BranchItem extends Model {
    static associate(models) {
      // Association with Branches
      this.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });

      // Association with ItemVariations
      this.belongsTo(models.ItemVariation, {
        foreignKey: "variation_id",
        as: "variation",
      });
    }
  }

  BranchItem.init(
    {
      branch_item_id: {
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
      variation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "Stock cannot be negative",
          },
        },
      },
      mrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "MRP must be a non-negative value",
          },
        },
      },
      discount: {
        type: DataTypes.DECIMAL(10, 2),
        validate: {
          min: {
            args: [0],
            msg: "MRP must be a non-negative value",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "BranchItem",
      tableName: "BranchItems",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return BranchItem;
};
