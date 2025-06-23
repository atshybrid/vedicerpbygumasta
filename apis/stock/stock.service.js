const {
  StockRegister,
  Item,
  ItemVariation,
  Branch,
} = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "stock.service.js";

module.exports = {
  // Create a Stock Transaction
  createStock: async ({ body }) => {
    try {
      const {
        item_id,
        variation_id,
        branch_id,
        transaction_type,
        quantity,
        gst_rate,
        transaction_date,
        remarks,
      } = body;

      // Validate foreign keys
      const itemExists = await Item.findByPk(item_id);
      if (!itemExists) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.create.invalid_item"
        );
      }

      const variationExists = await ItemVariation.findByPk(variation_id);
      if (!variationExists) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.create.invalid_variation"
        );
      }

      const branchExists = await Branch.findByPk(branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.create.invalid_branch"
        );
      }

      // Calculate GST amount
      const gst_amount = (quantity * gst_rate) / 100;

      // Create a stock transaction record
      const stockTransaction = await StockRegister.create({
        item_id,
        variation_id,
        branch_id,
        transaction_type,
        quantity,
        gst_rate,
        gst_amount,
        transaction_date: transaction_date || new Date(),
        remarks: remarks || null,
      });

      return sendServiceData(stockTransaction);
    } catch (error) {
      console.error(`${TAG} - createStock: `, error);
      return sendServiceMessage("messages.apis.app.stockRegister.create.error");
    }
  },

  // Retrieve a Stock Transaction by ID
  getStock: async ({ params }) => {
    try {
      const stockTransaction = await StockRegister.findByPk(params.stock_id, {
        include: [
          { model: Item, as: "item", attributes: ["item_name"] },
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name"],
          },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
        ],
      });

      if (!stockTransaction) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.read.not_found"
        );
      }

      return sendServiceData(stockTransaction);
    } catch (error) {
      console.error(`${TAG} - getStock: `, error);
      return sendServiceMessage("messages.apis.app.stockRegister.read.error");
    }
  },

  // List All Stock Transactions
  getStocks: async () => {
    try {
      const stockTransactions = await StockRegister.findAll({
        include: [
          { model: Item, as: "item", attributes: ["item_name"] },
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name"],
          },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
        ],
      });

      return sendServiceData(stockTransactions);
    } catch (error) {
      console.error(`${TAG} - getAllStocks: `, error);
      return sendServiceMessage(
        "messages.apis.app.stockRegister.read_all.error"
      );
    }
  },

  // Update a Stock Transaction
  updateStock: async ({ params, body }) => {
    try {
      const stockTransaction = await StockRegister.findByPk(params.stock_id);

      if (!stockTransaction) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.update.not_found"
        );
      }

      const updates = {};
      if (body.quantity !== undefined) updates.quantity = body.quantity;
      if (body.remarks) updates.remarks = body.remarks;

      // Recalculate GST amount if quantity or gst_rate is updated
      if (body.quantity || body.gst_rate) {
        updates.gst_rate = body.gst_rate || stockTransaction.gst_rate;
        updates.gst_amount =
          (updates.quantity || stockTransaction.quantity) *
          (updates.gst_rate / 100);
      }

      await stockTransaction.update(updates);

      return sendServiceData(stockTransaction);
    } catch (error) {
      console.error(`${TAG} - updateStock: `, error);
      return sendServiceMessage("messages.apis.app.stockRegister.update.error");
    }
  },

  // Delete a Stock Transaction
  deleteStock: async ({ params }) => {
    try {
      const stockTransaction = await StockRegister.findByPk(params.stock_id);

      if (!stockTransaction) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.delete.not_found"
        );
      }

      await stockTransaction.destroy();

      return sendServiceMessage(
        "messages.apis.app.stockRegister.delete.success"
      );
    } catch (error) {
      console.error(`${TAG} - deleteStock: `, error);
      return sendServiceMessage("messages.apis.app.stockRegister.delete.error");
    }
  },

  // Retrieve Stock Transactions by Branch
  getStocksByBranch: async ({ params }) => {
    try {
      const { branch_id } = params;

      const stockTransactions = await StockRegister.findAll({
        where: { branch_id: branch_id },
        include: [
          { model: Item, as: "item", attributes: ["item_name"] },
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name"],
          },
        ],
      });

      return sendServiceData(stockTransactions);
    } catch (error) {
      console.error(`${TAG} - getStocksByBranch: `, error);
      return sendServiceMessage(
        "messages.apis.app.stockRegister.list.by_branch.error"
      );
    }
  },

  // Retrieve Stock Transactions by Item
  getStocksByItem: async ({ params }) => {
    try {
      const { item_id } = params;

      const stockTransactions = await StockRegister.findAll({
        where: { item_id: item_id },
        include: [
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name"],
          },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
        ],
      });

      return sendServiceData(stockTransactions);
    } catch (error) {
      console.error(`${TAG} - getStocksByItem: `, error);
      return sendServiceMessage(
        "messages.apis.app.stockRegister.list.by_item.error"
      );
    }
  },
};
