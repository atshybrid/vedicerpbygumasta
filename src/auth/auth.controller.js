const service = require("./auth.service");
const responses = require("../../utils/api.responses");
const { getText } = require("../../language/index");
const { verify } = require("jsonwebtoken");

const TAG = "auth.controller.js";

module.exports = {
  getMpinStatus: async (req, res) => {
    try {
      const result = await service.getMpinStatus(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.auth.signIn.success")
      );
    } catch (error) {
      console.error(`${TAG} - getMpinStatus: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.auth.signIn.error")
      );
    }
  },
  signIn: async (req, res) => {
    try {
      const result = await service.signIn(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.auth.signIn.success")
      );
    } catch (error) {
      console.error(`${TAG} - signIn: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.auth.signIn.error")
      );
    }
  },
  generateAndSendOTP: async (req, res) => {
    try {
      const result = await service.generateAndSendOTP(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.auth.request_otp.success")
      );
    } catch (error) {
      console.error(`${TAG} - generateAndSendOTP: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.auth.request_otp.error")
      );
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const result = await service.verifyOTP(req);
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

  resendOTP: async (req, res) => {
    try {
      const result = await service.resendOTP(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.auth.resend_otp.success")
      );
    } catch (error) {
      console.error(`${TAG} - resendOTP: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.auth.resend_otp.error")
      );
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const result = await service.forgotPassword(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.auth.reset_mpin.success")
      );
    } catch (error) {
      console.error(`${TAG} - forgotPassword: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.auth.reset_mpin.error")
      );
    }
  },
};
