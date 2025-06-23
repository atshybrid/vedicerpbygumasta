"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      // Association with Employee
      this.belongsTo(models.Employee, {
        foreignKey: "emp_id",
        as: "employee",
      });

      // Association with Manager
      this.belongsTo(models.Employee, {
        foreignKey: "manager_id",
        as: "manager",
      });

      // Association with Branch
      this.belongsTo(models.Branch, {
        foreignKey: "branch_id",
        as: "branch",
      });

      // Association with Company
      this.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });
    }
  }

  Attendance.init(
    {
      attendance_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      emp_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "employees",
          key: "employee_id",
        },
        onDelete: "CASCADE",
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "employees",
          key: "employee_id",
        },
        onDelete: "SET NULL",
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "branches", // Correct table name here
          key: "id",
        },
        onDelete: "CASCADE",
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "company",
          key: "company_id",
        },
        onDelete: "CASCADE",
      },
      live_image: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Live image is required",
          },
          isUrl: {
            msg: "Live image must be a valid URL",
          },
        },
      },
      timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      attendance_status: {
        type: DataTypes.ENUM("Present", "Half-Day", "Absent"),
        allowNull: false,
        defaultValue: "Absent",
        validate: {
          isIn: {
            args: [["Present", "Half-Day", "Absent"]],
            msg: "Attendance status must be 'Present', 'Half-Day', or 'Absent'",
          },
        },
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: "Remarks cannot exceed 255 characters",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Attendance",
      tableName: "attendance",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Attendance;
};
