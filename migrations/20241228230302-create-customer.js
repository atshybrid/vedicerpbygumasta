"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("customers", {
      customer_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customer_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      customer_type: {
        type: Sequelize.ENUM("B2B", "B2C"),
        allowNull: false,
      },
      gst_number: {
        type: Sequelize.STRING(15),
        allowNull: true,
        unique: true,
      },
      contact_person: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
        validate: {
          is: /^[0-9]{10,15}$/, // Allow phone numbers with 10 to 15 digits
        },
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: {
            msg: "Must be a valid email address",
          },
        },
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      credit_limit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: {
            args: [0],
            msg: "Credit limit cannot be negative",
          },
        },
      },
      credit_period: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "Credit period cannot be negative",
          },
        },
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
    await queryInterface.dropTable("customers");
  },
};
