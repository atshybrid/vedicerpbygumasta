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
      const result = await service.getBranchs(req);
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
};
