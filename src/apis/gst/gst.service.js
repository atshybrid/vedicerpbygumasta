const { GST, Item } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "gst.service.js";

module.exports = {
  createGst: async ({ body }) => {
    try {
      // Validate body
      if (!body.gst_rate || body.gst_rate < 0) {
        return sendServiceMessage("messages.apis.app.gst.create.invalid_body");
      }

      // Ensure rates sum up correctly if applicable
      const { gst_rate, cgst_rate, sgst_rate, igst_rate } = body;

      // Validate Exisitng Gst Rates
      const existingGst = await GST.findOne({
        where: {
          gst_rate: gst_rate,
          cgst_rate: cgst_rate || 0.0,
          sgst_rate: sgst_rate || 0.0,
          igst_rate: igst_rate || 0.0,
        },
      });

      if (existingGst) {
        return sendServiceMessage("messages.apis.app.gst.create.exists");
      }

      if (!gst_rate || !((cgst_rate && sgst_rate) || igst_rate)) {
        return sendServiceMessage("messages.apis.app.gst.create.invalid_body");
      }
      if (
        gst_rate &&
        (cgst_rate || sgst_rate) &&
        cgst_rate + sgst_rate !== gst_rate
      ) {
        return sendServiceMessage(
          "messages.apis.app.gst.create.invalid_rate_sum"
        );
      }
      if (gst_rate && igst_rate && (cgst_rate || sgst_rate)) {
        return sendServiceMessage(
          "messages.apis.app.gst.create.conflicting_rates"
        );
      }

      // Create Gst record
      const gst = await GST.create({
        gst_rate: gst_rate,
        cgst_rate: cgst_rate || 0.0,
        sgst_rate: sgst_rate || 0.0,
        igst_rate: igst_rate || 0.0,
      });

      return sendServiceData(gst);
    } catch (error) {
      console.error(`${TAG} - createGst: `, error);
      return sendServiceMessage("messages.apis.app.gst.create.error");
    }
  },

  getGsts: async () => {
    try {
      // Retrieve all Gst rates
      const gstRates = await GST.findAll({
        attributes: [
          "gst_id",
          "gst_rate",
          "cgst_rate",
          "sgst_rate",
          "igst_rate",
          "created_at",
          "updated_at",
        ],
      });

      return sendServiceData(gstRates);
    } catch (error) {
      console.error(`${TAG} - getGsts: `, error);
      return sendServiceMessage("messages.apis.app.gst.read.error");
    }
  },

  getGst: async ({ params }) => {
    try {
      // Retrieve a single Gst rate by ID
      const gst = await Gst.findByPk(params.gst_id, {
        attributes: [
          "gst_id",
          "gst_rate",
          "cgst_rate",
          "sgst_rate",
          "igst_rate",
          "created_at",
          "updated_at",
        ],
      });

      if (!gst) {
        return sendServiceMessage("messages.apis.app.gst.read.not_found");
      }

      return sendServiceData(gst);
    } catch (error) {
      console.error(`${TAG} - getGst: `, error);
      return sendServiceMessage("messages.apis.app.gst.read.error");
    }
  },

  updateGst: async ({ params, body }) => {
    try {
      // Validate body
      if (!body) {
        return sendServiceMessage("messages.apis.app.gst.update.invalid_body");
      }

      // Find the Gst record
      const gst = await Gst.findByPk(params.gst_id);
      if (!gst) {
        return sendServiceMessage("messages.apis.app.gst.update.not_found");
      }

      // Ensure rates sum up correctly if applicable
      const { gst_rate, cgst_rate, sgst_rate, igst_rate } = body;
      if (
        gst_rate &&
        (cgst_rate || sgst_rate) &&
        cgst_rate + sgst_rate !== gst_rate
      ) {
        return sendServiceMessage(
          "messages.apis.app.gst.update.invalid_rate_sum"
        );
      }
      if (gst_rate && igst_rate && (cgst_rate || sgst_rate)) {
        return sendServiceMessage(
          "messages.apis.app.gst.update.conflicting_rates"
        );
      }

      // Update Gst record
      const updatedGst = await gst.update({
        gst_rate: gst_rate || gst.gst_rate,
        cgst_rate: cgst_rate || gst.cgst_rate,
        sgst_rate: sgst_rate || gst.sgst_rate,
        igst_rate: igst_rate || gst.igst_rate,
      });

      return sendServiceData(updatedGst);
    } catch (error) {
      console.error(`${TAG} - updateGst: `, error);
      return sendServiceMessage("messages.apis.app.gst.update.error");
    }
  },

  deleteGst: async ({ params }) => {
    try {
      // Find the Gst record
      const gst = await Gst.findByPk(params.gst_id);
      if (!gst) {
        return sendServiceMessage("messages.apis.app.gst.delete.not_found");
      }

      // Delete the Gst record
      await gst.destroy();

      return sendServiceMessage("messages.apis.app.gst.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteGst: `, error);
      return sendServiceMessage("messages.apis.app.gst.delete.error");
    }
  },

  archiveOldGSTRates: async () => {
    try {
      const archived = await Gst.update(
        { is_archived: true },
        { where: { end_date: { [Op.lt]: new Date() } } }
      );

      return sendServiceMessage("messages.apis.app.gst.archive.success");
    } catch (error) {
      console.error(`${TAG} - archiveOldGSTRates: `, error);
      return sendServiceMessage("messages.apis.app.gst.archive.error");
    }
  },

  // getGSTChangeLog: async () => {
  //   try {
  //     const changeLog = await GstChangeLog.findAll({
  //       attributes: [
  //         "gst_id",
  //         "changed_by",
  //         "old_rate",
  //         "new_rate",
  //         "change_date",
  //       ],
  //     });

  //     return sendServiceData(changeLog);
  //   } catch (error) {
  //     console.error(`${TAG} - getGSTChangeLog: `, error);
  //     return sendServiceMessage("messages.apis.app.gst.change_log.error");
  //   }
  // },

  applyGSTToMultipleItems: async ({ body }) => {
    try {
      const { gst_id, item_ids } = body;

      if (!gst_id || !Array.isArray(item_ids) || item_ids.length === 0) {
        return sendServiceMessage(
          "messages.apis.app.gst.bulk_apply.invalid_body"
        );
      }

      const updatedItems = await Item.update(
        { gst_id },
        { where: { item_id: { [Op.in]: item_ids } } }
      );

      return sendServiceMessage("messages.apis.app.gst.bulk_apply.success");
    } catch (error) {
      console.error(`${TAG} - applyGSTToMultipleItems: `, error);
      return sendServiceMessage("messages.apis.app.gst.bulk_apply.error");
    }
  },
};
