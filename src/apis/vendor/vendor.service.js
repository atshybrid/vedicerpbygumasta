const { Vendor } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "vendor.service.js";

module.exports = {
  // Create a Vendor
  createVendor: async ({ body }) => {
    try {
      const {
        vendor_name,
        contact_person,
        phone_number,
        email,
        address,
        vendor_type,
      } = body;

      // Validate uniqueness of phone_number and email
      const existingVendor = await Vendor.findOne({
        where: { [Op.or]: [{ phone_number }, { email }] },
      });

      if (existingVendor) {
        return sendServiceMessage("messages.apis.app.vendor.create.duplicate");
      }

      // Create a new vendor record
      const vendor = await Vendor.create({
        vendor_name,
        contact_person: contact_person || null,
        phone_number,
        email,
        address: address || null,
        vendor_type: vendor_type || "General", // Default type
      });

      return sendServiceData(vendor);
    } catch (error) {
      console.error(`${TAG} - createVendor: `, error);
      return sendServiceMessage("messages.apis.app.vendor.create.error");
    }
  },

  // Retrieve a Vendor by ID
  getVendor: async ({ params }) => {
    try {
      const vendor = await Vendor.findByPk(params.vendor_id);

      if (!vendor) {
        return sendServiceMessage("messages.apis.app.vendor.read.not_found");
      }

      return sendServiceData(vendor);
    } catch (error) {
      console.error(`${TAG} - getVendor: `, error);
      return sendServiceMessage("messages.apis.app.vendor.read.error");
    }
  },

  // List All Vendors
  getVendors: async () => {
    try {
      const vendors = await Vendor.findAll({
        attributes: [
          "vendor_id",
          "vendor_name",
          "phone_number",
          "email",
          "vendor_type",
          "created_at",
        ],
      });

      return sendServiceData(vendors);
    } catch (error) {
      console.error(`${TAG} - getAllVendors: `, error);
      return sendServiceMessage("messages.apis.app.vendor.read_all.error");
    }
  },

  // Update a Vendor
  updateVendor: async ({ params, body }) => {
    try {
      const vendor = await Vendor.findByPk(params.vendor_id);

      if (!vendor) {
        return sendServiceMessage("messages.apis.app.vendor.update.not_found");
      }

      const updates = {};
      if (body.vendor_name) updates.vendor_name = body.vendor_name;
      if (body.contact_person) updates.contact_person = body.contact_person;
      if (body.phone_number) updates.phone_number = body.phone_number;
      if (body.email) updates.email = body.email;
      if (body.address) updates.address = body.address;
      if (body.vendor_type) updates.vendor_type = body.vendor_type;

      // Validate uniqueness of updated phone_number and email
      if (body.phone_number || body.email) {
        const duplicate = await Vendor.findOne({
          where: {
            [Op.or]: [
              { phone_number: body.phone_number },
              { email: body.email },
            ],
            vendor_id: { [Op.ne]: params.vendor_id },
          },
        });
        if (duplicate) {
          return sendServiceMessage(
            "messages.apis.app.vendor.update.duplicate"
          );
        }
      }

      await vendor.update(updates);

      return sendServiceData(vendor);
    } catch (error) {
      console.error(`${TAG} - updateVendor: `, error);
      return sendServiceMessage("messages.apis.app.vendor.update.error");
    }
  },

  // Delete a Vendor
  deleteVendor: async ({ params }) => {
    try {
      const vendor = await Vendor.findByPk(params.vendor_id);

      if (!vendor) {
        return sendServiceMessage("messages.apis.app.vendor.delete.not_found");
      }

      await vendor.destroy();

      return sendServiceMessage("messages.apis.app.vendor.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteVendor: `, error);
      return sendServiceMessage("messages.apis.app.vendor.delete.error");
    }
  },

  // Get Vendors by Type
  getVendorsByType: async ({ query }) => {
    try {
      const { vendor_type } = query;

      const vendors = await Vendor.findAll({
        where: { vendor_type: vendor_type || "General" },
        attributes: [
          "vendor_id",
          "vendor_name",
          "phone_number",
          "email",
          "address",
        ],
      });

      return sendServiceData(vendors);
    } catch (error) {
      console.error(`${TAG} - getVendorsByType: `, error);
      return sendServiceMessage("messages.apis.app.vendor.list.by_type.error");
    }
  },

  // Deduplicate Vendors
  deduplicateVendors: async () => {
    try {
      const duplicates = await Vendor.findAll({
        attributes: [
          "vendor_name",
          "contact_person",
          "phone_number",
          "email",
          [sequelize.fn("COUNT", sequelize.col("vendor_id")), "count"],
        ],
        group: ["vendor_name", "contact_person", "phone_number", "email"],
        having: sequelize.literal("count > 1"),
      });

      return sendServiceData(duplicates);
    } catch (error) {
      console.error(`${TAG} - deduplicateVendors: `, error);
      return sendServiceMessage("messages.apis.app.vendor.deduplicate.error");
    }
  },

  // Normalize Vendor Data
  normalizeVendorData: async () => {
    try {
      const vendors = await Vendor.findAll();

      const normalizedVendors = vendors.map((vendor) => ({
        ...vendor.dataValues,
        vendor_name: vendor.vendor_name.trim(),
        phone_number: vendor.phone_number.replace(/\s+/g, ""),
        email: vendor.email.toLowerCase(),
      }));

      return sendServiceData(normalizedVendors);
    } catch (error) {
      console.error(`${TAG} - normalizeVendorData: `, error);
      return sendServiceMessage("messages.apis.app.vendor.normalize.error");
    }
  },
};
