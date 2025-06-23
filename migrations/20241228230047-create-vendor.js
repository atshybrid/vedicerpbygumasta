"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("vendors", {
      vendor_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      vendor_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
          is: {
            args: /^[0-9]{10,15}$/,
            msg: "Phone number must be valid and contain 10 to 15 digits",
          },
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
    await queryInterface.dropTable("vendors");
  },
};
