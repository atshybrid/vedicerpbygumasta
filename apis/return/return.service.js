const { Return, Sale, Branch, Customer } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "return.service.js";

module.exports = {
  // Create a Return
  createReturn: async ({ body }) => {
    try {
      const {
        sale_id,
        branch_id,
        customer_id,
        return_date,
        total_return_amount,
        return_status,
        reason_for_return,
      } = body;

      // Validate foreign keys
      const saleExists = await Sale.findByPk(sale_id);
      if (!saleExists) {
        return sendServiceMessage(
          "messages.apis.app.return.create.invalid_sale"
        );
      }

      const branchExists = await Branch.findByPk(branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.return.create.invalid_branch"
        );
      }

      const customerExists = await Customer.findByPk(customer_id);
      if (!customerExists) {
        return sendServiceMessage(
          "messages.apis.app.return.create.invalid_customer"
        );
      }

      // Create a new return record
      const returnRecord = await Return.create({
        sale_id,
        branch_id,
        customer_id,
        return_date: return_date || new Date(),
        total_return_amount,
        return_status: return_status || "Pending", // Default to Pending
        reason_for_return: reason_for_return || null,
      });

      return sendServiceData(returnRecord);
    } catch (error) {
      console.error(`${TAG} - createReturn: `, error);
      return sendServiceMessage("messages.apis.app.return.create.error");
    }
  },

  // Retrieve a Return by ID
  getReturn: async ({ params }) => {
    try {
      const returnRecord = await Return.findByPk(params.return_id, {
        include: [
          {
            model: Sale,
            as: "sale",
            attributes: ["total_amount", "gst_amount"],
          },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: Customer, as: "customer", attributes: ["customer_name"] },
        ],
      });

      if (!returnRecord) {
        return sendServiceMessage("messages.apis.app.return.read.not_found");
      }

      return sendServiceData(returnRecord);
    } catch (error) {
      console.error(`${TAG} - getReturn: `, error);
      return sendServiceMessage("messages.apis.app.return.read.error");
    }
  },

  // List All Returns
  getAllReturns: async () => {
    try {
      const returns = await Return.findAll({
        include: [
          {
            model: Sale,
            as: "sale",
            attributes: ["total_amount", "gst_amount"],
          },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: Customer, as: "customer", attributes: ["customer_name"] },
        ],
      });

      return sendServiceData(returns);
    } catch (error) {
      console.error(`${TAG} - getAllReturns: `, error);
      return sendServiceMessage("messages.apis.app.return.read_all.error");
    }
  },

  // Update a Return
  updateReturn: async ({ params, body }) => {
    try {
      const returnRecord = await Return.findByPk(params.return_id);

      if (!returnRecord) {
        return sendServiceMessage("messages.apis.app.return.update.not_found");
      }

      const updates = {};
      if (body.return_status) updates.return_status = body.return_status;
      if (body.manager_approval_date)
        updates.manager_approval_date = body.manager_approval_date;
      if (body.reason_for_return)
        updates.reason_for_return = body.reason_for_return;
      if (body.total_return_amount !== undefined)
        updates.total_return_amount = body.total_return_amount;

      await returnRecord.update(updates);

      return sendServiceData(returnRecord);
    } catch (error) {
      console.error(`${TAG} - updateReturn: `, error);
      return sendServiceMessage("messages.apis.app.return.update.error");
    }
  },

  // Delete a Return
  deleteReturn: async ({ params }) => {
    try {
      const returnRecord = await Return.findByPk(params.return_id);

      if (!returnRecord) {
        return sendServiceMessage("messages.apis.app.return.delete.not_found");
      }

      await returnRecord.destroy();

      return sendServiceMessage("messages.apis.app.return.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteReturn: `, error);
      return sendServiceMessage("messages.apis.app.return.delete.error");
    }
  },

  // Retrieve Pending Returns
  getPendingReturns: async () => {
    try {
      const pendingReturns = await Return.findAll({
        where: { return_status: "Pending" },
      });

      return sendServiceData(pendingReturns);
    } catch (error) {
      console.error(`${TAG} - getPendingReturns: `, error);
      return sendServiceMessage(
        "messages.apis.app.return.list.by_pending.error"
      );
    }
  },

  // Update Return Status
  updateReturnStatus: async ({ params, body }) => {
    try {
      const returnRecord = await Return.findByPk(params.return_id);

      if (!returnRecord) {
        return sendServiceMessage("messages.apis.app.return.status.not_found");
      }

      const { return_status, manager_approval_date } = body;
      await returnRecord.update({
        return_status,
        manager_approval_date: manager_approval_date || new Date(),
      });

      return sendServiceData(returnRecord);
    } catch (error) {
      console.error(`${TAG} - updateReturnStatus: `, error);
      return sendServiceMessage("messages.apis.app.return.status.error");
    }
  },
};
