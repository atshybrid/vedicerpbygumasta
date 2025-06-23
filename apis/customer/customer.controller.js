const { getText } = require("../../../language/index");
const service = require("./customer.service");
const responses = require("../../../utils/api.responses");

const TAG = "customer.controller.js";

module.exports = {
  createCustomer: async (req, res) => {
    try {
      const result = await service.createCustomer(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.customer.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createCustomer: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.customer.create.error ")
      );
    }
  },
  getCustomer: async (req, res) => {
    try {
      const result = await service.getCustomer(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.customer.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getCustomer: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.customer.read.error ")
      );
    }
  },
  updateCustomer: async (req, res) => {
    try {
      const result = await service.updateCustomer(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.customer.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateCustomer: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.customer.update.error ")
      );
    }
  },
  deleteCustomer: async (req, res) => {
    try {
      const result = await service.deleteCustomer(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.customer.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteCustomer: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.customer.delete.error ")
      );
    }
  },
  listCustomers: async (req, res) => {
    try {
      const result = await service.getCustomers(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.customer.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listCustomers: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.customer.list.error ")
      );
    }
  },
  listCustomersWithoutGst: async (req, res) => {
    try {
      const result = await service.getCustomersWithoutGst(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.customer.list.without_gst.success")
      );
    } catch (error) {
      console.error(`${TAG} - listCustomers: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.customer.list.without_gst.error ")
      );
    }
  },
  deduplicateCustomers: async (req, res) => {
    try {
      const result = await service.deduplicateCustomers(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.customer.deduplicate.success")
      );
    } catch (error) {
      console.error(`${TAG} - deduplicateCustomers: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.customer.deduplicate.error ")
      );
    }
  },
  normalizeCustomerData: async (req, res) => {
    try {
      const result = await service.normalizeCustomerData(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.customer.normalize.success")
      );
    } catch (error) {
      console.error(`${TAG} - normalizeCustomerData: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.customer.normalize.error ")
      );
    }
  },
};
