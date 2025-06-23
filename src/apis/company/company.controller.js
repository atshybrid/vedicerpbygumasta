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
      const result = await service.getCompanies(req);
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

  addBankAccount: async (req, res) => {
    try {
      const result = await service.addBankAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.bank_account.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - addBankAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.bank_account.create.error")
      );
    }
  },

  updateBankAccount: async (req, res) => {
    try {
      const result = await service.updateBankAccount(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.bank_account.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updatebankAccount: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.bank_account.update.error")
      );
    }
  },

  createCompanyExpense: async (req, res) => {
    try {
      const result = await service.createCompanyExpense(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.expenses.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createCompanyExpense: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.expenses.create.error")
      );
    }
  },

  createBanner: async (req, res) => {
    try {
      const result = await service.createBanner(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.banner.create.success")
      );
    } catch (error) {
      console.error(`${TAG} - createBanner: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.banner.create.error")
      );
    }
  },

  updateBanner: async (req, res) => {
    try {
      const result = await service.updateBanner(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.banner.update.success")
      );
    } catch (error) {
      console.error(`${TAG} - updateBanner: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.banner.update.error")
      );
    }
  },
  deleteBanner: async (req, res) => {
    try {
      const result = await service.deleteBanner(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        null,
        getText("messages.apis.app.company.banner.delete.success")
      );
    } catch (error) {
      console.error(`${TAG} - deleteBanner: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.banner.delete.error")
      );
    }
  },
  listBanners: async (req, res) => {
    try {
      const result = await service.listBanners(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.banner.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listBanners: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.banner.list.error")
      );
    }
  },
  getBanner: async (req, res) => {
    try {
      const result = await service.getBanner(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.company.banner.read.success")
      );
    } catch (error) {
      console.error(`${TAG} - getBanner: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.company.banner.read.error")
      );
    }
  },
};
