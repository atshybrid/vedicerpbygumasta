const { ItemVariation, Item } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "variation.service.js";

module.exports = {
  createVariation: async ({ body }) => {
    try {
      // Validate body
      if (
        !body.item_id ||
        !body.variation_name ||
        !body.mrp ||
        !body.barcode ||
        !body.sku
      ) {
        return sendServiceMessage(
          "messages.apis.app.variation.create.invalid_body"
        );
      }

      // Check if variation name is unique
      const existingVariation = await ItemVariation.findOne({
        where: { variation_name: body.variation_name, item_id: body.item_id },
      });

      if (existingVariation) {
        return sendServiceMessage(
          "messages.apis.app.variation.create.duplicate_variation"
        );
      }

      // Ensure item_id exists
      const itemExists = await Item.findByPk(body.item_id);
      if (!itemExists) {
        return sendServiceMessage(
          "messages.apis.app.variation.create.invalid_item"
        );
      }

      // Ensure barcode and SKU are unique, if provided
      if (body.barcode) {
        const existingBarcode = await ItemVariation.findOne({
          where: { barcode: body.barcode },
        });
        if (existingBarcode) {
          return sendServiceMessage(
            "messages.apis.app.variation.create.duplicate_barcode"
          );
        }
      }

      if (body.sku) {
        const existingSKU = await ItemVariation.findOne({
          where: { sku: body.sku },
        });
        if (existingSKU) {
          return sendServiceMessage(
            "messages.apis.app.variation.create.duplicate_sku"
          );
        }
      }

      // Create item variation
      const itemVariation = await ItemVariation.create({
        item_id: body.item_id,
        variation_name: body.variation_name,
        mrp: body.mrp,
        stock: body.stock,
        barcode: body.barcode || null,
        sku: body.sku || null,
        discount: body.discount || 0,
        image: body.image || null,
      });

      return sendServiceData(itemVariation);
    } catch (error) {
      console.error(`${TAG} - createVariation: `, error);
      return sendServiceMessage("messages.apis.app.variation.create.error");
    }
  },

  getVariations: async ({ params }) => {
    try {
      // Retrieve all variations for a specific item
      const itemVariations = await ItemVariation.findAll({
        where: { item_id: params.item_id },
        include: [{ model: Item, as: "item", attributes: ["item_name"] }],
        attributes: [
          "variation_id",
          "variation_name",
          "mrp",
          "barcode",
          "discount",
          "sku",
          "item_id",
          "image",
        ],
      });

      return sendServiceData(itemVariations);
    } catch (error) {
      console.error(`${TAG} - getVariations: `, error);
      return sendServiceMessage("messages.apis.app.variation.read.error");
    }
  },

  getVariation: async ({ params }) => {
    try {
      // Retrieve a single variation by ID
      const itemVariation = await ItemVariation.findByPk(params.variation_id, {
        include: [{ model: Item, as: "item", attributes: ["item_name"] }],
        attributes: [
          "variation_id",
          "variation_name",
          "mrp",
          "barcode",
          "discount",
          "sku",
          "item_id",
          "image",
        ],
      });

      if (!itemVariation) {
        return sendServiceMessage("messages.apis.app.variation.read.not_found");
      }

      return sendServiceData(itemVariation);
    } catch (error) {
      console.error(`${TAG} - getVariation: `, error);
      return sendServiceMessage("messages.apis.app.variation.read.error");
    }
  },

  searchVariations: async ({ query }) => {
    try {
      // Search for variations by name
      const itemVariations = await ItemVariation.findAll({
        where: { variation_name: { [Op.like]: `%${query.variation_name}%` } },
        include: [{ model: Item, as: "item", attributes: ["item_name"] }],
        attributes: [
          "variation_id",
          "variation_name",
          "mrp",
          "barcode",
          "discount",
          "sku",
          "item_id",
          "image",
        ],
      });

      return sendServiceData(itemVariations);
    } catch (error) {
      console.error(`${TAG} - searchVariations: `, error);
      return sendServiceMessage("messages.apis.app.variation.search.error");
    }
  },

  updateVariation: async ({ params, body }) => {
    try {
      // Validate body
      if (!body) {
        return sendServiceMessage(
          "messages.apis.app.variation.update.invalid_body"
        );
      }

      // Find the item variation
      const itemVariation = await ItemVariation.findByPk(params.variation_id);
      if (!itemVariation) {
        return sendServiceMessage(
          "messages.apis.app.variation.update.not_found"
        );
      }

      // Validate item_id if updated
      if (body.item_id) {
        const itemExists = await Item.findByPk(body.item_id);
        if (!itemExists) {
          return sendServiceMessage(
            "messages.apis.app.variation.update.invalid_item"
          );
        }
      }

      // Ensure barcode and SKU are unique, if updated
      if (body.barcode && body.barcode !== variation.barcode) {
        const existingBarcode = await ItemVariation.findOne({
          where: { barcode: body.barcode },
        });
        if (existingBarcode) {
          return sendServiceMessage(
            "messages.apis.app.variation.update.duplicate_barcode"
          );
        }
      }

      if (body.sku && body.sku !== variation.sku) {
        const existingSKU = await ItemVariation.findOne({
          where: { sku: body.sku },
        });
        if (existingSKU) {
          return sendServiceMessage(
            "messages.apis.app.variation.update.duplicate_sku"
          );
        }
      }

      // Update the item variation
      const updatedItemVariation = await variation.update({
        item_id: body.item_id || variation.item_id,
        variation_name: body.variation_name || variation.variation_name,
        mrp: body.mrp || variation.mrp,
        stock: body.stock || variation.stock,
        barcode: body.barcode || variation.barcode,
        sku: body.sku || variation.sku,
        discount: body.discount || variation.discount,
        image: body.image || variation.image,
      });

      return sendServiceData(updatedItemVariation);
    } catch (error) {
      console.error(`${TAG} - updateVariation: `, error);
      return sendServiceMessage("messages.apis.app.variation.update.error");
    }
  },

  deleteVariation: async ({ params }) => {
    try {
      // Find the item variation
      const itemVariation = await ItemVariation.findByPk(params.variation_id);
      if (!itemVariation) {
        return sendServiceMessage(
          "messages.apis.app.variation.delete.not_found"
        );
      }

      // Delete the item variation
      await variation.destroy();

      return sendServiceMessage("messages.apis.app.variation.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteVariation: `, error);
      return sendServiceMessage("messages.apis.app.variation.delete.error");
    }
  },

  adjustStock: async ({ params, body }) => {
    try {
      const { adjustment } = body;

      if (typeof adjustment !== "number") {
        return sendServiceMessage(
          "messages.apis.app.itemVariation.adjust_stock.invalid_body"
        );
      }

      const variation = await ItemVariation.findByPk(params.variation_id);
      if (!variation) {
        return sendServiceMessage(
          "messages.apis.app.itemVariation.adjust_stock.not_found"
        );
      }

      variation.stock += adjustment;
      await variation.save();

      return sendServiceMessage(
        "messages.apis.app.itemVariation.adjust_stock.success"
      );
    } catch (error) {
      console.error(`${TAG} - adjustStock: `, error);
      return sendServiceMessage(
        "messages.apis.app.itemVariation.adjust_stock.error"
      );
    }
  },

  bulkCreateVariations: async ({ body }) => {
    try {
      const { variations } = body;

      if (!Array.isArray(variations) || variations.length === 0) {
        return sendServiceMessage(
          "messages.apis.app.itemVariation.bulk_create.invalid_body"
        );
      }

      const createdVariations = await ItemVariation.bulkCreate(variations);

      return sendServiceData(createdVariations);
    } catch (error) {
      console.error(`${TAG} - bulkCreateVariations: `, error);
      return sendServiceMessage(
        "messages.apis.app.itemVariation.bulk_create.error"
      );
    }
  },

  getStockChangeLog: async ({ params }) => {
    try {
      // todo: implement this
      // const logs = await StockChangeLog.findAll({
      //   where: { variation_id: params.variation_id },
      //   attributes: ["change_date", "adjustment", "reason", "user_id"],
      // });

      return sendServiceData(logs);
    } catch (error) {
      console.error(`${TAG} - getStockChangeLog: `, error);
      return sendServiceMessage(
        "messages.apis.app.itemVariation.stock_log.error"
      );
    }
  },
};
