const { getText } = require("../../../language/index");
const service = require("./uom.service");
const responses = require("../../../utils/api.responses");

const TAG = "uom.controller.js";

module.exports = {
  createUom: async (req, res) => {
    try {
      const result = await service.createUom(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.uom.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createUom: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.uom.create.error ")
      );
    }
  },
  getUom: async (req, res) => {
    try {
      const result = await service.getUom(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.uom.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getUom: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.uom.read.error ")
      );
    }
  },
  updateUom: async (req, res) => {
    try {
      const result = await service.updateUom(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.uom.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateUom: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.uom.update.error ")
      );
    }
  },
  deleteUom: async (req, res) => {
    try {
      const result = await service.deleteUom(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.uom.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteUom: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.uom.delete.error ")
      );
    }
  },
  listUoms: async (req, res) => {
    try {
      const result = await service.getUoms(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.uom.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listUoms: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.uom.list.error ")
      );
    }
  },
  getUOMUsageReport: async (req, res) => {
    try {
      const result = await service.getUOMUsageReport(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.uom.report.success")
      );
    } catch (error) {
      console.error(`${TAG} - getUOMUsageReport: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.uom.report.error ")
      );
    }
  },
  updateUOMStatus: async (req, res) => {
    try {
      const result = await service.updateUOMStatus(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.uom.update_status.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateUOMStatus: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.uom.update_status.error ")
      );
    }
  },
  bulkCreateUOMs: async (req, res) => {
    try {
      const result = await service.bulkCreateUOMs(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.uom.bulk_create.success")
      );
    } catch (error) {
      console.error(`${TAG} - bulkCreateUOMs: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.uom.bulk_create.error ")
      );
    }
  },
};
