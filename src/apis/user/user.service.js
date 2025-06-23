const { User, Branch, Role, Company } = require("./../../../models");
const bcrypt = require("bcrypt");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const { uploadToS3 } = require("./../../../utils/uploadToS3");

const TAG = "user.service.js";

module.exports = {
  createUser: async ({ body }) => {
    try {
      // Validate body
      if (
        !body.mobile_number ||
        !body.name ||
        !body.role_id ||
        !body.email ||
        !body.company_id
      ) {
        return sendServiceMessage("messages.apis.app.user.create.invalid_body");
      }

      // Get Role Details
      const role = await Role.findByPk(body.role_id);

      if (role.role_name !== "ADMIN") {
        return sendServiceMessage(
          "messages.apis.app.user.create.non_employee_error"
        );
      }

      // Ensure mobile_number and email are unique
      const existingUser = await User.findOne({
        where: { mobile_number: body.mobile_number },
      });
      if (existingUser) {
        return sendServiceMessage(
          "messages.apis.app.user.create.duplicate_mobile_number"
        );
      }
      if (body.email) {
        const existingEmailUser = await User.findOne({
          where: { email: body.email },
        });
        if (existingEmailUser) {
          return sendServiceMessage(
            "messages.apis.app.user.create.duplicate_email"
          );
        }
      }

      // Validate foreign keys (branch_id and role_id)

      if (body.branch_id) {
        const branchExists = await Branch.findByPk(body.branch_id);
        if (!branchExists) {
          return sendServiceMessage(
            "messages.apis.app.user.create.invalid_branch"
          );
        }
      }

      if (body.company_id) {
        const companyExists = await Company.findByPk(body.company_id);
        if (!companyExists) {
          return sendServiceMessage(
            "messages.apis.app.user.create.invalid_company"
          );
        }
      }

      const roleExists = await Role.findByPk(body.role_id);
      if (!roleExists) {
        return sendServiceMessage("messages.apis.app.user.create.invalid_role");
      }

      // Create the user
      const user = await User.create({
        mobile_number: body.mobile_number,
        name: body.name,
        email: body.email || null,
        image: body.image || null,
        branch_id: body.branch_id,
        company_id: body.company_id,
        role_id: body.role_id,
      });

      return sendServiceData(user);
    } catch (error) {
      console.error(`${TAG} - createUser: `, error);
      return sendServiceMessage("messages.apis.app.user.create.error");
    }
  },

  getUsers: async () => {
    try {
      // Retrieve all users
      const users = await User.findAll({
        include: [
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: Company, as: "company", attributes: ["company_name"] },
          { model: Role, as: "role", attributes: ["role_name"] },
        ],
        attributes: [
          "user_id",
          "name",
          "mobile_number",
          "email",
          "branch_id",
          "company_id",
          "role_id",
          "image",
        ],
      });

      return sendServiceData(users);
    } catch (error) {
      console.error(`${TAG} - getUsers: `, error);
      return sendServiceMessage("messages.apis.app.user.read.error");
    }
  },

  getUser: async ({ params }) => {
    try {
      // Retrieve a single user by ID
      const user = await User.findByPk(params.user_id, {
        include: [
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: Role, as: "role", attributes: ["role_name"] },
        ],
        attributes: [
          "user_id",
          "name",
          "mobile_number",
          "email",
          "branch_id",
          "role_id",
          "image",
        ],
      });

      if (!user) {
        return sendServiceMessage("messages.apis.app.user.read.not_found");
      }

      return sendServiceData(user);
    } catch (error) {
      console.error(`${TAG} - getUser: `, error);
      return sendServiceMessage("messages.apis.app.user.read.error");
    }
  },

  updateUser: async ({ params, body }) => {
    try {
      // Validate body
      if (!body) {
        return sendServiceMessage("messages.apis.app.user.update.invalid_body");
      }

      // Find the user
      const user = await User.findByPk(params.user_id);
      if (!user) {
        return sendServiceMessage("messages.apis.app.user.update.not_found");
      }

      // Check for duplicate mobile_number or email
      if (body.mobile_number && body.mobile_number !== user.mobile_number) {
        const existingUser = await User.findOne({
          where: { mobile_number: body.mobile_number },
        });
        if (existingUser) {
          return sendServiceMessage(
            "messages.apis.app.user.update.duplicate_mobile_number"
          );
        }
      }
      if (body.email && body.email !== user.email) {
        const existingEmailUser = await User.findOne({
          where: { email: body.email },
        });
        if (existingEmailUser) {
          return sendServiceMessage(
            "messages.apis.app.user.update.duplicate_email"
          );
        }
      }

      // Validate foreign keys (branch_id and role_id)
      if (body.branch_id) {
        const branchExists = await Branch.findByPk(body.branch_id);
        if (!branchExists) {
          return sendServiceMessage(
            "messages.apis.app.user.update.invalid_branch"
          );
        }
      }

      if (body.company_id) {
        const companyExists = await Company.findByPk(body.company_id);
        if (!companyExists) {
          return sendServiceMessage(
            "messages.apis.app.user.update.invalid_company"
          );
        }
      }

      // Update the user
      const updatedUser = await user.update({
        name: body.name || user.name,
        mobile_number: body.mobile_number || user.mobile_number,
        email: body.email || user.email,
        branch_id: body.branch_id || user.branch_id,
        company_id: body.company_id || user.company_id,
        role_id: body.role_id || user.role_id,
        image: body.image || user.image,
      });

      return sendServiceData(updatedUser);
    } catch (error) {
      console.error(`${TAG} - updateUser: `, error);
      return sendServiceMessage("messages.apis.app.user.update.error");
    }
  },

  deleteUser: async ({ params }) => {
    try {
      // Find the user
      const user = await User.findByPk(params.user_id);
      if (!user) {
        return sendServiceMessage("messages.apis.app.user.delete.not_found");
      }

      // Delete the user
      await user.destroy();

      return sendServiceMessage("messages.apis.app.user.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteUser: `, error);
      return sendServiceMessage("messages.apis.app.user.delete.error");
    }
  },

  changeUserState: async ({ params, body }) => {
    try {
      const user = await User.findByPk(params.user_id);

      if (!user) {
        return sendServiceMessage("messages.apis.app.user.state.not_found");
      }

      user.is_active = body.is_active;
      await user.save();

      return sendServiceMessage("messages.apis.app.user.state.success");
    } catch (error) {
      console.error(`${TAG} - changeUserState: `, error);
      return sendServiceMessage("messages.apis.app.user.state.error");
    }
  },

  getUserLoginHistory: async ({ params }) => {
    try {
      const userId = params.user_id;

      // todo: Implement this
      // const loginHistory = await LoginHistory.findAll({
      //   where: { user_id: userId },
      //   attributes: ["login_time", "ip_address", "device_info"],
      // });

      return sendServiceData(loginHistory);
    } catch (error) {
      console.error(`${TAG} - getUserLoginHistory: `, error);
      return sendServiceMessage("messages.apis.app.user.login_history.error");
    }
  },
  resetMPIN: async ({ params, body }) => {
    try {
      const { newMPIN } = body;

      if (!newMPIN || newMPIN.length !== 6) {
        return sendServiceMessage("messages.apis.app.user.mpin.invalid_body");
      }

      const user = await User.findByPk(params.user_id);
      if (!user) {
        return sendServiceMessage("messages.apis.app.user.mpin.not_found");
      }

      // todo: Implement this
      // user.mpin = hashMPIN(newMPIN);
      await user.save();

      return sendServiceMessage("messages.apis.app.user.mpin.success");
    } catch (error) {
      console.error(`${TAG} - resetMPIN: `, error);
      return sendServiceMessage("messages.apis.app.user.mpin.error");
    }
  },

  uploadImage: async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        return sendServiceMessage(
          "messages.apis.app.user.upload_image.no_file_error"
        );
      }
      if (!req.body.type) {
        return sendServiceMessage(
          "messages.apis.app.user.upload_image.missing_type_error"
        );
      }
      const image = await uploadToS3(
        null,
        `${req.body.type}/${Date.now()}_${req.file.originalname}`,
        req.file.buffer,
        "application/octet-stream"
      );

      return sendServiceData({
        ETag: image.ETag,
        Location: image.Location,
        key: image.Key,
      });
    } catch (err) {
      console.log(err);
      return sendServiceMessage("messages.apis.app.user.upload_image.error");
    }
  },
};
