const { getText } = require("../../../language/index");
const service = require("./company.service");
const responses = require("../../../utils/api.responses");

const TAG = "company.controller.js";

module.exports = {
  createCompany: async (req, res) => {
    try {
      const result = await service.createCompany(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createCompany: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.create.error ")
      );
    }
  },
  getCompany: async (req, res) => {
    try {
      const result = await service.getCompany(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getCompany: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.read.error ")
      );
    }
  },
  updateCompany: async (req, res) => {
    try {
      const result = await service.updateCompany(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateCompany: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.update.error ")
      );
    }
  },
  deleteCompany: async (req, res) => {
    try {
      const result = await service.deleteCompany(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.company.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteCompany: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.delete.error ")
      );
    }
  },
  listCompanys: async (req, res) => {
    try {
      const result = await service.getCompanys(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listCompanys: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.list.error ")
      );
    }
  },
};
