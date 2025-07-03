const { getText } = require("../../../language/index");
const service = require("./companybankaccount.service");
const responses = require("../../../utils/api.responses");

const TAG = "companybankaccount.controller.js";

module.exports = {
  listBankAccountsByCompanyId: async (req, res) => {
    try {
      const result = await service.getBankAccountsByCompanyId(req);
      if (result.error) {
        return responses.badRequestResponse(res, result.message);
      }

      return responses.successResponse(
        res,
        result.data,
        getText("messages.apis.app.companybankaccount.list.success")
      );
    } catch (error) {
      console.error(`${TAG} - listCompanyBankAccountsByCompany: `, error);
      return responses.internalFailureResponse(
        res,
        getText("messages.apis.app.companybankaccount.list.error ")
      );
    }
  },
};
