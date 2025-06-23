"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("otp", {
      otp_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      phone_number: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      otp_code: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },
      sent_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Add index for efficient queries
    await queryInterface.addIndex("otp", ["phone_number"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("otp");
  },
};
