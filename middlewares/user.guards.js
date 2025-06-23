const { getText } = require("../language/index");
const responses = require("../utils/api.responses");
const {
  Employee,
  Role,
  Branch,
  Company,
  Attendance,
  User,
  CounterRegister,
} = require("../models/index");

const isAdmin = async (req, res, next) => {
  try {
    const { user_id } = req;
    const user = await User.findOne({
      where: { user_id },
      attributes: [
        "user_id",
        "mobile_number",
        "mpin",
        "name",
        "email",
        "role_id",
        "branch_id",
        "company_id",
      ],
    });

    const role = await Role.findOne({
      where: { role_name: "ADMIN" },
      attributes: ["role_id"],
    });

    const superAdminRole = await Role.findOne({
      where: { role_name: "super-admin" },
      attributes: ["role_id"],
    });

    if (!user) {
      return responses.badRequestResponse(
        res,
        getText("messages.apis.auth.common.user_not_found")
      );
    }

    if (
      user.role_id === role?.role_id ||
      user.role_id === superAdminRole?.role_id
    ) {
      req.user = user;
      next();
    } else {
      return responses.authFailureResponse(
        res,
        getText("messages.apis.auth.common.not_admin")
      );
    }
  } catch (error) {
    console.log(`checkUser: `, error);
    return null;
  }
};

const isAdminOrManager = async (req, res, next) => {
  try {
    const { user_id } = req;
    const user = await User.findOne({
      where: { user_id },
      attributes: [
        "user_id",
        "mobile_number",
        "mpin",
        "name",
        "email",
        "role_id",
        "branch_id",
        "company_id",
      ],
    });
    if (!user) {
      return responses.badRequestResponse(
        res,
        getText("messages.apis.auth.common.user_not_found")
      );
    }

    const adminRole = await Role.findOne({
      where: { role_name: "ADMIN" },
      attributes: ["role_id"],
    });

    const managerRole = await Role.findOne({
      where: { role_name: "MANAGER" },
      attributes: ["role_id"],
    });
    const superAdminRole = await Role.findOne({
      where: { role_name: "super-admin" },
      attributes: ["role_id"],
    });

    const employee = await Employee.findOne({
      where: { user_id: user.user_id },
      attributes: ["employee_id", "employee_no"],
    });

    if (
      user.role_id === adminRole?.role_id ||
      user.role_id === managerRole?.role_id ||
      user.role_id === superAdminRole?.role_id
    ) {
      req.user = user;
      if (employee) {
        req.employee = employee;
      }
      next();
    } else {
      return responses.authFailureResponse(
        res,
        getText("messages.apis.auth.common.not_admin_or_manager")
      );
    }
  } catch (error) {
    console.log(`checkUser: `, error);
    return null;
  }
};

const isUser = async (req, res, next) => {
  try {
    const { user_id } = req;
    const user = await User.findOne({
      where: { user_id },
      attributes: [
        "user_id",
        "mobile_number",
        "mpin",
        "name",
        "email",
        "role_id",
        "branch_id",
        "company_id",
      ],
    });
    if (!user) {
      return responses.badRequestResponse(
        res,
        getText("messages.apis.auth.common.user_not_found")
      );
    }

    const superAdminRole = await Role.findOne({
      where: { role_name: "super-admin" },
      attributes: ["role_id"],
    });

    const adminRole = await Role.findOne({
      where: { role_name: "ADMIN" },
      attributes: ["role_id"],
    });

    const managerRole = await Role.findOne({
      where: { role_name: "MANAGER" },
      attributes: ["role_id"],
    });

    const billerRole = await Role.findOne({
      where: { role_name: "BILLER" },
      attributes: ["role_id"],
    });

    const employee = await Employee.findOne({
      where: { user_id: user.user_id },
      attributes: ["employee_id", "employee_no"],
    });

    if (
      user.role_id === superAdminRole.role_id ||
      user.role_id === adminRole.role_id ||
      user.role_id === managerRole.role_id ||
      user.role_id === billerRole.role_id
    ) {
      req.user = user;
      if (employee) {
        req.employee = employee;
      }
      next();
    } else {
      return responses.authFailureResponse(
        res,
        getText("messages.apis.auth.common.not_admin_or_manager_or_biller")
      );
    }
  } catch (error) {
    console.log(`checkUser: `, error);
    return null;
  }
};

