const { Item, Category, GST, UOM } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "item.service.js";

module.exports = {
  createItem: async ({ body }) => {
    try {
      // Validate body
      if (
        !body.item_name ||
        !body.category_id ||
        !body.gst_id ||
        !body.uom_id
      ) {
        return sendServiceMessage("messages.apis.app.item.create.invalid_body");
      }

      // Ensure category_id, gst_id, and uom_id exist
      const categoryExists = await Category.findByPk(body.category_id);
      if (!categoryExists) {
        return sendServiceMessage(
          "messages.apis.app.item.create.invalid_category"
        );
      }

      const gstExists = await GST.findByPk(body.gst_id);
      if (!gstExists) {
        return sendServiceMessage("messages.apis.app.item.create.invalid_gst");
      }

      const uomExists = await UOM.findByPk(body.uom_id);
      if (!uomExists) {
        return sendServiceMessage("messages.apis.app.item.create.invalid_uom");
      }

      // Create item
      const item = await Item.create({
        item_name: body.item_name,
        category_id: body.category_id,
        gst_id: body.gst_id,
        uom_id: body.uom_id,
        description: body.description || null,
      });

      return sendServiceData(item);
    } catch (error) {
      console.error(`${TAG} - createItem: `, error);
      return sendServiceMessage("messages.apis.app.item.create.error");
    }
  },

  getItems: async () => {
    try {
      // Retrieve all items with their category, GST, and UOM details
      const items = await Item.findAll({
        include: [
          { model: Category, as: "category", attributes: ["category_name"] },
          { model: GST, as: "gst", attributes: ["gst_rate"] },
          { model: UOM, as: "uom", attributes: ["uom_name"] },
        ],
        attributes: [
          "item_id",
          "item_name",
          "description",
          "category_id",
          "gst_id",
          "uom_id",
        ],
      });

      return sendServiceData(items);
    } catch (error) {
      console.error(`${TAG} - getItems: `, error);
      return sendServiceMessage("messages.apis.app.item.read.error");
    }
  },

  getItem: async ({ params }) => {
    try {
      // Retrieve a single item by ID with its related details
      const item = await Item.findByPk(params.item_id, {
        include: [
          { model: Category, as: "category", attributes: ["category_name"] },
          { model: GST, as: "gst", attributes: ["gst_rate"] },
          { model: UOM, as: "uom", attributes: ["uom_name"] },
        ],
        attributes: [
          "item_id",
          "item_name",
          "description",
          "category_id",
          "gst_id",
          "uom_id",
        ],
      });

      if (!item) {
        return sendServiceMessage("messages.apis.app.item.read.not_found");
      }

      return sendServiceData(item);
    } catch (error) {
      console.error(`${TAG} - getItem: `, error);
      return sendServiceMessage("messages.apis.app.item.read.error");
    }
  },

  updateItem: async ({ params, body }) => {
    try {
      // Validate body
      if (!body) {
        return sendServiceMessage("messages.apis.app.item.update.invalid_body");
      }

      // Find the item
      const item = await Item.findByPk(params.item_id);
      if (!item) {
        return sendServiceMessage("messages.apis.app.item.update.not_found");
      }

      // Validate foreign keys if updated
      if (body.category_id) {
        const categoryExists = await Category.findByPk(body.category_id);
        if (!categoryExists) {
          return sendServiceMessage(
            "messages.apis.app.item.update.invalid_category"
          );
        }
      }

      if (body.gst_id) {
        const gstExists = await GST.findByPk(body.gst_id);
        if (!gstExists) {
          return sendServiceMessage(
            "messages.apis.app.item.update.invalid_gst"
          );
        }
      }

      if (body.uom_id) {
        const uomExists = await UOM.findByPk(body.uom_id);
        if (!uomExists) {
          return sendServiceMessage(
            "messages.apis.app.item.update.invalid_uom"
          );
        }
      }

      // Update the item
      const updatedItem = await item.update({
        item_name: body.item_name || item.item_name,
        category_id: body.category_id || item.category_id,
        gst_id: body.gst_id || item.gst_id,
        uom_id: body.uom_id || item.uom_id,
        description: body.description || item.description,
      });

      return sendServiceData(updatedItem);
    } catch (error) {
      console.error(`${TAG} - updateItem: `, error);
      return sendServiceMessage("messages.apis.app.item.update.error");
    }
  },

  deleteItem: async ({ params }) => {
    try {
      // Find the item
      const item = await Item.findByPk(params.item_id);
      if (!item) {
        return sendServiceMessage("messages.apis.app.item.delete.not_found");
      }

      // Delete the item
      await item.destroy();

      return sendServiceMessage("messages.apis.app.item.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteItem: `, error);
      return sendServiceMessage("messages.apis.app.item.delete.error");
    }
  },

  updateItemStatus: async ({ params, body }) => {
    try {
      const { status } = body;

      if (typeof status !== "boolean") {
        return sendServiceMessage(
          "messages.apis.app.item.update_status.invalid_body"
        );
      }

      const item = await Item.findByPk(params.item_id);
      if (!item) {
        return sendServiceMessage(
          "messages.apis.app.item.update_status.not_found"
        );
      }

      item.is_active = status;
      await item.save();

      return sendServiceMessage("messages.apis.app.item.update_status.success");
    } catch (error) {
      console.error(`${TAG} - updateItemStatus: `, error);
      return sendServiceMessage("messages.apis.app.item.update_status.error");
    }
  },

  searchItems: async ({ query }) => {
    try {
      const { name, category, description } = query;

      const items = await Item.findAll({
        where: {
          ...(name && { item_name: { [Op.iLike]: `%${name}%` } }),
          ...(category && { category_id: category }),
          ...(description && {
            description: { [Op.iLike]: `%${description}%` },
          }),
        },
      });

      return sendServiceData(items);
    } catch (error) {
      console.error(`${TAG} - searchItems: `, error);
      return sendServiceMessage("messages.apis.app.item.search.error");
    }
  },

  bulkUpdateItems: async ({ body }) => {
    try {
      const { items } = body;

      if (!Array.isArray(items) || items.length === 0) {
        return sendServiceMessage(
          "messages.apis.app.item.bulk_update.invalid_body"
        );
      }

      const updatePromises = items.map(({ item_id, updates }) =>
        Item.update(updates, { where: { item_id } })
      );

      await Promise.all(updatePromises);

      return sendServiceMessage("messages.apis.app.item.bulk_update.success");
    } catch (error) {
      console.error(`${TAG} - bulkUpdateItems: `, error);
      return sendServiceMessage("messages.apis.app.item.bulk_update.error");
    }
  },
};
