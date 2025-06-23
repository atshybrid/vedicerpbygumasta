const { getText } = require("../../../language/index");
const service = require("./return.service");
const responses = require("../../../utils/api.responses");

const TAG = "return.controller.js";

module.exports = {
  createReturn: async (req, res) => {
    try {
      const result = await service.createReturn(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.return.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createReturn: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.return.create.error ")
      );
    }
  },
  getReturn: async (req, res) => {
    try {
      const result = await service.getReturn(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.return.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getReturn: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.return.read.error ")
      );
    }
  },
  updateReturn: async (req, res) => {
    try {
      const result = await service.updateReturn(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.return.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateReturn: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.return.update.error ")
      );
    }
  },
  deleteReturn: async (req, res) => {
    try {
      const result = await service.deleteReturn(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.return.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteReturn: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.return.delete.error ")
      );
    }
  },
  listReturns: async (req, res) => {
    try {
      const result = await service.getReturns(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.return.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listReturns: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.return.list.error ")
      );
    }
  },
  listReturnsPending: async (req, res) => {
    try {
      const result = await service.getPendingReturns(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.return.list.by_pending.success")
      );
    } catch (error) {
      console.error(`${TAG} - listReturnsPending: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.return.list.by_pending.error ")
      );
    }
  },
  updateReturnStatus: async (req, res) => {
    try {
      const result = await service.updateReturnStatus(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.return.status.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateReturnStatus: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.return.status.error ")
      );
    }
  },
};
