const {
  CashAccount,
  Branch,
  User,
  // TransactionLog,
} = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "cashaccount.service.js";

module.exports = {
  // Create Cash Account (Basic)
  createCashAccount: async ({ body }) => {
    try {
      const { branch_id, last_updated_by } = body;

      // Validate branch_id and last_updated_by
      const branchExists = await Branch.findByPk(branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.create.invalid_branch"
        );
      }

      const userExists = await User.findByPk(last_updated_by);
      if (!userExists) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.create.invalid_user"
        );
      }

      // Check if cash account already exists for the branch
      const existingAccount = await CashAccount.findOne({
        where: { branch_id },
      });
      if (existingAccount) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.create.duplicate_account"
        );
      }

      // Create a new cash account
      const cashAccount = await CashAccount.create({
        branch_id,
        balance: 0.0,
        last_updated_by,
      });

      return sendServiceData(cashAccount);
    } catch (error) {
      console.error(`${TAG} - createCashAccount: `, error);
      return sendServiceMessage("messages.apis.app.cashaccount.create.error");
    }
  },

  // Retrieve a Single Cash Account by ID
  getCashAccount: async ({ params }) => {
    try {
      const cashAccount = await CashAccount.findByPk(params.account_id, {
        include: [
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: User, as: "lastUpdatedBy", attributes: ["name"] },
        ],
        attributes: [
          "cash_account_id",
          "branch_id",
          "balance",
          "last_updated_by",
        ],
      });

      if (!cashAccount) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.read.not_found"
        );
      }

      return sendServiceData(cashAccount);
    } catch (error) {
      console.error(`${TAG} - getCashAccount: `, error);
      return sendServiceMessage("messages.apis.app.cashaccount.read.error");
    }
  },

  // List All Cash Accounts
  getAllCashAccounts: async () => {
    try {
      const cashAccounts = await CashAccount.findAll({
        include: [{ model: Branch, as: "branch", attributes: ["branch_name"] }],
        attributes: ["cash_account_id", "branch_id", "balance"],
      });

      return sendServiceData(cashAccounts);
    } catch (error) {
      console.error(`${TAG} - getAllCashAccounts: `, error);
      return sendServiceMessage("messages.apis.app.cashaccount.read_all.error");
    }
  },

  // Update Cash Account
  updateCashAccount: async ({ params, body }) => {
    try {
      const cashAccount = await CashAccount.findByPk(params.account_id);
      if (!cashAccount) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.update.not_found"
        );
      }

      const updates = {};
      if (body.branch_id) {
        const branchExists = await Branch.findByPk(body.branch_id);
        if (!branchExists) {
          return sendServiceMessage(
            "messages.apis.app.cashaccount.update.invalid_branch"
          );
        }
        updates.branch_id = body.branch_id;
      }

      if (body.last_updated_by) {
        const userExists = await User.findByPk(body.last_updated_by);
        if (!userExists) {
          return sendServiceMessage(
            "messages.apis.app.cashaccount.update.invalid_user"
          );
        }
        updates.last_updated_by = body.last_updated_by;
      }

      if (body.balance !== undefined) {
        updates.balance = body.balance;
      }

      // Update the cash account
      await CashAccount.update(updates);

      return sendServiceData(cashAccount);
    } catch (error) {
      console.error(`${TAG} - updateCashAccount: `, error);
      return sendServiceMessage("messages.apis.app.cashaccount.update.error");
    }
  },

  // Delete Cash Account
  deleteCashAccount: async ({ params }) => {
    try {
      const cashAccount = await CashAccount.findByPk(params.account_id);

      if (!cashAccount) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.delete.not_found"
        );
      }

      await CashAccount.destroy();

      return sendServiceMessage("messages.apis.app.cashaccount.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteCashAccount: `, error);
      return sendServiceMessage("messages.apis.app.cashaccount.delete.error");
    }
  },

  // Retrieve Cash Account Balance for a Specific Branch
  getCashAccountBalance: async ({ params }) => {
    try {
      const { branch_id } = params;

      const cashAccount = await CashAccount.findOne({
        where: { branch_id: branch_id },
        attributes: ["cash_account_id", "balance"],
      });

      if (!cashAccount) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.balance_read.not_found"
        );
      }

      return sendServiceData(cashAccount);
    } catch (error) {
      console.error(`${TAG} - getCashAccountBalance: `, error);
      return sendServiceMessage(
        "messages.apis.app.cashaccount.balance_read.error"
      );
    }
  },

  // Update Balance After a Transaction
  updateCashAccountBalance: async ({ params, body }) => {
    try {
      const { branch_id } = params;
      const { amount, last_updated_by } = body;

      if (!amount || !last_updated_by) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.balance_update.invalid_body"
        );
      }

      const cashAccount = await CashAccount.findOne({
        where: { branch_id: branch_id },
      });

      if (!cashAccount) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.balance_update.not_found"
        );
      }

      const userExists = await User.findByPk(last_updated_by);
      if (!userExists) {
        return sendServiceMessage(
          "messages.apis.app.cashaccount.balance_update.invalid_user"
        );
      }

      const updatedBalance = cashaccount.balance + amount;
      await CashAccount.update({ balance: updatedBalance, last_updated_by });

      // todo: Implement Transaction Logs
      // await TransactionLog.create({
      //   branch_id: branchId,
      //   transaction_type: amount > 0 ? "Credit" : "Debit",
      //   amount: Math.abs(amount),
      //   closing_balance: updatedBalance,
      //   updated_by: last_updated_by,
      // });

      return sendServiceMessage(
        "messages.apis.app.cashaccount.balance_update.success"
      );
    } catch (error) {
      console.error(`${TAG} - updateCashAccountBalance: `, error);
      return sendServiceMessage(
        "messages.apis.app.cashaccount.balance_update.error"
      );
    }
  },

  // Retrieve Audit Logs for a Branch
  getCashAccountAuditLogs: async ({ params }) => {
    try {
      const { branchId } = params;

      // todo: Implement Transaction Logs
      // const logs = await TransactionLog.findAll({
      //   where: { branch_id: branchId },
      //   attributes: [
      //     "transaction_type",
      //     "amount",
      //     "closing_balance",
      //     "updated_by",
      //     "created_at",
      //   ],
      //   include: [{ model: User, as: "updatedBy", attributes: ["name"] }],
      // });

      return sendServiceData(logs);
    } catch (error) {
      console.error(`${TAG} - getCashAccountAuditLogs: `, error);
      return sendServiceMessage(
        "messages.apis.app.cashaccount.audit_log.error"
      );
    }
  },
};
