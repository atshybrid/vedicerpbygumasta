"use strict";
const { Model } = require("sequelize");
const { CashAccount } = require("./../models/cashaccount");

module.exports = (sequelize, DataTypes) => {
  class Branch extends Model {
    static associate(models) {
      // Association with Employees
      this.belongsTo(models.Employee, {
        foreignKey: "manager_id",
        as: "manager",
      });

      // Association with Companies
      this.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });
    }
  }

  Branch.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      branch_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Branch name cannot be empty",
          },
        },
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Location cannot be empty",
          },
        },
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "CASCADE",
      },
      invoice_prefix: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INV",
      },
    },
    {
      sequelize,
      modelName: "Branch",
      tableName: "branches",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Branch.afterCreate(async (branch, options) => {
    const { CashAccount, BranchPettyCashAccount } = sequelize.models;
    await CashAccount.create({
      branch_id: branch.id,
      balance: 0.0,
    });

    await BranchPettyCashAccount.create({
      branch_id: branch.id,
      balance: 0.0,
    });
  });

  return Branch;
};
