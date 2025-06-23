const { getText } = require("../../../language/index");
const service = require("./vendor.service");
const responses = require("../../../utils/api.responses");

const TAG = "vendor.controller.js";

module.exports = {
  createVendor: async (req, res) => {
    try {
      const result = await service.createVendor(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.vendor.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createVendor: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.vendor.create.error ")
      );
    }
  },
  getVendor: async (req, res) => {
    try {
      const result = await service.getVendor(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.vendor.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getVendor: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.vendor.read.error ")
      );
    }
  },
  updateVendor: async (req, res) => {
    try {
      const result = await service.updateVendor(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.vendor.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateVendor: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.vendor.update.error ")
      );
    }
  },
  deleteVendor: async (req, res) => {
    try {
      const result = await service.deleteVendor(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.vendor.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteVendor: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.vendor.delete.error ")
      );
    }
  },
  listVendors: async (req, res) => {
    try {
      const result = await service.getVendors(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.vendor.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listVendors: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.vendor.list.error ")
      );
    }
  },
  listVendorsByType: async (req, res) => {
    try {
      const result = await service.getVendorsByType(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.vendor.list.by_type.success")
      );
    } catch (error) {
      console.error(`${TAG} - listVendorsByType: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.vendor.list.by_type.error ")
      );
    }
  },
  deduplicateVendors: async (req, res) => {
    try {
      const result = await service.deduplicateVendors(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.vendor.deduplicate.success")
      );
    } catch (error) {
      console.error(`${TAG} - deduplicateVendors: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.vendor.deduplicate.error ")
      );
    }
  },
  normalizeVendorData: async (req, res) => {
    try {
      const result = await service.normalizeVendorData(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.vendor.normalize.success")
      );
    } catch (error) {
      console.error(`${TAG} - normalizeVendorData: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.vendor.normalize.error ")
      );
    }
  },
};
