const { Role } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "role.service.js";

module.exports = {
  createRole: async ({ body }) => {
    try {
      // Validate body
      if (!body.role_name) {
        return sendServiceMessage("messages.apis.app.role.create.invalid_body");
      }

      body.role_name = body.role_name.toUpperCase();

      // Ensure role_name is unique
      const existingRole = await Role.findOne({
        where: { role_name: body.role_name },
      });
      if (existingRole) {
        return sendServiceMessage(
          "messages.apis.app.role.create.duplicate_role"
        );
      }

      // Create role
      const role = await Role.create({
        role_name: body.role_name,
        description: body.description || null, // Handle NULL gracefully
      });

      return sendServiceData(role);
    } catch (error) {
      console.error(`${TAG} - createRole: `, error);
      return sendServiceMessage("messages.apis.app.role.create.error");
    }
  },

  getRoles: async () => {
    try {
      // Retrieve all roles
      const roles = await Role.findAll({
        attributes: ["role_id", "role_name", "description"],
      });

      return sendServiceData(roles);
    } catch (error) {
      console.error(`${TAG} - getRoles: `, error);
      return sendServiceMessage("messages.apis.app.role.read.error");
    }
  },

  getRole: async ({ params }) => {
    try {
      // Retrieve a single role by ID
      const role = await Role.findByPk(params.role_id, {
        attributes: ["role_id", "role_name", "description"],
      });

      if (!role) {
        return sendServiceMessage("messages.apis.app.role.read.not_found");
      }

      return sendServiceData(role);
    } catch (error) {
      console.error(`${TAG} - getRole: `, error);
      return sendServiceMessage("messages.apis.app.role.read.error");
    }
  },

  updateRole: async ({ params, body }) => {
    try {
      // Validate body

      if (!body.role_name && !body.description) {
        console.log("body", body);
        return sendServiceMessage("messages.apis.app.role.update.invalid_body");
      }

      // Find the role
      const role = await Role.findByPk(params.role_id);
      if (!role) {
        return sendServiceMessage("messages.apis.app.role.update.not_found");
      }

      // Update the role
      const updatedRole = await role.update({
        role_name: body.role_name || role.role_name,
        description: body.description || role.description,
      });

      return sendServiceData(updatedRole);
    } catch (error) {
      console.error(`${TAG} - updateRole: `, error);
      return sendServiceMessage("messages.apis.app.role.update.error");
    }
  },

  deleteRole: async ({ params }) => {
    try {
      // Find the role
      const role = await Role.findByPk(params.role_id);
      if (!role) {
        return sendServiceMessage("messages.apis.app.role.delete.not_found");
      }

      // Delete the role
      await role.destroy();

      return sendServiceMessage("messages.apis.app.role.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteRole: `, error);
      return sendServiceMessage("messages.apis.app.role.delete.error");
    }
  },
  assignRoleToUser: async ({ body }) => {
    try {
      const { userId, roleId } = body;

      // Validate input
      if (!userId || !roleId) {
        return sendServiceMessage("messages.apis.app.role.assign.invalid_body");
      }

      // Validate role
      const role = await Role.findByPk(roleId);
      if (!role) {
        return sendServiceMessage("messages.apis.app.role.assign.invalid_role");
      }

      // Assign role
      const user = await User.findByPk(userId);
      if (!user) {
        return sendServiceMessage("messages.apis.app.role.assign.invalid_user");
      }

      user.role_id = roleId;
      await user.save();

      return sendServiceMessage("messages.apis.app.role.assign.success");
    } catch (error) {
      console.error(`${TAG} - assignRoleToUser: `, error);
      return sendServiceMessage("messages.apis.app.role.assign.error");
    }
  },
  addPermissionsToRole: async ({ body }) => {
    try {
      const { roleId, permissions } = body;

      // Validate input
      if (!roleId || !Array.isArray(permissions)) {
        return sendServiceMessage(
          "messages.apis.app.role.permissions.invalid_body"
        );
      }

      // Validate role
      const role = await Role.findByPk(roleId);
      if (!role) {
        return sendServiceMessage(
          "messages.apis.app.role.permissions.invalid_role"
        );
      }

      // todo: Add permissions
      // await RolePermission.bulkCreate(
      //   permissions.map((permission) => ({
      //     role_id: roleId,
      //     permission_id: permission,
      //   }))
      // );

      return sendServiceMessage("messages.apis.app.role.permissions.success");
    } catch (error) {
      console.error(`${TAG} - addPermissionsToRole: `, error);
      return sendServiceMessage("messages.apis.app.role.permissions.error");
    }
  },
};
