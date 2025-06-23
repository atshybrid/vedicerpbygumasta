const { getText } = require("../../../language/index");
const service = require("./item.service");
const responses = require("../../../utils/api.responses");

const TAG = "item.controller.js";

module.exports = {
  createItem: async (req, res) => {
    try {
      const result = await service.createItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.item.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createItem: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.item.create.error ")
      );
    }
  },
  getItem: async (req, res) => {
    try {
      const result = await service.getItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.item.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getItem: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.item.read.error ")
      );
    }
  },
  updateItem: async (req, res) => {
    try {
      const result = await service.updateItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.item.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateItem: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.item.update.error ")
      );
    }
  },
  deleteItem: async (req, res) => {
    try {
      const result = await service.deleteItem(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.item.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteItem: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.item.delete.error ")
      );
    }
  },
  listItems: async (req, res) => {
    try {
      const result = await service.getItems(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.item.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listItems: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.item.list.error ")
      );
    }
  },
  searchItems: async (req, res) => {
    try {
      const result = await service.searchItems(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.item.search.success")
      );
    } catch (error) {
      console.error(`${TAG} - searchItems: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.item.search.error ")
      );
    }
  },
  updateItemStatus: async (req, res) => {
    try {
      const result = await service.updateItemStatus(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.item.update_status.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateItemStatus: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.item.update_status.error ")
      );
    }
  },
  bulkUpdateItems: async (req, res) => {
    try {
      const result = await service.bulkUpdateItems(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.item.bulk_update.success")
      );
    } catch (error) {
      console.error(`${TAG} - bulkUpdateItems: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.item.bulk_update.error ")
      );
    }
  },
};
