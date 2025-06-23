const { getText } = require("../../../language/index");
const service = require("./user.service");
const responses = require("../../../utils/api.responses");

const TAG = "user.controller.js";

module.exports = {
  createUser: async (req, res) => {
    try {
      const result = await service.createUser(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.user.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createUser: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.user.create.error ")
      );
    }
  },
  getUser: async (req, res) => {
    try {
      const result = await service.getUser(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.user.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getUser: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.user.read.error ")
      );
    }
  },
  updateUser: async (req, res) => {
    try {
      const result = await service.updateUser(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.user.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateUser: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.user.update.error ")
      );
    }
  },
  deleteUser: async (req, res) => {
    try {
      const result = await service.deleteUser(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.user.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteUser: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.user.delete.error ")
      );
    }
  },
  listUsers: async (req, res) => {
    try {
      const result = await service.getUsers(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.user.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listUsers: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.user.list.error ")
      );
    }
  },
  changeUserState: async (req, res) => {
    try {
      const result = await service.changeUserState(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.user.state.success")
      );
    } catch (error) {
      console.error(`${TAG} - changeUserState: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.user.state.error ")
      );
    }
  },
  getUserLoginHistory: async (req, res) => {
    try {
      const result = await service.getUserLoginHistory(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.user.history.success")
      );
    } catch (error) {
      console.error(`${TAG} - getUserLoginHistory: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.user.history.error ")
      );
    }
  },
  resetMPIN: async (req, res) => {
    try {
      const result = await service.resetMPIN(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.user.mpin.success")
      );
    } catch (error) {
      console.error(`${TAG} - resetMPIN: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.user.mpin.error ")
      );
    }
  },

  uploadImage: async (req, res) => {
    try {
      const result = await service.uploadImage(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.user.upload_image.success")
      );
    } catch (error) {
      console.error(`${TAG} - uploadImage: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.user.upload_image.error ")
      );
    }
  },
};
