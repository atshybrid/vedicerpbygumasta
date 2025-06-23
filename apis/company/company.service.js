const { Company } = require("./../../../models");
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
      // Validate body
      if (!body) {
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
};
