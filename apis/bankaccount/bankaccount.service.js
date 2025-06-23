const { BankAccount, Company } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "bankaccount.service.js";

const logBankAccountAction = async ({ accountId, action }) => {
  try {
    // todo: Log the action
    // await BankAccountLog.create({
    //   account_id: accountId,
    //   action: action,
    //   timestamp: new Date(),
    // });

    return sendServiceMessage("messages.apis.app.bankaccount.log.success");
  } catch (error) {
    console.error(`${TAG} - logBankAccountAction: `, error);
    return sendServiceMessage("messages.apis.app.bankaccount.log.error");
  }
};

module.exports = {
  createBankAccount: async ({ userId, body }) => {
    try {
      // Validate body
      if (
        !body.company_id ||
        !body.bank_name ||
        !body.account_number ||
        !body.account_type
      ) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.create.invalid_body"
        );
      }

      // Ensure company_id exists
      const companyExists = await Company.findByPk(body.company_id);
      if (!companyExists) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.create.invalid_company"
        );
      }

      // Create bank account
      const bankAccount = await BankAccount.create({
        company_id: body.company_id,
        bank_name: body.bank_name,
        account_number: body.account_number,
        account_type: body.account_type,
        balance: body.balance || 0.0, // Default balance to 0.00 if not provided
      });

      return sendServiceData(bankAccount);
    } catch (error) {
      console.error(`${TAG} - createBankAccount: `, error);
      return sendServiceMessage("messages.apis.app.bankaccount.create.error");
    }
  },

  getBankAccounts: async () => {
    try {
      // Retrieve all bank accounts
      const bankAccounts = await BankAccount.findAll({
        include: [
          {
            model: Company,
            as: "company",
            attributes: ["company_name"],
          },
        ],
        attributes: [
          "bank_account_id",
          "bank_name",
          "account_number",
          "account_type",
          "balance",
          "company_id",
        ],
      });

      return sendServiceData(bankAccounts);
    } catch (error) {
      console.error(`${TAG} - getBankAccounts: `, error);
      return sendServiceMessage("messages.apis.app.bankaccount.read.error");
    }
  },

  getBankAccount: async ({ params }) => {
    try {
      // Retrieve a single bank account by ID
      const bankAccount = await BankAccount.findByPk(params.bank_id, {
        include: [
          {
            model: Company,
            as: "company",
            attributes: ["company_name"],
          },
        ],
        attributes: [
          "bank_account_id",
          "bank_name",
          "account_number",
          "account_type",
          "balance",
          "company_id",
        ],
      });

      if (!bankAccount) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.read.not_found"
        );
      }

      return sendServiceData(bankAccount);
    } catch (error) {
      console.error(`${TAG} - getBankAccount: `, error);
      return sendServiceMessage("messages.apis.app.bankaccount.read.error");
    }
  },

  updateBankAccount: async ({ params, body }) => {
    try {
      // Validate body
      if (!body) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.update.invalid_body"
        );
      }

      // Find the bank account
      const bankAccount = await BankAccount.findByPk(params.bank_id);
      if (!bankAccount) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.update.not_found"
        );
      }

      // Update the bank account
      const updatedBankAccount = await bankAccount.update(body);

      return sendServiceData(updatedBankAccount);
    } catch (error) {
      console.error(`${TAG} - updateBankAccount: `, error);
      return sendServiceMessage("messages.apis.app.bankaccount.update.error");
    }
  },

  deleteBankAccount: async ({ params }) => {
    try {
      // Find the bank account
      const bankAccount = await BankAccount.findByPk(params.bank_id);
      if (!bankAccount) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.delete.not_found"
        );
      }

      // Delete the bank account
      await bankAccount.destroy();

      return sendServiceMessage("messages.apis.app.bankaccount.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteBankAccount: `, error);
      return sendServiceMessage("messages.apis.app.bankaccount.delete.error");
    }
  },

  getBankAccountsByCompany: async ({ params }) => {
    try {
      // Validate company ID
      const companyId = params.company_id;
      if (!companyId) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.read.invalid_company"
        );
      }

      // Retrieve all bank accounts for the company
      const bankAccounts = await BankAccount.findAll({
        where: { company_id: companyId },
        attributes: [
          "bank_account_id",
          "bank_name",
          "account_number",
          "account_type",
          "balance",
        ],
      });

      return sendServiceData(bankAccounts);
    } catch (error) {
      console.error(`${TAG} - getBankAccountsByCompany: `, error);
      return sendServiceMessage("messages.apis.app.bankaccount.read.error");
    }
  },

  transferFunds: async ({ body }) => {
    try {
      const { fromAccountId, toAccountId, amount } = body;

      // Validate input
      if (!fromAccountId || !toAccountId || amount <= 0) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.transfer.invalid_body"
        );
      }

      // Find source and destination accounts
      const fromAccount = await BankAccount.findByPk(fromAccountId);
      const toAccount = await BankAccount.findByPk(toAccountId);

      if (!fromAccount || !toAccount) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.transfer.invalid_account"
        );
      }

      // Check balance
      if (fromAccount.balance < amount) {
        return sendServiceMessage(
          "messages.apis.app.bankaccount.transfer.insufficient_funds"
        );
      }

      // Perform transfer
      fromAccount.balance -= amount;
      toAccount.balance += amount;
      await fromAccount.save();
      await toAccount.save();

      // Log the action
      await logBankAccountAction({
        accountId: fromAccountId,
        action: `Transferred ${amount} to Account ID: ${toAccountId}`,
      });

      return sendServiceMessage(
        "messages.apis.app.bankaccount.transfer.success"
      );
    } catch (error) {
      console.error(`${TAG} - transferFunds: `, error);
      return sendServiceMessage("messages.apis.app.bankaccount.transfer.error");
    }
  },
};
