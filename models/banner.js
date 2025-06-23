"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {
      // Associations
      this.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });

      this.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });
    }
  }

  Banner.init(
    {
      banner_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "CASCADE",
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "CASCADE",
      },
      banner_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Banner",
      tableName: "banners",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Banner;
};
