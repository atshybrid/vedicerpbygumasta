const { getText } = require("../../../language/index");
const service = require("./gst.service");
const responses = require("../../../utils/api.responses");

const TAG = "gst.controller.js";

module.exports = {
  createGst: async (req, res) => {
    try {
      const result = await service.createGst(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.gst.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createGst: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.gst.create.error ")
      );
    }
  },
  getGst: async (req, res) => {
    try {
      const result = await service.getGst(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.gst.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getGst: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.gst.read.error ")
      );
    }
  },
  updateGst: async (req, res) => {
    try {
      const result = await service.updateGst(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.gst.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateGst: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.gst.update.error ")
      );
    }
  },
  deleteGst: async (req, res) => {
    try {
      const result = await service.deleteGst(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.gst.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteGst: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.gst.delete.error ")
      );
    }
  },
  listGsts: async (req, res) => {
    try {
      const result = await service.getGsts(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.gst.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listGsts: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.gst.list.error ")
      );
    }
  },

  archiveOldGSTRates: async (req, res) => {
    try {
      const result = await service.archiveOldGSTRates(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.gst.archive.success")
      );
    } catch (error) {
      console.error(`${TAG} - archiveOldGSTRates: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.gst.archive.error ")
      );
    }
  },

  applyGSTToMultipleItems: async (req, res) => {
    try {
      const result = await service.applyGSTToMultipleItems(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.gst.bulk_apply.success")
      );
    } catch (error) {
      console.error(`${TAG} - applyGSTToMultipleItems: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.gst.bulk_apply.error ")
      );
    }
  },
};
