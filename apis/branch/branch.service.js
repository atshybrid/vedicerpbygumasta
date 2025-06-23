const { Branch, Employee, Company } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "branch.service.js";

module.exports = {
  createBranch: async ({ body }) => {
    try {
      // Validate body
      if (!body.branch_name || !body.location) {
        return sendServiceMessage(
          "messages.apis.app.branch.create.invalid_body"
        );
      }

      // Validate foreign keys
      if (body.manager_id) {
        const managerExists = await Employee.findByPk(body.manager_id);
        if (!managerExists) {
          return sendServiceMessage(
            "messages.apis.app.branch.create.invalid_manager"
          );
        }
      }

      if (body.company_id) {
        const companyExists = await Company.findByPk(body.company_id);
        if (!companyExists) {
          return sendServiceMessage(
            "messages.apis.app.branch.create.invalid_company"
          );
        }
      }

      // Create branch
      const branch = await Branch.create({
        branch_name: body.branch_name,
        location: body.location,
        manager_id: body.manager_id || null,
        company_id: body.company_id || null,
      });

      return sendServiceData(branch);
    } catch (error) {
      console.error(`${TAG} - createBranch: `, error);
      return sendServiceMessage("messages.apis.app.branch.create.error");
    }
  },

  getBranches: async () => {
    try {
      // Retrieve all branches with related manager and company details
      const branches = await Branch.findAll({
        include: [
          { model: Employee, as: "manager", attributes: ["name"] },
          { model: Company, as: "company", attributes: ["company_name"] },
        ],
        attributes: [
          "branch_id",
          "branch_name",
          "location",
          "manager_id",
          "company_id",
        ],
      });

      return sendServiceData(branches);
    } catch (error) {
      console.error(`${TAG} - getBranches: `, error);
      return sendServiceMessage("messages.apis.app.branch.read.error");
    }
  },

  getBranch: async ({ params }) => {
    try {
      // Retrieve a single branch by ID
      const branch = await Branch.findByPk(params.branch_id, {
        include: [
          { model: Employee, as: "manager", attributes: ["name"] },
          { model: Company, as: "company", attributes: ["company_name"] },
        ],
        attributes: [
          "branch_id",
          "branch_name",
          "location",
          "manager_id",
          "company_id",
        ],
      });

      if (!branch) {
        return sendServiceMessage("messages.apis.app.branch.read.not_found");
      }

      return sendServiceData(branch);
    } catch (error) {
      console.error(`${TAG} - getBranch: `, error);
      return sendServiceMessage("messages.apis.app.branch.read.error");
    }
  },

  updateBranch: async ({ params, body }) => {
    try {
      // Validate body
      if (!body) {
        return sendServiceMessage(
          "messages.apis.app.branch.update.invalid_body"
        );
      }

      // Find the branch
      const branch = await Branch.findByPk(params.branch_id);
      if (!branch) {
        return sendServiceMessage("messages.apis.app.branch.update.not_found");
      }

      // Validate foreign keys if updated
      if (body.manager_id) {
        const managerExists = await Employee.findByPk(body.manager_id);
        if (!managerExists) {
          return sendServiceMessage(
            "messages.apis.app.branch.update.invalid_manager"
          );
        }
      }

      if (body.company_id) {
        const companyExists = await Company.findByPk(body.company_id);
        if (!companyExists) {
          return sendServiceMessage(
            "messages.apis.app.branch.update.invalid_company"
          );
        }
      }

      // Update the branch
      const updatedBranch = await branch.update({
        branch_name: body.branch_name || branch.branch_name,
        location: body.location || branch.location,
        manager_id: body.manager_id || branch.manager_id,
        company_id: body.company_id || branch.company_id,
      });

      return sendServiceData(updatedBranch);
    } catch (error) {
      console.error(`${TAG} - updateBranch: `, error);
      return sendServiceMessage("messages.apis.app.branch.update.error");
    }
  },

  deleteBranch: async ({ params }) => {
    try {
      // Find the branch
      const branch = await Branch.findByPk(params.branch_id);
      if (!branch) {
        return sendServiceMessage("messages.apis.app.branch.delete.not_found");
      }

      // Delete the branch
      await branch.destroy();

      return sendServiceMessage("messages.apis.app.branch.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteBranch: `, error);
      return sendServiceMessage("messages.apis.app.branch.delete.error");
    }
  },

  getBranchesByManager: async ({ params }) => {
    try {
      // Retrieve branches managed by a specific employee
      const branches = await Branch.findAll({
        where: { manager_id: params.manager_id },
        attributes: ["branch_id", "branch_name", "location", "company_id"],
        include: [
          { model: Company, as: "company", attributes: ["company_name"] },
        ],
      });

      return sendServiceData(branches);
    } catch (error) {
      console.error(`${TAG} - getBranchesByManager: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.read.by_manager_error"
      );
    }
  },

  getBranchesByCompany: async ({ params }) => {
    try {
      // Retrieve branches for a specific company
      const branches = await Branch.findAll({
        where: { company_id: params.company_id },
        attributes: ["branch_id", "branch_name", "location", "manager_id"],
        include: [{ model: Employee, as: "manager", attributes: ["name"] }],
      });

      return sendServiceData(branches);
    } catch (error) {
      console.error(`${TAG} - getBranchesByCompany: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.read.by_company_error"
      );
    }
  },
};
