const { getText } = require("../../../language/index");
const service = require("./transaction.service");
const responses = require("../../../utils/api.responses");

const TAG = "transaction.controller.js";

module.exports = {
  createTransaction: async (req, res) => {
    try {
      const result = await service.createTransaction(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.transaction.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createTransaction: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.transaction.create.error ")
      );
    }
  },
  getTransaction: async (req, res) => {
    try {
      const result = await service.getTransaction(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.transaction.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getTransaction: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.transaction.read.error ")
      );
    }
  },
  updateTransaction: async (req, res) => {
    try {
      const result = await service.updateTransaction(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.transaction.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateTransaction: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.transaction.update.error ")
      );
    }
  },
  deleteTransaction: async (req, res) => {
    try {
      const result = await service.deleteTransaction(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.transaction.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteTransaction: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.transaction.delete.error ")
      );
    }
  },
  listTransactions: async (req, res) => {
    try {
      const result = await service.getTransactions(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.transaction.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listTransactions: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.transaction.list.error ")
      );
    }
  },
  listTransactionsByBranch: async (req, res) => {
    try {
      const result = await service.getTransactionsByBranch(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.transaction.list.by_branch.success")
      );
    } catch (error) {
      console.error(`${TAG} - listTransactionsByBranch: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.transaction.list.by_branch.error ")
      );
    }
  },
  listTransactionsByCustomer: async (req, res) => {
    try {
      const result = await service.getTransactionsByCustomer(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.transaction.list.by_customer.success")
      );
    } catch (error) {
      console.error(`${TAG} - listTransactionsByCustomer: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.transaction.list.by_customer.error ")
      );
    }
  },
  listTransactionsByVendor: async (req, res) => {
    try {
      const result = await service.getTransactionsByVendor(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.transaction.list.by_vendor.success")
      );
    } catch (error) {
      console.error(`${TAG} - listTransactionsByVendor: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.transaction.list.by_vendor.error ")
      );
    }
  },
};
