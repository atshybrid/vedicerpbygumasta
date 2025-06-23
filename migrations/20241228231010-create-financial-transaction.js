"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("financial_transactions", {
      transaction_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      transaction_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Amount must be positive",
          },
        },
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      reference_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Vendors",
          key: "vendor_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Customers",
          key: "customer_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Branches",
          key: "branch_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Companies",
          key: "company_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      bank_account_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "BankAccounts",
          key: "bank_account_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      handover_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("financial_transactions");
  },
};
