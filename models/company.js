"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      // Define associations here if needed

      // Association with BankAccount
      this.hasMany(models.BankAccount, {
        foreignKey: "bank_account_id",
        as: "bank_accounts",
      });
    }
  }

  Company.init(
    {
      company_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      company_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address_line1: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      postal_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      gst_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      pan_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bank_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Company",
      tableName: "company",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Company;
};
