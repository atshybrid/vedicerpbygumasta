"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Role.init(
    {
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Role name cannot be empty",
          },
        },
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: "Description cannot exceed 500 characters",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "roles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["role_name"],
        },
      ],
    }
  );

  return Role;
};
