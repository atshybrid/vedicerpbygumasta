const {
  FinancialTransaction,
  Vendor,
  Customer,
  Branch,
  Company,
  BankAccount,
  User,
} = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "financialTransaction.service.js";

module.exports = {
  // Create a Financial Transaction
  createTransaction: async ({ body }) => {
    try {
      const {
        transaction_type,
        amount,
        transaction_date,
        payment_method,
        reference_number,
        vendor_id,
        customer_id,
        branch_id,
        company_id,
        bank_account_id,
        handover_id,
        description,
      } = body;

      if (!["Purchase", "Sale", "Refund"].includes(transaction_type)) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.create.invalid_type"
        );
      }

      if (amount <= 0) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.create.invalid_amount"
        );
      }

      // Validate foreign keys
      if (vendor_id && !(await Vendor.findByPk(vendor_id))) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.create.invalid_vendor"
        );
      }
      if (customer_id && !(await Customer.findByPk(customer_id))) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.create.invalid_customer"
        );
      }
      if (branch_id && !(await Branch.findByPk(branch_id))) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.create.invalid_branch"
        );
      }
      if (company_id && !(await Company.findByPk(company_id))) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.create.invalid_company"
        );
      }
      if (bank_account_id && !(await BankAccount.findByPk(bank_account_id))) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.create.invalid_bank_account"
        );
      }
      if (handover_id && !(await User.findByPk(handover_id))) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.create.invalid_handover"
        );
      }

      // Create transaction
      const transaction = await FinancialTransaction.create({
        transaction_type,
        amount,
        transaction_date: transaction_date || new Date(),
        payment_method,
        reference_number: reference_number || null,
        vendor_id: vendor_id || null,
        customer_id: customer_id || null,
        branch_id: branch_id || null,
        company_id: company_id || null,
        bank_account_id: bank_account_id || null,
        handover_id: handover_id || null,
        description: description || null,
      });

      return sendServiceData(transaction);
    } catch (error) {
      console.error(`${TAG} - createTransaction: `, error);
      return sendServiceMessage(
        "messages.apis.app.financialTransaction.create.error"
      );
    }
  },

  // Retrieve a Financial Transaction by ID
  getTransaction: async ({ params }) => {
    try {
      const transaction = await FinancialTransaction.findByPk(
        params.transactionId,
        {
          include: [
            { model: Vendor, as: "vendor", attributes: ["vendor_name"] },
            { model: Customer, as: "customer", attributes: ["customer_name"] },
            { model: Branch, as: "branch", attributes: ["branch_name"] },
            { model: Company, as: "company", attributes: ["company_name"] },
            {
              model: BankAccount,
              as: "bankAccount",
              attributes: ["bank_name", "account_number"],
            },
            { model: User, as: "handover", attributes: ["name"] },
          ],
        }
      );

      if (!transaction) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.read.not_found"
        );
      }

      return sendServiceData(transaction);
    } catch (error) {
      console.error(`${TAG} - getTransaction: `, error);
      return sendServiceMessage(
        "messages.apis.app.financialTransaction.read.error"
      );
    }
  },

  // List All Financial Transactions
  getAllTransactions: async () => {
    try {
      const transactions = await FinancialTransaction.findAll({
        include: [
          { model: Vendor, as: "vendor", attributes: ["vendor_name"] },
          { model: Customer, as: "customer", attributes: ["customer_name"] },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: Company, as: "company", attributes: ["company_name"] },
          {
            model: BankAccount,
            as: "bankAccount",
            attributes: ["bank_name", "account_number"],
          },
        ],
      });

      return sendServiceData(transactions);
    } catch (error) {
      console.error(`${TAG} - getAllTransactions: `, error);
      return sendServiceMessage(
        "messages.apis.app.financialTransaction.read_all.error"
      );
    }
  },

  // Update a Financial Transaction
  updateTransaction: async ({ params, body }) => {
    try {
      const transaction = await FinancialTransaction.findByPk(
        params.transactionId
      );

      if (!transaction) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.update.not_found"
        );
      }

      const updates = {};
      if (body.transaction_type)
        updates.transaction_type = body.transaction_type;
      if (body.amount !== undefined) updates.amount = body.amount;
      if (body.transaction_date)
        updates.transaction_date = body.transaction_date;
      if (body.payment_method) updates.payment_method = body.payment_method;
      if (body.reference_number)
        updates.reference_number = body.reference_number;
      if (body.vendor_id) updates.vendor_id = body.vendor_id;
      if (body.customer_id) updates.customer_id = body.customer_id;
      if (body.branch_id) updates.branch_id = body.branch_id;
      if (body.company_id) updates.company_id = body.company_id;
      if (body.bank_account_id) updates.bank_account_id = body.bank_account_id;
      if (body.handover_id) updates.handover_id = body.handover_id;
      if (body.description) updates.description = body.description;

      await transaction.update(updates);

      return sendServiceData(transaction);
    } catch (error) {
      console.error(`${TAG} - updateTransaction: `, error);
      return sendServiceMessage(
        "messages.apis.app.financialTransaction.update.error"
      );
    }
  },

  // Delete a Financial Transaction
  deleteTransaction: async ({ params }) => {
    try {
      const transaction = await FinancialTransaction.findByPk(
        params.transactionId
      );

      if (!transaction) {
        return sendServiceMessage(
          "messages.apis.app.financialTransaction.delete.not_found"
        );
      }

      await transaction.destroy();

      return sendServiceMessage(
        "messages.apis.app.financialTransaction.delete.success"
      );
    } catch (error) {
      console.error(`${TAG} - deleteTransaction: `, error);
      return sendServiceMessage(
        "messages.apis.app.financialTransaction.delete.error"
      );
    }
  },

  // Retrieve Transactions by Branch
  getTransactionsByBranch: async ({ params }) => {
    try {
      const transactions = await FinancialTransaction.findAll({
        where: { branch_id: params.branchId },
      });

      return sendServiceData(transactions);
    } catch (error) {
      console.error(`${TAG} - getTransactionsByBranch: `, error);
      return sendServiceMessage(
        "messages.apis.app.financialTransaction.list.by_branch.error"
      );
    }
  },

  // Retrieve Transactions by Customer
  getTransactionsByCustomer: async ({ params }) => {
    try {
      const transactions = await FinancialTransaction.findAll({
        where: { customer_id: params.customerId },
      });

      return sendServiceData(transactions);
    } catch (error) {
      console.error(`${TAG} - getTransactionsByCustomer: `, error);
      return sendServiceMessage(
        "messages.apis.app.financialTransaction.list.by_customer.error"
      );
    }
  },

  // Retrieve Transactions by Vendor
  getTransactionsByVendor: async ({ params }) => {
    try {
      const transactions = await FinancialTransaction.findAll({
        where: { vendor_id: params.vendorId },
      });

      return sendServiceData(transactions);
    } catch (error) {
      console.error(`${TAG} - getTransactionsByVendor: `, error);
      return sendServiceMessage(
        "messages.apis.app.financialTransaction.list.by_vendor.error"
      );
    }
  },
};
