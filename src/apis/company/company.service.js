const {
  Company,
  BankAccount,
  Expense,
  Employee,
  Branch,
  Banner,
} = require("./../../../models");

const sequelize = require("sequelize");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "company.service.js";

module.exports = {
  createCompany: async ({ body }) => {
    try {
      // Validate body
      if (
        !body.company_name ||
        !body.address_line1 ||
        !body.city ||
        !body.country
      ) {
        return sendServiceMessage(
          "messages.apis.app.company.create.invalid_body"
        );
      }

      // Check for duplicate company name
      const existingCompanyName = await Company.findOne({
        where: { company_name: body.company_name },
      });
      if (existingCompanyName) {
        return sendServiceMessage(
          "messages.apis.app.company.create.duplicate_company_name"
        );
      }

      // Check for duplicate GST number if provided
      if (body.gst_number) {
        const existingGST = await Company.findOne({
          where: { gst_number: body.gst_number },
        });
        if (existingGST) {
          return sendServiceMessage(
            "messages.apis.app.company.create.duplicate_gst_number"
          );
        }
      }

      // Check for duplicate phone number if provided
      if (body.phone_number) {
        const existingPhoneNumber = await Company.findOne({
          where: { phone_number: body.phone_number },
        });
        if (existingPhoneNumber) {
          return sendServiceMessage(
            "messages.apis.app.company.create.duplicate_phone_number"
          );
        }
      }

      // Create company
      const company = await Company.create({
        company_name: body.company_name,
        address_line1: body.address_line1,
        address_line2: body.address_line2 || null,
        city: body.city,
        state: body.state || null,
        postal_code: body.postal_code || null,
        country: body.country,
        gst_number: body.gst_number || null,
        pan_number: body.pan_number || null,
        phone_number: body.phone_number || null,
        email: body.email || null,
        website: body.website || null,
      });

      return sendServiceData(company);
    } catch (error) {
      console.error(`${TAG} - createCompany: `, error);
      return sendServiceMessage("messages.apis.app.company.create.error");
    }
  },

  getCompanies: async () => {
    try {
      // Retrieve all companies
      const companies = await Company.findAll({
        attributes: [
          "company_id",
          "company_name",
          "address_line1",
          "address_line2",
          "city",
          "state",
          "postal_code",
          "country",
          "gst_number",
          "pan_number",
          "phone_number",
          "email",
          "website",
        ],
      });

      return sendServiceData(companies);
    } catch (error) {
      console.error(`${TAG} - getCompanies: `, error);
      return sendServiceMessage("messages.apis.app.company.read.error");
    }
  },

  getCompany: async ({ params }) => {
    try {
      // Retrieve a single company by ID
      const company = await Company.findByPk(params.company_id, {
        attributes: [
          "company_id",
          "company_name",
          "address_line1",
          "address_line2",
          "city",
          "state",
          "postal_code",
          "country",
          "gst_number",
          "pan_number",
          "phone_number",
          "email",
          "website",
        ],
      });

      if (!company) {
        return sendServiceMessage("messages.apis.app.company.read.not_found");
      }

      return sendServiceData(company);
    } catch (error) {
      console.error(`${TAG} - getCompany: `, error);
      return sendServiceMessage("messages.apis.app.company.read.error");
    }
  },

  updateCompany: async ({ params, body }) => {
    try {
      // Validate company ID
      if (!params.company_id) {
        return sendServiceMessage(
          "messages.apis.app.company.update.invalid_id"
        );
      }

      // Validate body
      if (Object.keys(body).length === 0) {
        return sendServiceMessage(
          "messages.apis.app.company.update.invalid_body"
        );
      }

      // Find the company
      const company = await Company.findByPk(params.company_id);
      if (!company) {
        return sendServiceMessage("messages.apis.app.company.update.not_found");
      }

      // Update the company
      const updatedCompany = await company.update(body);

      return sendServiceData(updatedCompany);
    } catch (error) {
      console.error(`${TAG} - updateCompany: `, error);
      return sendServiceMessage("messages.apis.app.company.update.error");
    }
  },

  deleteCompany: async ({ params }) => {
    try {
      // Validate company ID
      if (!params.company_id) {
        return sendServiceMessage(
          "messages.apis.app.company.delete.invalid_id"
        );
      }
      // Find the company
      const company = await Company.findByPk(params.company_id);
      if (!company) {
        return sendServiceMessage("messages.apis.app.company.delete.not_found");
      }

      // Delete the company
      await company.destroy();

      return sendServiceMessage("messages.apis.app.company.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteCompany: `, error);
      return sendServiceMessage("messages.apis.app.company.delete.error");
    }
  },

  addBankAccount: async ({ body }) => {
    try {
      if (
        !body.company_id ||
        !body.bank_name ||
        !body.account_number ||
        !body.account_type
      ) {
        return sendServiceMessage(
          "messages.apis.app.company.bank_account.create.invalid_body"
        );
      }

      const company = await Company.findByPk(body.company_id);
      if (!company) {
        return sendServiceMessage(
          "messages.apis.app.company.bank_account.create.invalid_company"
        );
      }

      const existingAccount = await BankAccount.findOne({
        where: { account_number: body.account_number },
      });
      if (existingAccount) {
        return sendServiceMessage(
          "messages.apis.app.company.bank_account.create.duplicate_account_number"
        );
      }

      const bankAccount = await BankAccount.create({
        company_id: body.company_id,
        bank_name: body.bank_name,
        account_number: body.account_number,
        account_type: body.account_type,
        balance: body.balance || 0.0,
      });

      return sendServiceData(bankAccount);
    } catch (error) {
      console.error(`${TAG} - addBankAccount: `, error);
      return sendServiceMessage(
        "messages.apis.app.company.bank_account.create.error"
      );
    }
  },

  updateBankAccount: async ({ params, body }) => {
    try {
      if (!params.bank_account_id) {
        return sendServiceMessage(
          "messages.apis.app.company.bank_account.update.invalid_id"
        );
      }

      if (Object.keys(body).length === 0) {
        return sendServiceMessage(
          "messages.apis.app.company.bank_account.update.invalid_body"
        );
      }

      const bankAccount = await BankAccount.findByPk(params.bank_account_id);
      if (!bankAccount) {
        return sendServiceMessage(
          "messages.apis.app.company.bank_account.update.not_found"
        );
      }

      if (
        body.account_number &&
        body.account_number !== bankAccount.account_number
      ) {
        const existingAccount = await BankAccount.findOne({
          where: { account_number: body.account_number },
        });
        if (existingAccount) {
          return sendServiceMessage(
            "messages.apis.app.company.bank_account.update.duplicate_account_number"
          );
        }
      }

      const updatedBankAccount = await bankAccount.update(body);
      return sendServiceData(updatedBankAccount);
    } catch (error) {
      console.error(`${TAG} - updateBankAccount: `, error);
      return sendServiceMessage(
        "messages.apis.app.company.bank_account.update.error"
      );
    }
  },
  createCompanyExpense: async ({ body }) => {
    try {
      const {
        company_id,
        bank_account_id,
        amount,
        expense_date,
        type,
        remarks,
        recorded_by,
      } = body;

      // Validate input
      if (
        !company_id ||
        !bank_account_id ||
        !amount ||
        !expense_date ||
        !type ||
        !recorded_by
      ) {
        return sendServiceMessage(
          "messages.apis.app.company.expenses.create.invalid_body"
        );
      }

      if (amount <= 0) {
        return sendServiceMessage(
          "messages.apis.app.company.expenses.create.invalid_amount"
        );
      }

      // Validate Company
      const company = await Company.findByPk(company_id);
      if (!company) {
        return sendServiceMessage(
          "messages.apis.app.company.expenses.create.invalid_company"
        );
      }

      // Validate Employee (who is recording the expense)
      const employee = await Employee.findByPk(recorded_by);
      if (!employee) {
        return sendServiceMessage(
          "messages.apis.app.company.expenses.create.invalid_employee"
        );
      }

      // Validate Bank Account
      const bankAccount = await BankAccount.findOne({
        where: { bank_account_id, company_id },
      });

      if (!bankAccount || bankAccount.balance < amount) {
        return sendServiceMessage(
          "messages.apis.app.company.expenses.create.insufficient_funds"
        );
      }

      // Fetch total pending expenses for the company
      const pendingExpenses = await Expense.findAll({
        where: { company_id, status: "PENDING" },
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "total_pending"],
        ],
        raw: true,
      });

      const totalPending = parseFloat(pendingExpenses[0]?.total_pending) || 0;
      const availableBalance = parseFloat(bankAccount.balance);

      // Check if new expense exceeds available balance
      if (totalPending + parseFloat(amount) > availableBalance) {
        return sendServiceMessage(
          "messages.apis.app.company.expenses.create.insufficient_funds"
        );
      }

      // Create Expense Record
      const expense = await Expense.create({
        company_id,
        bank_account_id,
        amount,
        type,
        remarks: remarks || null,
        status: "PENDING",
        recorded_by,
        expense_date,
      });

      return sendServiceData(expense);
    } catch (error) {
      console.error(`${TAG} - createCompanyExpense: `, error);
      return sendServiceMessage(
        "messages.apis.app.company.expenses.create.error"
      );
    }
  },
  createBanner: async ({ body }) => {
    const { company_id, branch_id, banner_url, active = true } = body;

    if (!banner_url || (!company_id && !branch_id)) {
      return sendServiceMessage(
        "messages.apis.app.company.banner.create.invalid_body"
      );
    }

    const banner = await Banner.create({
      company_id,
      branch_id,
      banner_url,
      active,
    });
    return sendServiceData(banner);
  },
  updateBanner: async ({ params, body }) => {
    const { banner_id } = params;
    const { company_id, branch_id, banner_url, active } = body;

    const banner = await Banner.findByPk(banner_id);

    if (!banner) {
      return sendServiceMessage(
        "messages.apis.app.company.banner.update.not_found"
      );
    }

    if (!banner_id || (!company_id && !branch_id)) {
      return sendServiceMessage(
        "messages.apis.app.company.banner.create.invalid_body"
      );
    }

    await banner.update(body);
    return sendServiceData(banner);
  },
  deleteBanner: async ({ params }) => {
    const { banner_id } = params;
    const banner = await Banner.findByPk(banner_id);

    if (!banner) {
      return sendServiceMessage(
        "messages.apis.app.company.banner.delete.not_found"
      );
    }

    await banner.destroy();
    return banner;
  },
  getBanner: async ({ params }) => {
    const { banner_id } = params;
    const banner = await Banner.findByPk(banner_id);

    if (!banner) {
      return sendServiceMessage(
        "messages.apis.app.company.banner.get.not_found"
      );
    }

    return sendServiceData(banner);
  },

  listBanners: async ({ query }) => {
    const { company_id, branch_id, active } = query;

    let where = {};

    if (branch_id) {
      const branch = await Branch.findByPk(branch_id);

      if (branch) {
        where = {
          [sequelize.Op.or]: [
            { company_id: branch.company_id },
            { branch_id: branch_id },
          ],
        };
      }
    } else if (company_id) {
      where.company_id = company_id;
    }

    if (active !== undefined) {
      where = {
        ...where,
        active,
      };
    }

    const banners = await Banner.findAll({ where });
    return sendServiceData(banners);
  },
};
