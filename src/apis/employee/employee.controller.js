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

  getBillerAnalytics: async (req, res) => {
    try {
      const result = await service.getBillerAnalytics(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.analytics.success")
      );
    } catch (error) {
      console.error(`${TAG} - getBillerAnalytics: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.analytics.error ")
      );
    }
  },

  getManagerAnalytics: async (req, res) => {
    try {
      const result = await service.getManagerAnalytics(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }
      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.analytics.success")
      );
    } catch (error) {
      console.error(`${TAG} - getBillerAnalytics: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.analytics.error ")
      );
    }
  },
  getAdminAnalytics: async (req, res) => {
    try {
      const result = await service.getAdminAnalytics(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }
      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.analytics.success")
      );
    } catch (error) {
      console.error(`${TAG} - getAdminAnalytics: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.analytics.error ")
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
  checkIn: async (req, res) => {
    try {
      const result = await service.checkIn(req);
      if (result.error) {
        return responses.badRequestResponse(
          res,
          result.message,
          result?.data || null
        );
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.checkIn.success")
      );
    } catch (error) {
      console.error(`${TAG} - checkIn: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.checkIn.error ")
      );
    }
  },
  checkOut: async (req, res) => {
    try {
      const result = await service.checkOut(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.checkOut.success")
      );
    } catch (error) {
      console.error(`${TAG} - checkOut: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.checkOut.error ")
      );
    }
  },

  checkInStatus: async (req, res) => {
    try {
      const result = await service.checkInStatus(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.checkInStatus.success")
      );
    } catch (error) {
      console.error(`${TAG} - checkInStatus: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.checkInStatus.error ")
      );
    }
  },

  markAttendance: async (req, res) => {
    try {
      const result = await service.markAttendance(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.attendance.success")
      );
    } catch (error) {
      console.error(`${TAG} - markAttendance: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.attendance.error ")
      );
    }
  },
  getAttendance: async (req, res) => {
    try {
      const result = await service.getAttendance(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.employee.attendance.get.success")
      );
    } catch (error) {
      console.error(`${TAG} - getAttendance: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.employee.attendance.get.error ")
      );
    }
  },
};
