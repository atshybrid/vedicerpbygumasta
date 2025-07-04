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
  createSaleReturn: async (req, res) => {
    try {
      const result = await service.createSaleReturn(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.return.success")
      );
    } catch (error) {
      console.error(`${TAG} - createSale: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.return.error ")
      );
    }
  },

  getSaleReturn: async (req, res) => {
    try {
      const result = await service.getSaleReturn(req);
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

  getSaleReturns: async (req, res) => {
    try {
      const result = await service.getSaleReturns(req);
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

  getCashTotal: async (req, res) => {
    try {
      const result = await service.getCashTotal(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(res, result.data);
    } catch (error) {
      console.error(`${TAG} - getCashTotal: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.cash_total.error ")
      );
    }
  },
  createHandoverRequest: async (req, res) => {
    try {
      const result = await service.createHandoverRequest(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.handover.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createHandoverRequest: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.handover.create.error ")
      );
    }
  },
  approveHandoverRequest: async (req, res) => {
    try {
      const result = await service.approveHandoverRequest(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText(
          result?.data?.status === "APPROVED"
            ? "messages.apis.app.sale.handover.approve.success"
            : "messages.apis.app.sale.handover.approve.rejected"
        )
      );
    } catch (error) {
      console.error(`${TAG} - approveHandoverRequest: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.handover.approve.error ")
      );
    }
  },
  getHandoverRequests: async (req, res) => {
    try {
      const result = await service.getHandovers(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.sale.handover.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getHanoverRequests: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.handover.read.error ")
      );
    }
  },

  getHandoverDetails: async (req, res) => {
    try {
      const result = await service.getHandover(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(res, result.data);
    } catch (error) {
      console.error(`${TAG} - getHandoverDetails: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.sale.handover.details.error ")
      );
    }
  },

  sendOtp: async (req, res) => {
    try {
      const result = await service.sendOtp(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.auth.request_otp.success")
      );
    } catch (error) {
      console.error(`${TAG} - sendOtp: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.auth.request_otp.error")
      );
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const result = await service.verifyOtp(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.auth.verify_otp.success")
      );
    } catch (error) {
      console.error(`${TAG} - verifyOtp: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.auth.verify_otp.error")
      );
    }
  },
};
