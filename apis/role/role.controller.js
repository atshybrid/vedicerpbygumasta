const { getText } = require("../../../language/index");
const service = require("./role.service");
const responses = require("../../../utils/api.responses");

const TAG = "role.controller.js";

module.exports = {
  createRole: async (req, res) => {
    try {
      const result = await service.createRole(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.role.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createRole: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.role.create.error ")
      );
    }
  },
  getRole: async (req, res) => {
    try {
      const result = await service.getRole(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.role.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getRole: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.role.read.error ")
      );
    }
  },
  updateRole: async (req, res) => {
    try {
      const result = await service.updateRole(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.role.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateRole: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.role.update.error ")
      );
    }
  },
  deleteRole: async (req, res) => {
    try {
      const result = await service.deleteRole(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.role.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteRole: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.role.delete.error ")
      );
    }
  },
  listRoles: async (req, res) => {
    try {
      const result = await service.getRoles(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.role.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listRoles: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.role.list.error ")
      );
    }
  },
  assignRoleToUser: async (req, res) => {
    try {
      const result = await service.assignRoleToUser(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.role.assign.success")
      );
    } catch (error) {
      console.error(`${TAG} - assignRoleToUser: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.role.assign.error ")
      );
    }
  },
  addPermissionsToRole: async (req, res) => {
    try {
      const result = await service.addPermissionsToRole(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.role.permission.success")
      );
    } catch (error) {
      console.error(`${TAG} - addPermissionsToRole: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.role.permission.error ")
      );
    }
  },
};
