"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      // Association with Categories
      this.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });

      // Association with GST
      this.belongsTo(models.GST, {
        foreignKey: "gst_id",
        as: "gst",
      });

      // Association with UOM
      this.belongsTo(models.UOM, {
        foreignKey: "uom_id",
        as: "uom",
      });

      // Association with ItemVariation
      this.hasMany(models.ItemVariation, {
        foreignKey: "item_id",
        as: "variations",
      });
    }
  }

  Item.init(
    {
      item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      item_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Item name cannot be empty",
          },
        },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
      },
      gst_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      uom_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Item",
      tableName: "items",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["item_name"],
        },
      ],
    }
  );

  return Item;
};
