const { Customer } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const { Op, sequelize } = require("sequelize");

const axios = require("axios");

const TAG = "customer.service.js";

module.exports = {
  // Create a Customer
  createCustomer: async ({ body }) => {
    try {
      const {
        customer_name,
        customer_type,
        gst_number,
        email,
        phone_number,
        address,
        credit_limit,
        credit_period,
        contact_person,
      } = body;

      // Validate required fields
      if (!customer_name || !phone_number || !customer_type) {
        return sendServiceMessage(
          "messages.apis.app.customer.create.invalid_body"
        );
      }

      // Validate uniqueness of gst_number and email
      const whereClause = {
        [Op.or]: [
          ...(phone_number ? [{ phone_number }] : []),
          ...(gst_number ? [{ gst_number }] : []),
          ...(email ? [{ email }] : []),
        ],
      };

      const existingCustomer = await Customer.findOne({
        where: whereClause,
      });
      if (existingCustomer) {
        return sendServiceMessage(
          "messages.apis.app.customer.create.duplicate"
        );
      }

      // Validate GST if B2B
      if (customer_type === "B2B" && !gst_number) {
        return sendServiceMessage(
          "messages.apis.app.customer.create.gst_error"
        );
      } else if (customer_type === "B2C" && gst_number) {
        return sendServiceMessage(
          "messages.apis.app.customer.create.gst_not_allowed"
        );
      }

      // Create a new customer record
      const customer = await Customer.create({
        customer_name,
        customer_type: customer_type || "B2C", // Default type
        gst_number: gst_number || null,
        email: email || null,
        phone_number: phone_number || null,
        address: address || null,
        credit_limit: credit_limit || 0.0,
        credit_period: credit_period || 0,
        contact_person: contact_person || null,
      });

      return sendServiceData(customer);
    } catch (error) {
      console.error(`${TAG} - createCustomer: `, error);
      return sendServiceMessage("messages.apis.app.customer.create.error");
    }
  },

  fetchGSTDetails: async ({ gstin_number }) => {
    try {
      if (!gstin_number) {
        return sendServiceMessage(
          "messages.apis.app.customer.gst.invalid_gstin"
        );
      }

      const apiUrl = process.env.GST_API_URL;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GST_BEARER_TOKEN}`,
      };

      const body = {
        id_number: gstin_number,
        filing_status_get: true,
      };

      // Make the API request
      const response = await axios.post(apiUrl, body, { headers });

      // Check if the response contains GST details
      if (response.data && response.data.success) {
        return sendServiceData(response.data.data);
      } else {
        return sendServiceMessage("messages.apis.app.customer.gst.no_data");
      }
    } catch (error) {
      console.error(`${TAG} - fetchGSTDetails: `, error);
      return sendServiceMessage("messages.apis.app.customer.gst.error");
    }
  },

  // Retrieve a Customer by ID
  getCustomer: async ({ params }) => {
    try {
      const customer = await Customer.findByPk(params.customer_id);

      if (!customer) {
        return sendServiceMessage("messages.apis.app.customer.read.not_found");
      }

      return sendServiceData(customer);
    } catch (error) {
      console.error(`${TAG} - getCustomer: `, error);
      return sendServiceMessage("messages.apis.app.customer.read.error");
    }
  },

  // List All Customers
  getCustomers: async ({ query: { phoneNo: mobile_number } }) => {
    try {
      // Build filter condition
      const filter = {};
      if (mobile_number) {
        filter.phone_number = mobile_number;
      }

      // Fetch customers based on filter
      const customers = await Customer.findAll({
        where: filter,
        attributes: [
          "customer_id",
          "customer_name",
          "customer_type",
          "gst_number",
          "email",
          "address",
          "phone_number",
          "credit_limit",
          "credit_period",
          "balance",
        ],
      });

      return sendServiceData(customers);
    } catch (error) {
      console.error(`${TAG} - getCustomers: `, error);
      return sendServiceMessage("messages.apis.app.customer.read_all.error");
    }
  },

  // Update a Customer
  updateCustomer: async ({ params, body }) => {
    try {
      const customer = await Customer.findByPk(params.customer_id);

      if (!customer) {
        return sendServiceMessage(
          "messages.apis.app.customer.update.not_found"
        );
      }

      const updates = {};
      if (body.customer_name) updates.customer_name = body.customer_name;
      if (body.customer_type) updates.customer_type = body.customer_type;
      if (body.gst_number) updates.gst_number = body.gst_number;
      if (body.email) updates.email = body.email;
      if (body.phone_number) updates.phone_number = body.phone_number;
      if (body.address) updates.address = body.address;
      if (body.credit_limit !== undefined)
        updates.credit_limit = body.credit_limit;
      if (body.credit_period !== undefined)
        updates.credit_period = body.credit_period;
      if (body.contact_person) updates.contact_person = body.contact_person;

      // Validate uniqueness of updated gst_number and email
      if (body.gst_number || body.email) {
        const duplicate = await Customer.findOne({
          where: {
            [Op.or]: [{ gst_number: body.gst_number }, { email: body.email }],
            customer_id: { [Op.ne]: params.customer_id },
          },
        });
        if (duplicate) {
          return sendServiceMessage(
            "messages.apis.app.customer.update.duplicate"
          );
        }
      }

      await customer.update(updates);

      return sendServiceData(customer);
    } catch (error) {
      console.error(`${TAG} - updateCustomer: `, error);
      return sendServiceMessage("messages.apis.app.customer.update.error");
    }
  },

  // Delete a Customer
  deleteCustomer: async ({ params }) => {
    try {
      const customer = await Customer.findByPk(params.customer_id);

      if (!customer) {
        return sendServiceMessage(
          "messages.apis.app.customer.delete.not_found"
        );
      }

      await customer.destroy();

      return sendServiceMessage("messages.apis.app.customer.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteCustomer: `, error);
      return sendServiceMessage("messages.apis.app.customer.delete.error");
    }
  },

  // Fetch Customers Without GST
  getCustomersWithoutGst: async () => {
    try {
      const customers = await Customer.findAll({
        where: { gst_number: null },
        attributes: [
          "customer_id",
          "customer_name",
          "customer_type",
          "phone_number",
          "email",
          "address",
        ],
      });

      return sendServiceData(customers);
    } catch (error) {
      console.error(`${TAG} - getCustomersWithoutGST: `, error);
      return sendServiceMessage("messages.apis.app.customer.without_gst.error");
    }
  },

  // Normalize Customer Data
  normalizeCustomerData: async () => {
    try {
      const customers = await Customer.findAll();

      const normalizedCustomers = customers.map((customer) => ({
        ...customer.dataValues,
        customer_name: customer.customer_name.trim(),
        phone_number: customer.phone_number?.replace(/\s+/g, ""),
        email: customer.email?.toLowerCase(),
      }));

      return sendServiceData(normalizedCustomers);
    } catch (error) {
      console.error(`${TAG} - normalizeCustomerData: `, error);
      return sendServiceMessage("messages.apis.app.customer.normalize.error");
    }
  },

  // Deduplicate Customers
  deduplicateCustomers: async () => {
    try {
      const duplicates = await Customer.findAll({
        attributes: [
          "customer_name",
          "email",
          "phone_number",
          [sequelize.fn("COUNT", sequelize.col("customer_id")), "count"],
        ],
        group: ["customer_name", "email", "phone_number"],
        having: sequelize.literal("count > 1"),
      });

      return sendServiceData(duplicates);
    } catch (error) {
      console.error(`${TAG} - deduplicateCustomers: `, error);
      return sendServiceMessage("messages.apis.app.customer.deduplicate.error");
    }
  },
};
