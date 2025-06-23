const { Sale, Customer, Branch, Employee } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "sale.service.js";

module.exports = {
  // Create a Sale
  createSale: async ({ body }) => {
    try {
      const {
        customer_id,
        branch_id,
        employee_id,
        total_amount,
        gst_amount,
        payment_status,
        sale_date,
      } = body;

      // Validate foreign keys
      const customerExists = await Customer.findByPk(customer_id);
      if (!customerExists) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invalid_customer"
        );
      }

      const branchExists = await Branch.findByPk(branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invalid_branch"
        );
      }

      const employeeExists = await Employee.findByPk(employee_id);
      if (!employeeExists) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invalid_employee"
        );
      }

      // Create a new sale record
      const sale = await Sale.create({
        customer_id,
        branch_id,
        employee_id,
        total_amount,
        gst_amount,
        payment_status: payment_status || "Due", // Default to 'Due'
        sale_date: sale_date || new Date(),
      });

      return sendServiceData(sale);
    } catch (error) {
      console.error(`${TAG} - createSale: `, error);
      return sendServiceMessage("messages.apis.app.sale.create.error");
    }
  },

  // Retrieve a Sale by ID
  getSale: async ({ params }) => {
    try {
      const sale = await Sale.findByPk(params.sale_id, {
        include: [
          { model: Customer, as: "customer", attributes: ["customer_name"] },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: Employee, as: "employee", attributes: ["name"] },
        ],
      });

      if (!sale) {
        return sendServiceMessage("messages.apis.app.sale.read.not_found");
      }

      return sendServiceData(sale);
    } catch (error) {
      console.error(`${TAG} - getSale: `, error);
      return sendServiceMessage("messages.apis.app.sale.read.error");
    }
  },

  // List All Sales
  getSales: async () => {
    try {
      const sales = await Sale.findAll({
        include: [
          { model: Customer, as: "customer", attributes: ["customer_name"] },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: Employee, as: "employee", attributes: ["name"] },
        ],
      });

      return sendServiceData(sales);
    } catch (error) {
      console.error(`${TAG} - getAllSales: `, error);
      return sendServiceMessage("messages.apis.app.sale.read_all.error");
    }
  },

  // Update a Sale
  updateSale: async ({ params, body }) => {
    try {
      const sale = await Sale.findByPk(params.sale_id);

      if (!sale) {
        return sendServiceMessage("messages.apis.app.sale.update.not_found");
      }

      const updates = {};
      if (body.customer_id) {
        const customerExists = await Customer.findByPk(body.customer_id);
        if (!customerExists) {
          return sendServiceMessage(
            "messages.apis.app.sale.update.invalid_customer"
          );
        }
        updates.customer_id = body.customer_id;
      }

      if (body.branch_id) {
        const branchExists = await Branch.findByPk(body.branch_id);
        if (!branchExists) {
          return sendServiceMessage(
            "messages.apis.app.sale.update.invalid_branch"
          );
        }
        updates.branch_id = body.branch_id;
      }

      if (body.employee_id) {
        const employeeExists = await Employee.findByPk(body.employee_id);
        if (!employeeExists) {
          return sendServiceMessage(
            "messages.apis.app.sale.update.invalid_employee"
          );
        }
        updates.employee_id = body.employee_id;
      }

      if (body.total_amount !== undefined)
        updates.total_amount = body.total_amount;
      if (body.gst_amount !== undefined) updates.gst_amount = body.gst_amount;
      if (body.payment_status) updates.payment_status = body.payment_status;
      if (body.sale_date) updates.sale_date = body.sale_date;

      await sale.update(updates);

      return sendServiceData(sale);
    } catch (error) {
      console.error(`${TAG} - updateSale: `, error);
      return sendServiceMessage("messages.apis.app.sale.update.error");
    }
  },

  // Delete a Sale
  deleteSale: async ({ params }) => {
    try {
      const sale = await Sale.findByPk(params.sale_id);

      if (!sale) {
        return sendServiceMessage("messages.apis.app.sale.delete.not_found");
      }

      await sale.destroy();

      return sendServiceMessage("messages.apis.app.sale.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteSale: `, error);
      return sendServiceMessage("messages.apis.app.sale.delete.error");
    }
  },

  // Retrieve Sales by Branch
  getSalesByBranch: async ({ params }) => {
    try {
      const { branch_id } = params;

      const sales = await Sale.findAll({
        where: { branch_id: branch_id },
        attributes: [
          "branch_id",
          [sequelize.fn("COUNT", sequelize.col("sale_id")), "total_sales"],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "total_revenue"],
        ],
        group: ["branch_id"],
      });

      return sendServiceData(sales);
    } catch (error) {
      console.error(`${TAG} - getSalesByBranch: `, error);
      return sendServiceMessage("messages.apis.app.sale.list.by_branch.error");
    }
  },

  // Retrieve Sales by Customer
  getSalesByCustomer: async ({ params }) => {
    try {
      const { customer_id } = params;

      const sales = await Sale.findAll({
        where: { customer_id: customer_id },
        attributes: [
          "customer_id",
          [sequelize.fn("COUNT", sequelize.col("sale_id")), "total_purchases"],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "total_spent"],
        ],
        group: ["customer_id"],
      });

      return sendServiceData(sales);
    } catch (error) {
      console.error(`${TAG} - getSalesByCustomer: `, error);
      return sendServiceMessage(
        "messages.apis.app.sale.list.by_customer.error"
      );
    }
  },

  // Retrieve Pending Payments
  getPendingPayments: async () => {
    try {
      const pendingSales = await Sale.findAll({
        where: { payment_status: "Due" },
      });

      return sendServiceData(pendingSales);
    } catch (error) {
      console.error(`${TAG} - getPendingPayments: `, error);
      return sendServiceMessage("messages.apis.app.sale.list.by_pending.error");
    }
  },
};
