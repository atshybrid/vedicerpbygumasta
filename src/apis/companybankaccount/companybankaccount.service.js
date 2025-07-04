const { BankAccount, Company } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "companybankaccount.service.js";

module.exports = {
  getBankAccountsByCompanyId: async ({ query }) => {
    try {
      const companyId = query.company_id;
      if (!companyId) {
        return sendServiceMessage(
          "messages.apis.app.companybankaccount.read.invalid_company"
        );
      }
      const bankAccountsByCompany = await BankAccount.findAll({
        where: { company_id: companyId },
      });
      return sendServiceData(bankAccountsByCompany);
    } catch (error) {
      console.error(`${TAG} - getBankAccountsByCompany: `, error);
      return sendServiceMessage(
        "messages.apis.app.companybankaccount.read.error"
      );
    }
  },
};
