const { getText } = require("../../../language/index");
const service = require("./employee.service");
const responses = require("../../../utils/api.responses");

const TAG = "employee.controller.js";

module.exports = {
  createEmployee: async (req, res) => {
    try {
      const result = await service.createEmployee(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createEmployee: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.create.error ")
      );
    }
  },
  getEmployee: async (req, res) => {
    try {
      const result = await service.getEmployee(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getEmployee: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.read.error ")
      );
    }
  },
  updateEmployee: async (req, res) => {
    try {
      const result = await service.updateEmployee(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateEmployee: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.update.error ")
      );
    }
  },
  deleteEmployee: async (req, res) => {
    try {
      const result = await service.deleteEmployee(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.employee.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteEmployee: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.delete.error ")
      );
    }
  },
  listEmployees: async (req, res) => {
    try {
      const result = await service.getEmployees(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listEmployees: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.list.error ")
      );
    }
  },
};
