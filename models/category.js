"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Self-referencing associations
      this.hasMany(models.Category, {
        foreignKey: "parent_id",
        as: "sub_categories",
      });

      this.belongsTo(models.Category, {
        foreignKey: "parent_id",
        as: "parent",
      });
    }
  }

  Category.init(
    {
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      category_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Category name cannot be empty",
          },
        },
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },

    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["category_name"], // Explicitly define the unique index
        },
      ],
    }
  );

  return Category;
};
