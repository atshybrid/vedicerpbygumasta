"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UOM extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  UOM.init(
    {
      uom_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uom_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "UOM name cannot be empty",
          },
        },
        set(value) {
          // Ensure consistent casing (e.g., uppercase)
          this.setDataValue("uom_name", value.toUpperCase());
        },
      },
    },
    {
      sequelize,
      modelName: "UOM",
      tableName: "uom",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["uom_name"],
        },
      ],
    }
  );

  return UOM;
};
