"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ItemVariation extends Model {
    static associate(models) {
      // Association with Items
      this.belongsTo(models.Item, {
        foreignKey: "item_id",
        as: "item",
      });
    }
  }

  ItemVariation.init(
    {
      variation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
      },
      variation_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Variation name cannot be empty",
          },
        },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // variation_value: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      //   validate: {
      //     notEmpty: {
      //       msg: "Variation value cannot be empty",
      //     },
      //   },
      // },
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
      // stock: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   defaultValue: 0,
      //   validate: {
      //     min: {
      //       args: [0],
      //       msg: "Stock cannot be negative",
      //     },
      //   },
      // },
      barcode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ItemVariation",
      tableName: "item_variations",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["barcode"],
        },
        {
          unique: true,
          fields: ["sku"],
        },
      ],
    }
  );

  return ItemVariation;
};
