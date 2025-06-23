const { getText } = require("../../../language/index");
const service = require("./sale.service");
const responses = require("../../../utils/api.responses");

const TAG = "sale.controller.js";

module.exports = {
  createSale: async (req, res) => {
    try {
      const result = await service.createSale(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createSale: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.create.error ")
      );
    }
  },
  getSale: async (req, res) => {
    try {
      const result = await service.getSale(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getSale: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.read.error ")
      );
    }
  },
  updateSale: async (req, res) => {
    try {
      const result = await service.updateSale(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateSale: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.update.error ")
      );
    }
  },
  deleteSale: async (req, res) => {
    try {
      const result = await service.deleteSale(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.sale.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteSale: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.delete.error ")
      );
    }
  },
  listSales: async (req, res) => {
    try {
      const result = await service.getSales(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listSales: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.list.error ")
      );
    }
  },
  listSalesByBranch: async (req, res) => {
    try {
      const result = await service.getSalesByBranch(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.list.by_branch.success")
      );
    } catch (error) {
      console.error(`${TAG} - listSalesByBranch: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.list.by_branch.error ")
      );
    }
  },
  listSalesByCustomer: async (req, res) => {
    try {
      const result = await service.getSalesByCustomer(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.list.by_customer.success")
      );
    } catch (error) {
      console.error(`${TAG} - listSalesByCustomer: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.list.by_customer.error ")
      );
    }
  },
  listSalesByPendingPayments: async (req, res) => {
    try {
      const result = await service.getPendingPayments(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.list.by_pending.success")
      );
    } catch (error) {
      console.error(`${TAG} - listSalesByPendingPayments: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.list.by_pending.error ")
      );
    }
  },
};
