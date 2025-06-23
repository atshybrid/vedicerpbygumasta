const { getText } = require("../../../language/index");
const service = require("./bankaccount.service");
const responses = require("../../../utils/api.responses");

const TAG = "bankaccount.controller.js";

module.exports = {
  createBankAccount: async (req, res) => {
    try {
      const result = await service.createBankAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.bankaccount.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createBankAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.bankaccount.create.error ")
      );
    }
  },
  getBankAccount: async (req, res) => {
    try {
      const result = await service.getBankAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.bankaccount.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getBankAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.bankaccount.read.error ")
      );
    }
  },
  updateBankAccount: async (req, res) => {
    try {
      const result = await service.updateBankAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.bankaccount.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateBankAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.bankaccount.update.error ")
      );
    }
  },
  deleteBankAccount: async (req, res) => {
    try {
      const result = await service.deleteBankAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.bankaccount.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteBankAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.bankaccount.delete.error ")
      );
    }
  },
  listBankAccounts: async (req, res) => {
    try {
      const result = await service.getBankAccounts(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.bankaccount.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listBankAccounts: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.bankaccount.list.error ")
      );
    }
  },
  listBankAccountsByCompany: async (req, res) => {
    try {
      const result = await service.getBankAccountsByCompany(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.bankaccount.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listBankAccountsByCompany: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.bankaccount.list.error ")
      );
    }
  },
  transferFunds: async (req, res) => {
    try {
      const result = await service.transferFunds(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.bankaccount.funds.success")
      );
    } catch (error) {
      console.error(`${TAG} - transferFunds: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.bankaccount.funds.error ")
      );
    }
  },
};
