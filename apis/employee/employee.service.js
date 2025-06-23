const { Employee, Role, Branch, Company } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "employee.service.js";

module.exports = {
  createEmployee: async ({ body }) => {
    try {
      // Validate body
      if (
        !body.name ||
        !body.role_id ||
        !body.branch_id ||
        !body.company_id ||
        !body.phone_number
      ) {
        return sendServiceMessage(
          "messages.apis.app.employee.create.invalid_body"
        );
      }

      // Ensure foreign key constraints
      const roleExists = await Role.findByPk(body.role_id);
      if (!roleExists) {
        return sendServiceMessage(
          "messages.apis.app.employee.create.invalid_role"
        );
      }

      const branchExists = await Branch.findByPk(body.branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.employee.create.invalid_branch"
        );
      }

      const companyExists = await Company.findByPk(body.company_id);
      if (!companyExists) {
        return sendServiceMessage(
          "messages.apis.app.employee.create.invalid_company"
        );
      }

      // Create employee
      const employee = await Employee.create({
        name: body.name,
        role_id: body.role_id,
        branch_id: body.branch_id,
        company_id: body.company_id,
        phone_number: body.phone_number,
        email: body.email || null,
        inst_elg: body.inst_elg || 0, // Default to not eligible for incentives
      });

      return sendServiceData(employee);
    } catch (error) {
      console.error(`${TAG} - createEmployee: `, error);
      return sendServiceMessage("messages.apis.app.employee.create.error");
    }
  },

  getEmployees: async () => {
    try {
      // Retrieve all employees with related role, branch, and company details
      const employees = await Employee.findAll({
        include: [
          { model: Role, as: "role", attributes: ["role_name"] },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: Company, as: "company", attributes: ["company_name"] },
        ],
        attributes: [
          "employee_id",
          "name",
          "phone_number",
          "email",
          "inst_elg",
          "role_id",
          "branch_id",
          "company_id",
        ],
      });

      return sendServiceData(employees);
    } catch (error) {
      console.error(`${TAG} - getEmployees: `, error);
      return sendServiceMessage("messages.apis.app.employee.read.error");
    }
  },

  getEmployee: async ({ params }) => {
    try {
      // Retrieve a single employee by ID
      const employee = await Employee.findByPk(params.employee_id, {
        include: [
          { model: Role, as: "role", attributes: ["role_name"] },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
          { model: Company, as: "company", attributes: ["company_name"] },
        ],
        attributes: [
          "employee_id",
          "name",
          "phone_number",
          "email",
          "inst_elg",
          "role_id",
          "branch_id",
          "company_id",
        ],
      });

      if (!employee) {
        return sendServiceMessage("messages.apis.app.employee.read.not_found");
      }

      return sendServiceData(employee);
    } catch (error) {
      console.error(`${TAG} - getEmployee: `, error);
      return sendServiceMessage("messages.apis.app.employee.read.error");
    }
  },

  updateEmployee: async ({ params, body }) => {
    try {
      // Validate body
      if (!body) {
        return sendServiceMessage(
          "messages.apis.app.employee.update.invalid_body"
        );
      }

      // Find the employee
      const employee = await Employee.findByPk(params.employee_id);
      if (!employee) {
        return sendServiceMessage(
          "messages.apis.app.employee.update.not_found"
        );
      }

      // Validate foreign keys if updated
      if (body.role_id) {
        const roleExists = await Role.findByPk(body.role_id);
        if (!roleExists) {
          return sendServiceMessage(
            "messages.apis.app.employee.update.invalid_role"
          );
        }
      }

      if (body.branch_id) {
        const branchExists = await Branch.findByPk(body.branch_id);
        if (!branchExists) {
          return sendServiceMessage(
            "messages.apis.app.employee.update.invalid_branch"
          );
        }
      }

      if (body.company_id) {
        const companyExists = await Company.findByPk(body.company_id);
        if (!companyExists) {
          return sendServiceMessage(
            "messages.apis.app.employee.update.invalid_company"
          );
        }
      }

      // Update the employee
      const updatedEmployee = await employee.update({
        name: body.name || employee.name,
        role_id: body.role_id || employee.role_id,
        branch_id: body.branch_id || employee.branch_id,
        company_id: body.company_id || employee.company_id,
        phone_number: body.phone_number || employee.phone_number,
        email: body.email || employee.email,
        inst_elg:
          body.inst_elg !== undefined ? body.inst_elg : employee.inst_elg,
      });

      return sendServiceData(updatedEmployee);
    } catch (error) {
      console.error(`${TAG} - updateEmployee: `, error);
      return sendServiceMessage("messages.apis.app.employee.update.error");
    }
  },

  deleteEmployee: async ({ params }) => {
    try {
      // Find the employee
      const employee = await Employee.findByPk(params.employee_id);
      if (!employee) {
        return sendServiceMessage(
          "messages.apis.app.employee.delete.not_found"
        );
      }

      // Delete the employee
      await employee.destroy();

      return sendServiceMessage("messages.apis.app.employee.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteEmployee: `, error);
      return sendServiceMessage("messages.apis.app.employee.delete.error");
    }
  },
};
