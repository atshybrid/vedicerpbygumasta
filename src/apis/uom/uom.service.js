const { UOM } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "uom.service.js";

module.exports = {
  createUom: async ({ body }) => {
    try {
      // Validate body
      if (!body.uom_name) {
        return sendServiceMessage("messages.apis.app.uom.create.invalid_body");
      }

      // Ensure uom_name is unique
      const existingUom = await UOM.findOne({
        where: { uom_name: body.uom_name.toUpperCase() },
      });
      if (existingUom) {
        return sendServiceMessage(
          "messages.apis.app.uom.create.duplicate_uom_name"
        );
      }

      // Create Uom
      const uom = await UOM.create({
        uom_name: body.uom_name.toUpperCase(), // Ensure consistent casing (uppercase)
      });

      return sendServiceData(uom);
    } catch (error) {
      console.error(`${TAG} - createUom: `, error);
      return sendServiceMessage("messages.apis.app.uom.create.error");
    }
  },

  getUoms: async () => {
    try {
      // Retrieve all Uoms
      const uoms = await UOM.findAll({
        attributes: ["uom_id", "uom_name", "created_at", "updated_at"],
      });

      return sendServiceData(uoms);
    } catch (error) {
      console.error(`${TAG} - getUoms: `, error);
      return sendServiceMessage("messages.apis.app.uom.read.error");
    }
  },

  getUom: async ({ params }) => {
    try {
      // Retrieve a single Uom by ID
      const uom = await UOM.findByPk(params.uom_id, {
        attributes: ["uom_id", "uom_name", "created_at", "updated_at"],
      });

      if (!uom) {
        return sendServiceMessage("messages.apis.app.uom.read.not_found");
      }

      return sendServiceData(uom);
    } catch (error) {
      console.error(`${TAG} - getUom: `, error);
      return sendServiceMessage("messages.apis.app.uom.read.error");
    }
  },

  updateUom: async ({ params, body }) => {
    try {
      // Validate body
      if (!body.uom_name) {
        return sendServiceMessage("messages.apis.app.uom.update.invalid_body");
      }

      // Find the Uom
      const uom = await UOM.findByPk(params.uom_id);
      if (!uom) {
        return sendServiceMessage("messages.apis.app.uom.update.not_found");
      }

      // Check for duplicate Uom name
      const existingUom = await UOM.findOne({
        where: {
          uom_name: body.uom_name.toUpperCase(),
          uom_id: { $ne: params.uom_id },
        },
      });
      if (existingUom) {
        return sendServiceMessage(
          "messages.apis.app.uom.update.duplicate_uom_name"
        );
      }

      // Update the Uom
      const updatedUom = await UOM.update({
        uom_name: body.uom_name.toUpperCase(),
      });

      return sendServiceData(updatedUom);
    } catch (error) {
      console.error(`${TAG} - updateUom: `, error);
      return sendServiceMessage("messages.apis.app.uom.update.error");
    }
  },

  deleteUom: async ({ params }) => {
    try {
      // Find the Uom
      const uom = await UOM.findByPk(params.uom_id);
      if (!uom) {
        return sendServiceMessage("messages.apis.app.uom.delete.not_found");
      }

      // Delete the Uom
      await uom.destroy();

      return sendServiceMessage("messages.apis.app.uom.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteUom: `, error);
      return sendServiceMessage("messages.apis.app.uom.delete.error");
    }
  },

  bulkCreateUOMs: async ({ body }) => {
    try {
      const { uoms } = body;

      if (!Array.isArray(uoms) || uoms.length === 0) {
        return sendServiceMessage(
          "messages.apis.app.uom.bulk_create.invalid_body"
        );
      }

      const createdUOMs = await UOM.bulkCreate(uoms);

      return sendServiceData(createdUOMs);
    } catch (error) {
      console.error(`${TAG} - bulkCreateUOMs: `, error);
      return sendServiceMessage("messages.apis.app.uom.bulk_create.error");
    }
  },

  updateUOMStatus: async ({ params, body }) => {
    try {
      const { status } = body;

      if (typeof status !== "boolean") {
        return sendServiceMessage(
          "messages.apis.app.uom.update_status.invalid_body"
        );
      }

      const uom = await UOM.findByPk(params.uom_id);
      if (!uom) {
        return sendServiceMessage(
          "messages.apis.app.uom.update_status.not_found"
        );
      }

      uom.is_active = status;
      await uom.save();

      return sendServiceMessage("messages.apis.app.uom.update_status.success");
    } catch (error) {
      console.error(`${TAG} - updateUOMStatus: `, error);
      return sendServiceMessage("messages.apis.app.uom.update_status.error");
    }
  },

  getUOMUsageReport: async () => {
    try {
      const report = await sequelize.query(`
      SELECT u.uom_name, COUNT(i.item_id) AS usage_count
      FROM uoms u
      LEFT JOIN items i ON u.uom_id = i.uom_id
      GROUP BY u.uom_name
    `);

      return sendServiceData(report[0]);
    } catch (error) {
      console.error(`${TAG} - getUOMUsageReport: `, error);
      return sendServiceMessage("messages.apis.app.uom.report.error");
    }
  },
};
