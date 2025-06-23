const { BranchItem, Branch, ItemVariation } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "branchItem.service.js";

module.exports = {
  // Create a Branch-Item Record
  createBranchItem: async ({ body }) => {
    try {
      const { branch_id, variation_id, stock, price } = body;

      // Validate branch and variation
      const branchExists = await Branch.findByPk(branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.branchitem.create.invalid_branch"
        );
      }

      const variationExists = await ItemVariation.findByPk(variation_id);
      if (!variationExists) {
        return sendServiceMessage(
          "messages.apis.app.branchitem.create.invalid_variation"
        );
      }

      // Check if record already exists
      const existingBranchItem = await BranchItem.findOne({
        where: { branch_id, variation_id },
      });
      if (existingBranchItem) {
        return sendServiceMessage(
          "messages.apis.app.branchitem.create.duplicate_entry"
        );
      }

      // Create the branch-item record
      const branchItem = await BranchItem.create({
        branch_id,
        variation_id,
        stock: stock || 0,
        price,
      });

      return sendServiceData(branchItem);
    } catch (error) {
      console.error(`${TAG} - createBranchItem: `, error);
      return sendServiceMessage("messages.apis.app.branchitem.create.error");
    }
  },

  // Retrieve a Branch-Item Record by ID
  getBranchItem: async ({ params }) => {
    try {
      const branchItem = await BranchItem.findByPk(params.item_id, {
        include: [
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name", "mrp"],
          },
        ],
        attributes: [
          "branch_item_id",
          "branch_id",
          "variation_id",
          "stock",
          "price",
        ],
      });

      if (!branchItem) {
        return sendServiceMessage(
          "messages.apis.app.branchitem.read.not_found"
        );
      }

      return sendServiceData(branchItem);
    } catch (error) {
      console.error(`${TAG} - getBranchItem: `, error);
      return sendServiceMessage("messages.apis.app.branchitem.read.error");
    }
  },

  // List All Branch-Item Records
  getBranchItems: async () => {
    try {
      const branchItems = await BranchItem.findAll({
        include: [
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name", "mrp"],
          },
        ],
        attributes: [
          "branch_item_id",
          "branch_id",
          "variation_id",
          "stock",
          "price",
        ],
      });

      return sendServiceData(branchItems);
    } catch (error) {
      console.error(`${TAG} - getAllBranchItems: `, error);
      return sendServiceMessage("messages.apis.app.branchitem.read_all.error");
    }
  },

  // Update a Branch-Item Record
  updateBranchItem: async ({ params, body }) => {
    try {
      const { item_id } = params;
      const branchItem = await BranchItem.findByPk(item_id);

      if (!branchItem) {
        return sendServiceMessage(
          "messages.apis.app.branchitem.update.not_found"
        );
      }

      const updates = {};
      if (body.branch_id) {
        const branchExists = await Branch.findByPk(body.branch_id);
        if (!branchExists) {
          return sendServiceMessage(
            "messages.apis.app.branchitem.update.invalid_branch"
          );
        }
        updates.branch_id = body.branch_id;
      }

      if (body.variation_id) {
        const variationExists = await ItemVariation.findByPk(body.variation_id);
        if (!variationExists) {
          return sendServiceMessage(
            "messages.apis.app.branchitem.update.invalid_variation"
          );
        }
        updates.variation_id = body.variation_id;
      }

      if (body.stock !== undefined) {
        updates.stock = body.stock;
      }

      if (body.price !== undefined) {
        updates.price = body.price;
      }

      await branchItem.update(updates);

      return sendServiceData(branchItem);
    } catch (error) {
      console.error(`${TAG} - updateBranchItem: `, error);
      return sendServiceMessage("messages.apis.app.branchitem.update.error");
    }
  },

  // Delete a Branch-Item Record
  deleteBranchItem: async ({ params }) => {
    try {
      const branchItem = await BranchItem.findByPk(params.item_id);

      if (!branchItem) {
        return sendServiceMessage(
          "messages.apis.app.branchitem.delete.not_found"
        );
      }

      await branchItem.destroy();

      return sendServiceMessage("messages.apis.app.branchitem.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteBranchItem: `, error);
      return sendServiceMessage("messages.apis.app.branchitem.delete.error");
    }
  },

  // Fetch Items for a Specific Branch
  getBranchItemsByBranch: async ({ params }) => {
    try {
      const { branch_id } = params;

      const branchItems = await BranchItem.findAll({
        where: { branch_id: branch_id },
        include: [
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name", "mrp"],
          },
        ],
        attributes: ["branch_item_id", "variation_id", "stock", "price"],
      });

      return sendServiceData(branchItems);
    } catch (error) {
      console.error(`${TAG} - getBranchItemsByBranch: `, error);
      return sendServiceMessage(
        "messages.apis.app.branchitem.read.by_branch.error"
      );
    }
  },

  // Monitor Low Stock Items
  getLowStockBranchItems: async ({ params, query }) => {
    try {
      const { variation_id } = params;
      const { threshold = 20 } = query; // Default threshold is 20

      const lowStockItems = await BranchItem.findAll({
        where: { variation_id: variation_id, stock: { [Op.lt]: threshold } },
        attributes: ["branch_id", "stock"],
        include: [{ model: Branch, as: "branch", attributes: ["branch_name"] }],
      });

      return sendServiceData(lowStockItems);
    } catch (error) {
      console.error(`${TAG} - getLowStockBranchItems: `, error);
      return sendServiceMessage("messages.apis.app.branchitem.low_stock.error");
    }
  },

  // Update Stock for a Branch-Item
  updateBranchItemStock: async ({ params, body }) => {
    try {
      const { branch_id, variation_id } = params;
      const { adjustment } = body;

      const branchItem = await BranchItem.findOne({
        where: { branch_id: branch_id, variation_id: variation_id },
      });

      if (!branchItem) {
        return sendServiceMessage(
          "messages.apis.app.branchitem.stock.update.not_found"
        );
      }

      branchItem.stock += adjustment;
      await branchItem.save();

      return sendServiceData(branchItem);
    } catch (error) {
      console.error(`${TAG} - updateBranchItemStock: `, error);
      return sendServiceMessage(
        "messages.apis.app.branchitem.stock.update.error"
      );
    }
  },
};
