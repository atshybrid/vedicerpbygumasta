const { getText } = require("../../../language/index");
const service = require("./stock.service");
const responses = require("../../../utils/api.responses");

const TAG = "stock.controller.js";

module.exports = {
  createStock: async (req, res) => {
    try {
      const result = await service.createStock(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.create.error ")
      );
    }
  },
  getStock: async (req, res) => {
    try {
      const result = await service.getStock(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.read.error ")
      );
    }
  },
  updateStock: async (req, res) => {
    try {
      const result = await service.updateStock(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.update.error ")
      );
    }
  },
  deleteStock: async (req, res) => {
    try {
      const result = await service.deleteStock(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.stock.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.delete.error ")
      );
    }
  },
  listStocks: async (req, res) => {
    try {
      const result = await service.getStocks(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listStocks: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.list.error ")
      );
    }
  },

  listStocksByBranch: async (req, res) => {
    try {
      const result = await service.getStocksByBranch(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.list.by_branch.success")
      );
    } catch (error) {
      console.error(`${TAG} - listStocksByBranch: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.list.by_branch.error ")
      );
    }
  },

  listStocksByItem: async (req, res) => {
    try {
      const result = await service.getStocksByItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.list.by_item.success")
      );
    } catch (error) {
      console.error(`${TAG} - listStocksByItem: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.list.by_item.error ")
      );
    }
  },
};
