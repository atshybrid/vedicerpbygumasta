"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("stock_register", {
      stock_register_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Items",
          key: "item_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      variation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ItemVariations",
          key: "variation_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Branches",
          key: "branch_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      transaction_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Quantity cannot be negative",
          },
        },
      },
      gst_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      gst_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      remarks: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("stock_register");
  },
};
