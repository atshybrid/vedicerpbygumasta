const { getText } = require("../../../language/index");
const service = require("./cashaccount.service");
const responses = require("../../../utils/api.responses");

const TAG = "cashaccount.controller.js";

module.exports = {
  createCashAccount: async (req, res) => {
    try {
      const result = await service.createCashAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.cashaccount.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createCashAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.cashaccount.create.error ")
      );
    }
  },
  getCashAccount: async (req, res) => {
    try {
      const result = await service.getCashAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.cashaccount.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getCashAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.cashaccount.read.error ")
      );
    }
  },
  updateCashAccount: async (req, res) => {
    try {
      const result = await service.updateCashAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.cashaccount.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateCashAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.cashaccount.update.error ")
      );
    }
  },
  deleteCashAccount: async (req, res) => {
    try {
      const result = await service.deleteCashAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.cashaccount.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteCashAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.cashaccount.delete.error ")
      );
    }
  },
  listCashAccounts: async (req, res) => {
    try {
      const result = await service.getCashAccounts(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.cashaccount.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listCashAccounts: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.cashaccount.list.error ")
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
        getText("messages.apis.app.cashaccount.balance_read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getCashAccountBalance: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.cashaccount.balance_read.error ")
      );
    }
  },
  updateCashAccountBalance: async (req, res) => {
    try {
      const result = await service.updateCashAccountBalance(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.cashaccount.balance_update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateCashAccountBalance: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.cashaccount.balance_update.error ")
      );
    }
  },
};
