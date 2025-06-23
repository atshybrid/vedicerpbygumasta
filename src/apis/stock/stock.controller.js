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

  createCompanyStock: async (req, res) => {
    try {
      const result = await service.addStockToCompanyItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.companyItem.addStock.success")
      );
    } catch (error) {
      console.error(`${TAG} - createCompanyStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.create.error ")
      );
    }
  },

  createBranchStock: async (req, res) => {
    try {
      const result = await service.addStockToBranchItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.branchItem.addStock.success")
      );
    } catch (error) {
      console.error(`${TAG} - createBranchStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.create.error ")
      );
    }
  },

  transferStock: async (req, res) => {
    try {
      const result = await service.transferStock(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.transfer.success")
      );
    } catch (error) {
      console.error(`${TAG} - transferStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.transfer.error ")
      );
    }
  },

  acknowledgeStockTransfer: async (req, res) => {
    try {
      const result = await service.acknowledgeStockTransfer(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.transfer.acknowledge.success")
      );
    } catch (error) {
      console.error(`${TAG} - acknowledgeStockTransfer: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.transfer.acknowledge.error ")
      );
    }
  },

  getStockTransfers: async (req, res) => {
    try {
      const result = await service.getStockTransfers(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.transfer.get.success")
      );
    } catch (error) {
      console.error(`${TAG} - getStockTransfers: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.transfer.get.error ")
      );
    }
  },
  getBranchStock: async (req, res) => {
    try {
      const result = await service.getBranchItems(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getBranchStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.read.error ")
      );
    }
  },

  getCompanyStock: async (req, res) => {
    try {
      const result = await service.getCompanyItems(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getCompanyStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.read.error ")
      );
    }
  },

  getBranchItemBySearch: async (req, res) => {
    try {
      const result = await service.getBranchItemBySearch(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getBranchStockItems: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.read.error ")
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

  createStockRequest: async (req, res) => {
    try {
      const result = await service.createStockRequest(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.request.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createStockRequest: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.request.create.error ")
      );
    }
  },

  getStockRequests: async (req, res) => {
    try {
      const result = await service.getStockRequests(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.stock.request.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getStockRequests: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.request.read.error ")
      );
    }
  },

  updateStockRequestStatus: async (req, res) => {
    try {
      const result = await service.updateStockRequestStatus(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result?.data,
        getText("messages.apis.app.stock.request.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateStockRequestStatus: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.stock.request.update.error ")
      );
    }
  },
};
