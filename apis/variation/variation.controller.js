const { getText } = require("../../../language/index");
const service = require("./variation.service");
const responses = require("../../../utils/api.responses");

const TAG = "variation.controller.js";

module.exports = {
  createVariation: async (req, res) => {
    try {
      const result = await service.createVariation(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.variation.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createVariation: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.variation.create.error ")
      );
    }
  },
  getVariation: async (req, res) => {
    try {
      const result = await service.getVariation(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.variation.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getVariation: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.variation.read.error ")
      );
    }
  },
  updateVariation: async (req, res) => {
    try {
      const result = await service.updateVariation(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.variation.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateVariation: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.variation.update.error ")
      );
    }
  },
  deleteVariation: async (req, res) => {
    try {
      const result = await service.deleteVariation(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.variation.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteVariation: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.variation.delete.error ")
      );
    }
  },
  listVariations: async (req, res) => {
    try {
      const result = await service.getVariations(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.variation.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listVariations: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.variation.list.error ")
      );
    }
  },
  bulkCreateVariations: async (req, res) => {
    try {
      const result = await service.bulkCreateVariations(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.variation.bulk_create.success")
      );
    } catch (error) {
      console.error(`${TAG} - bulkCreateVariations: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.variation.bulk_create.error ")
      );
    }
  },
  adjustStock: async (req, res) => {
    try {
      const result = await service.adjustStock(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.variation.adjust_stock.success")
      );
    } catch (error) {
      console.error(`${TAG} - adjustStock: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.variation.adjust_stock.error ")
      );
    }
  },
};
