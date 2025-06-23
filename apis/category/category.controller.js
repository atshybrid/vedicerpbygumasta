const { getText } = require("../../../language/index");
const service = require("./category.service");
const responses = require("../../../utils/api.responses");

const TAG = "category.controller.js";

module.exports = {
  createCategory: async (req, res) => {
    try {
      const result = await service.createCategory(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.category.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createCategory: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.category.create.error ")
      );
    }
  },
  getCategory: async (req, res) => {
    try {
      const result = await service.getCategory(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.category.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getCategory: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.category.read.error ")
      );
    }
  },
  updateCategory: async (req, res) => {
    try {
      const result = await service.updateCategory(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.category.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateCategory: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.category.update.error ")
      );
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const result = await service.deleteCategory(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.category.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteCategory: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.category.delete.error ")
      );
    }
  },
  listCategorys: async (req, res) => {
    try {
      const result = await service.getCategories(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.category.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listCategorys: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.category.list.error ")
      );
    }
  },
  getRecursiveCategories: async (req, res) => {
    try {
      const result = await service.getRecursiveCategories(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.category.recursive_read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getRecursiveCategories: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.category.recursive_read.error ")
      );
    }
  },
  getItemCountByCategory: async (req, res) => {
    try {
      const result = await service.getItemCountByCategory(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.category.item_count.success")
      );
    } catch (error) {
      console.error(`${TAG} - getItemCountByCategory: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.category.item_count.error ")
      );
    }
  },
};
