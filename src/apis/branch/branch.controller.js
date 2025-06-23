const { getText } = require("../../../language/index");
const service = require("./branch.service");
const responses = require("../../../utils/api.responses");

const TAG = "branch.controller.js";

module.exports = {
  createBranch: async (req, res) => {
    try {
      const result = await service.createBranch(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createBranch: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.create.error ")
      );
    }
  },
  getBranch: async (req, res) => {
    try {
      const result = await service.getBranch(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getBranch: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.read.error ")
      );
    }
  },
  updateBranch: async (req, res) => {
    try {
      const result = await service.updateBranch(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateBranch: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.update.error ")
      );
    }
  },
  deleteBranch: async (req, res) => {
    try {
      const result = await service.deleteBranch(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.branch.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteBranch: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.delete.error ")
      );
    }
  },
  listBranches: async (req, res) => {
    try {
      const result = await service.getBranches(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listBranchs: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.list.error ")
      );
    }
  },
  listBranchesByManager: async (req, res) => {
    try {
      const result = await service.getBranchesByManager(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listBranchs: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.list.error ")
      );
    }
  },
  listBranchesByCompany: async (req, res) => {
    try {
      const result = await service.getBranchesByCompany(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listBranchs: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.list.error ")
      );
    }
  },

  createExpense: async (req, res) => {
    try {
      const result = await service.createExpense(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.expenses.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createExpense: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.expenses.create.error ")
      );
    }
  },

  updateExpenseStatus: async (req, res) => {
    try {
      const result = await service.updateExpenseStatus(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText(
          `messages.apis.app.branch.expenses.update_status.${
            result.data.status === "APPROVED"
              ? "success_approved"
              : "success_rejected"
          }`
        )
      );
    } catch (error) {
      console.error(`${TAG} - updateExpenseStatus: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.expenses.update_status.error ")
      );
    }
  },

  listExpenses: async (req, res) => {
    try {
      const result = await service.listExpenses(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.expenses.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listExpenses: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.expenses.list.error ")
      );
    }
  },

  getExpense: async (req, res) => {
    try {
      const result = await service.getExpense(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.expenses.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getExpense: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.expenses.read.error ")
      );
    }
  },

  addBalanceToPettyCash: async (req, res) => {
    try {
      const result = await service.addBalanceToPettyCash(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.expenses.add_balance.success")
      );
    } catch (error) {
      console.error(`${TAG} - addBalanceToPettyCash: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.pettycash.add_balance.error ")
      );
    }
  },

  getPettyCashBalance: async (req, res) => {
    try {
      const result = await service.getPettyCashBalance(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }
      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.expenses.get_balance.success")
      );
    } catch (error) {
      console.error(`${TAG} - getPettyCashBalance: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.expenses.get_balance.error ")
      );
    }
  },
  getCashAccountBalance: async (req, res) => {
    try {
      const result = await service.getCashAccountBalance(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }
      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.cash_account.get_balance.success")
      );
    } catch (error) {
      console.error(`${TAG} - getPettyCashBalance: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.cash_account.get_balance.error ")
      );
    }
  },

  getFinancialTransactions: async (req, res) => {
    try {
      const result = await service.getFinancialTransactions(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }
      return responses.successResponse(
        res,
        result,
        getText("messages.apis.app.branch.financial_transactions.success")
      );
    } catch (error) {
      console.error(`${TAG} - getFinancialTransactions: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.financial_transactions.error ")
      );
    }
  },

  createCashTransfer: async (req, res) => {
    try {
      const result = await service.createCashTransfer(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.cashTransfer.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createCashTransfer: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.cashTransfer.create_error ")
      );
    }
  },

  getCashTransfers: async (req, res) => {
    try {
      const result = await service.getCashTransfers(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.cashTransfer.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - getCashTransfers: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.cashTransfer.list.error ")
      );
    }
  },

  approveOrRejectCashTransfer: async (req, res) => {
    try {
      const result = await service.approveOrRejectCashTransfer(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.cashTransfer.update")
      );
    } catch (error) {
      console.error(`${TAG} - approveOrRejectCashTransfer: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.cashTransfer.list.error ")
      );
    }
  },

  updateInvoicePrefix: async (req, res) => {
    try {
      const result = await service.updateInvoicePrefix(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branch.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateInvoicePrefix: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branch.create.error ")
      );
    }
  },
};