const isManager = async (req, res, next) => {
  try {
    const { user_id } = req;
    const user = await User.findOne({
      where: { user_id },
      attributes: [
        "user_id",
        "mobile_number",
        "mpin",
        "name",
        "email",
        "role_id",
        "branch_id",
        "company_id",
      ],
    });
    if (!user) {
      return responses.badRequestResponse(
        res,
        getText("messages.apis.auth.common.user_not_found")
      );
    }

    const managerRole = await Role.findOne({
      where: { role_name: "MANAGER" },
      attributes: ["role_id"],
    });

    const employee = await Employee.findOne({
      where: { user_id: user.user_id },
      attributes: ["employee_id", "employee_no"],
    });

    if (user.role_id === managerRole.role_id) {
      req.user = user;
      if (employee) {
        req.employee = employee;
      }
      next();
    } else {
      return responses.authFailureResponse(
        res,
        getText("messages.apis.auth.common.not_manager")
      );
    }
  } catch (error) {
    console.log(`checkUser: `, error);
    return null;
  }
};

const isBiller = async (req, res, next) => {
  try {
    const { user_id } = req;
    const user = await User.findOne({
      where: { user_id },
      attributes: [
        "user_id",
        "mobile_number",
        "mpin",
        "name",
        "email",
        "role_id",
        "branch_id",
        "company_id",
      ],
    });
    if (!user) {
      return responses.badRequestResponse(
        res,
        getText("messages.apis.auth.common.user_not_found")
      );
    }

    const billerRole = await Role.findOne({
      where: { role_name: "BILLER" },
      attributes: ["role_id"],
    });

    const employee = await Employee.findOne({
      where: { user_id: user.user_id },
      attributes: ["employee_id", "employee_no"],
    });

    if (user.role_id === billerRole.role_id) {
      req.user = user;
      if (employee) {
        req.employee = employee;
      }
      next();
    } else {
      return responses.authFailureResponse(
        res,
        getText("messages.apis.auth.common.not_biller")
      );
    }
  } catch (error) {
    console.log(`checkUser: `, error);
    return null;
  }
};

const isManagerOrBiller = async (req, res, next) => {
  try {
    const { user_id } = req;
    const user = await User.findOne({
      where: { user_id },
      attributes: [
        "user_id",
        "mobile_number",
        "mpin",
        "name",
        "email",
        "role_id",
        "branch_id",
        "company_id",
      ],
    });
    if (!user) {
      return responses.badRequestResponse(
        res,
        getText("messages.apis.auth.common.user_not_found")
      );
    }

    const managerRole = await Role.findOne({
      where: { role_name: "MANAGER" },
      attributes: ["role_id"],
    });

    const billerRole = await Role.findOne({
      where: { role_name: "BILLER" },
      attributes: ["role_id"],
    });

    const employee = await Employee.findOne({
      where: { user_id: user.user_id },
      attributes: ["employee_id", "employee_no"],
    });

    if (
      user.role_id === managerRole.role_id ||
      user.role_id === billerRole.role_id
    ) {
      req.user = user;
      if (employee) {
        req.employee = employee;
      }
      next();
    } else {
      return responses.authFailureResponse(
        res,
        getText("messages.apis.auth.common.not_manager_or_biller")
      );
    }
  } catch (error) {
    console.log(`checkUser: `, error);
    return null;
  }
};

module.exports = {
  isAdmin,
  isAdminOrManager,
  isUser,
  isManager,
  isBiller,
  isManagerOrBiller,
};
