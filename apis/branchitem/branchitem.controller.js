const { getText } = require("../../../language/index");
const service = require("./branchitem.service");
const responses = require("../../../utils/api.responses");

const TAG = "branchitem.controller.js";

module.exports = {
  createBranchItem: async (req, res) => {
    try {
      const result = await service.createBranchItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branchitem.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createBranchItem: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branchitem.create.error ")
      );
    }
  },
  getBranchItem: async (req, res) => {
    try {
      const result = await service.getBranchItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branchitem.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getBranchItem: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branchitem.read.error ")
      );
    }
  },
  updateBranchItem: async (req, res) => {
    try {
      const result = await service.updateBranchItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branchitem.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateBranchItem: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branchitem.update.error ")
      );
    }
  },
  deleteBranchItem: async (req, res) => {
    try {
      const result = await service.deleteBranchItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.branchitem.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteBranchItem: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branchitem.delete.error ")
      );
    }
  },
  listBranchItems: async (req, res) => {
    try {
      const result = await service.getBranchItems(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branchitem.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listBranchItems: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branchitem.list.error ")
      );
    }
  },
  listBranchItemsByBranch: async (req, res) => {
    try {
      const result = await service.getBranchItemsByBranch(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branchitem.list.by_branch.success")
      );
    } catch (error) {
      console.error(`${TAG} - listBranchItemsByBranch: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branchitem.list.by_branch.error ")
      );
    }
  },
  listBranchItemsLowAtStock: async (req, res) => {
    try {
      const result = await service.getLowStockBranchItems(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branchitem.low_stock.success")
      );
    } catch (error) {
      console.error(`${TAG} - listBranchItemsLowAtStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branchitem.low_stock.error ")
      );
    }
  },
  updateBranchItemStock: async (req, res) => {
    try {
      const result = await service.updateBranchItemStock(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.branchitem.stock.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateBranchItemStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.branchitem.stock.update.error ")
      );
    }
  },
};
