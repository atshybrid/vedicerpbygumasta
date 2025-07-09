const {
  Employee,
  Role,
  Branch,
  Company,
  Attendance,
  User,
  CounterRegister,
  CashHandover,
  Sale,
  sequelize,
  BranchItem,
  StockRequest,
  ItemVariation,
  Item,
  Expense,
} = require("./../../../models");
const { Op, where } = require("sequelize");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");

const TAG = "employee.service.js";

module.exports = {
  createEmployee: async ({ body }) => {
    try {
      let employeeCodePrefix = "EMP";
      let prefix = "ORG";

      // Validate input
      if ((!body.name || !body.role_id || !body.phone_number, !body.email)) {
        return sendServiceMessage(
          "messages.apis.app.employee.create.invalid_body"
        );
      }

      // Ensure mobile_number and email are unique
      const existingPhoneNumber = await User.findOne({
        where: { mobile_number: body.mobile_number },
      });
      if (existingPhoneNumber) {
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

      // Ensure foreign key constraints
      const roleExists = await Role.findByPk(body.role_id);

      if (roleExists.role_name === "ADMIN") {
        return sendServiceMessage(
          "messages.apis.app.employee.create.admin_role_error"
        );
      }
      if (!roleExists) {
        return sendServiceMessage(
          "messages.apis.app.employee.create.invalid_role"
        );
      }
      if (body.branch_id) {
        const branchExists = await Branch.findByPk(body.branch_id);
        if (!branchExists) {
          return sendServiceMessage(
            "messages.apis.app.employee.create.invalid_branch"
          );
        }
      }

      if (body.company_id) {
        const companyExists = await Company.findByPk(body.company_id);
        if (!companyExists) {
          return sendServiceMessage(
            "messages.apis.app.employee.create.invalid_company"
          );
        }
      }

      if (body.branch_id) {
        const branch = await Branch.findByPk(body.branch_id);
        if (branch) {
          prefix =
            branch.invoice_prefix ||
            branch.branch_name?.substring(0, 3).toUpperCase() ||
            "BRN";
        }
      } else if (body.company_id) {
        const company = await Company.findByPk(body.company_id);
        if (company) {
          prefix = company.company_name?.substring(0, 3).toUpperCase() || "ORG";
        }
      }

      let empCount = 0;
      if (body.branch_id) {
        empCount = await Employee.count({
          include: [
            {
              model: User,
              as: "user",
              where: { branch_id: body.branch_id },
            },
          ],
        });
      } else if (body.company_id) {
        empCount = await Employee.count({
          include: [
            {
              model: User,
              as: "user",
              where: { company_id: body.company_id },
            },
          ],
        });
      }

      const paddedCount = String(empCount + 1).padStart(5, "0");
      const generatedEmployeeNo = `${prefix}_${employeeCodePrefix}_${paddedCount}`;

      // Create the user
      const user = await User.create({
        mobile_number: body.mobile_number,
        mpin: body.mpin,
        name: body.name,
        email: body.email || null,
        branch_id: body.branch_id,
        company_id: body.company_id,
        role_id: body.role_id,
      });

      if (!user) {
        return sendServiceMessage(
          "messages.apis.app.employee.create.user_creation_failed"
        );
      }

      const employee = await Employee.create({
        user_id: user.user_id,
        employee_no: generatedEmployeeNo,
      });

      const employeeWithUser = await Employee.findByPk(employee.employee_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "role_id",
              "branch_id",
            ],
          },
        ],
      });

      return sendServiceData(employeeWithUser);
    } catch (error) {
      console.error(`${TAG} - createEmployee: `, error);
      return sendServiceMessage("messages.apis.app.employee.create.error");
    }
  },

  getEmployees: async ({ query }) => {
    try {
      const { role, branch_id, company_id } = query;

      // Initialize filter for nested user
      const userFilter = { status: "active" }; // Only get active users

      // If role is provided, get role_id and filter
      if (role) {
        const roleExists = await Role.findOne({ where: { role_name: role } });
        if (!roleExists) {
          return sendServiceMessage(
            "messages.apis.app.employee.read.invalid_role"
          );
        }
        userFilter.role_id = roleExists.role_id;
      }

      // If branch_id is provided, add to user filter
      if (branch_id) {
        userFilter.branch_id = branch_id;
      }
      if (company_id) {
        userFilter.company_id = company_id;
      }

      // Fetch employees with filters
      const employees = await Employee.findAll({
        where: { status: "active" }, // Only get active employees
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "branch_id",
              "role_id",
              "status",
              "company_id",
            ],
            include: [
              {
                model: Role,
                as: "role",
                attributes: ["role_id", "role_name"],
              },
              {
                model: Branch,
                as: "branch",
                attributes: ["id", "branch_name"],
              },
            ],
            where: Object.keys(userFilter).length > 0 ? userFilter : undefined,
          },
        ],
        attributes: ["employee_id", "employee_no", "user_id", "status"],
      });

      return sendServiceData(employees);
    } catch (error) {
      console.error(`${TAG} - getEmployees: `, error);
      return sendServiceMessage("messages.apis.app.employee.read.error");
    }
  },

  getEmployee: async ({ params }) => {
    try {
      // Retrieve a single employee by ID (only if active)
      const employee = await Employee.findOne({
        where: {
          employee_id: params.employee_id,
          status: "active", // Only get active employees
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "role_id",
              "branch_id",
              "status",
            ],
            where: { status: "active" }, // Only get active users
          },
        ],
        attributes: ["employee_id", "employee_no", "user_id", "status"],
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

  getBillerAnalytics: async (req) => {
    try {
      const { employee_id, branch_id, company_id } = req;

      if (!employee_id || !branch_id || !company_id) {
        return sendServiceMessage(
          "messages.apis.app.employee.analytics.invalid_employee"
        );
      }

      // Get today's start and end timestamps (IST)
      const startOfDay = moment().tz("Asia/Kolkata").startOf("day").valueOf();
      const endOfDay = moment().tz("Asia/Kolkata").endOf("day").valueOf();

      // Query sales table for the biller (employee)
      const result = await Sale.findAll({
        where: {
          employee_id,
          branch_id,
          company_id,
          sale_date: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        attributes: [
          [
            sequelize.fn("COUNT", sequelize.col("invoice_number")),
            "invoice_count",
          ],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "total_value"],
        ],
        raw: true,
      });

      return sendServiceData(result[0]);
    } catch (error) {
      console.error(`${TAG} - getBillerAnalytics: `, error);
      return sendServiceMessage("messages.apis.app.employee.analytics.error");
    }
  },

  getManagerAnalytics: async (req) => {
    try {
      const { employee_id: manager_id, branch_id, company_id } = req;

      console.log("Body", manager_id, branch_id, company_id);

      if (!manager_id || !branch_id || !company_id) {
        return sendServiceMessage(
          "messages.apis.app.employee.analytics.invalid_body"
        );
      }

      const todayStart = moment().tz("Asia/Kolkata").startOf("day").valueOf();
      const todayEnd = moment().tz("Asia/Kolkata").endOf("day").valueOf();
      const monthStart = moment().tz("Asia/Kolkata").startOf("month").valueOf();
      const weekStart = moment()
        .tz("Asia/Kolkata")
        .subtract(7, "days")
        .startOf("day")
        .valueOf();

      // ===== Attendance Stats =====
      const totalEmployees = await Employee.count({
        include: [
          {
            model: User,
            as: "user",
            where: { branch_id },
          },
        ],
      });

      const todayAttendance = await Attendance.findAll({
        where: {
          branch_id,
          company_id,
          timestamp: { [Op.between]: [todayStart, todayEnd] },
        },
      });

      const presentToday = todayAttendance.filter(
        (a) =>
          a.attendance_status === "Present" ||
          a.attendance_status === "Half-Day"
      ).length;
      const absentToday = totalEmployees - presentToday;

      // ===== Low Stock Items =====
      const lowStockItems = await BranchItem.findAll({
        where: {
          branch_id,
          stock: { [Op.lt]: 10 },
        },
        include: [
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_id", "variation_name"],
            include: [
              {
                model: Item,
                as: "item",
                attributes: ["item_name"],
              },
            ],
          },
        ],
      });

      const lowStock = lowStockItems.map((item) => ({
        item_id: item.variation_id,
        item_name: item.variation?.item?.item_name || "Unknown",
        variation_name: item.variation?.variation_name || "Unknown",
        current_stock: item.stock,
        min_required: 10,
      }));
      // ===== Pending Stock Requests =====
      const stockRequests = await StockRequest.findAll({
        where: {
          branch_id,
          company_id,
          manager_id,
          status: "PENDING",
        },
        include: [
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_id", "variation_name"],
            include: [
              {
                model: Item,
                as: "item",
                attributes: ["item_name"],
              },
            ],
          },
        ],
      });

      const pendingStockRequests = stockRequests.map((req) => ({
        request_id: req.stock_request_id,
        item_name: req.variation?.item?.item_name || "Unknown",
        variation_name: req.variation?.variation_name || "Unknown",
        requested_qty: req.stock_requested,
        status: req.status,
        requested_date: moment(req.request_date).format("YYYY-MM-DD"),
      }));

      // ===== Expenses =====
      const todayExpensesData = await Expense.findAll({
        where: {
          branch_id,
          recorded_by: manager_id,
          expense_date: { [Op.between]: [todayStart, todayEnd] },
          status: { [Op.in]: ["PENDING", "APPROVED"] },
        },
      });

      const weekExpensesData = await Expense.findAll({
        where: {
          branch_id,
          recorded_by: manager_id,
          expense_date: { [Op.gte]: weekStart },
          status: { [Op.in]: ["PENDING", "APPROVED"] },
        },
        limit: 10,
        order: [["expense_date", "DESC"]],
      });

      const todayExpenses = todayExpensesData.reduce(
        (sum, e) => sum + parseFloat(e.amount),
        0
      );
      const totalExpensesThisMonth = weekExpensesData.reduce(
        (sum, e) => sum + parseFloat(e.amount),
        0
      );

      const recentExpenses = weekExpensesData.map((e) => ({
        expense_id: e.expense_id,
        category: e.type,
        amount: parseFloat(e.amount),
        date: moment(e.expense_date).format("YYYY-MM-DD"),
      }));

      // ===== Pending Cash Collections (handover approvals) =====
      const pendingCashHandover = await CashHandover.findAll({
        where: {
          branch_id,
          manager_id,
          status: "PENDING",
          created_at: {
            [Op.between]: [
              moment().tz("Asia/Kolkata").startOf("day").toDate(),
              moment().tz("Asia/Kolkata").endOf("day").toDate(),
            ],
          },
        },
        include: [
          {
            model: Employee,
            as: "biller",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      const cashCollections = pendingCashHandover.map((handover) => ({
        biller_name: handover.biller?.user?.name || "Unknown",
        total_cash_collected: parseFloat(handover.cash_amount || 0),
        handover_id: handover.handover_id,
        approval_status: handover.status,
        date: moment(handover.created_at).format("YYYY-MM-DD"),
      }));

      // ===== Build Final Response =====
      return sendServiceData({
        summary: {
          total_employees: totalEmployees,
          present_today: presentToday,
          absent_today: absentToday,
          low_stock_items: lowStock.length,
          pending_stock_requests: pendingStockRequests.length,
          pending_cash_collections: cashCollections.length,
        },
        attendance: {
          present_count: presentToday,
          absent_count: absentToday,
          attendance_percentage:
            totalEmployees > 0
              ? Math.round((presentToday / totalEmployees) * 100)
              : 0,
        },
        low_stock: lowStock,
        stock_requests: pendingStockRequests,
        expenses: {
          today_expenses: todayExpenses,
          total_expenses_this_month: totalExpensesThisMonth,
          recent_expenses: recentExpenses,
        },
        cash_collections: cashCollections,
      });
    } catch (error) {
      console.error(`${TAG} - getManagerAnalytics:`, error);
      return sendServiceMessage("messages.apis.app.employee.analytics.error");
    }
  },
  getAdminAnalytics: async (req) => {
    try {
      const { company_id } = req;

      console.log("Body", company_id);

      if (!company_id) {
        return sendServiceMessage(
          "messages.apis.app.employee.analytics.invalid_body"
        );
      }

      const todayStart = moment().tz("Asia/Kolkata").startOf("day").valueOf();
      const todayEnd = moment().tz("Asia/Kolkata").endOf("day").valueOf();
      const monthStart = moment().tz("Asia/Kolkata").startOf("month").valueOf();
      const weekStart = moment()
        .tz("Asia/Kolkata")
        .subtract(7, "days")
        .startOf("day")
        .valueOf();

      // ===== Attendance Stats =====
      const totalEmployees = await Employee.count({
        include: [
          {
            model: User,
            as: "user",
          },
        ],
      });

      const todayAttendance = await Attendance.findAll({
        where: {
          company_id,
          timestamp: { [Op.between]: [todayStart, todayEnd] },
        },
      });

      const presentToday = todayAttendance.filter(
        (a) =>
          a.attendance_status === "Present" ||
          a.attendance_status === "Half-Day"
      ).length;
      const absentToday = totalEmployees - presentToday;

      // ===== Low Stock Items =====
      const lowStockItems = await BranchItem.findAll({
        where: {
          stock: { [Op.lt]: 10 },
        },
        include: [
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_id", "variation_name"],
            include: [
              {
                model: Item,
                as: "item",
                attributes: ["item_name"],
              },
            ],
          },
        ],
      });

      const lowStock = lowStockItems.map((item) => ({
        item_id: item.variation_id,
        item_name: item.variation?.item?.item_name || "Unknown",
        variation_name: item.variation?.variation_name || "Unknown",
        current_stock: item.stock,
        min_required: 10,
      }));
      // ===== Pending Stock Requests =====
      const stockRequests = await StockRequest.findAll({
        where: {
          company_id,
          status: "PENDING",
        },
        include: [
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_id", "variation_name"],
            include: [
              {
                model: Item,
                as: "item",
                attributes: ["item_name"],
              },
            ],
          },
        ],
      });

      const pendingStockRequests = stockRequests.map((req) => ({
        request_id: req.stock_request_id,
        item_name: req.variation?.item?.item_name || "Unknown",
        variation_name: req.variation?.variation_name || "Unknown",
        requested_qty: req.stock_requested,
        status: req.status,
        requested_date: moment(req.request_date).format("YYYY-MM-DD"),
      }));

      // ===== Expenses =====
      const todayExpensesData = await Expense.findAll({
        where: {
          expense_date: { [Op.between]: [todayStart, todayEnd] },
          status: { [Op.in]: ["PENDING", "APPROVED"] },
        },
      });

      const weekExpensesData = await Expense.findAll({
        where: {
          expense_date: { [Op.gte]: weekStart },
          status: { [Op.in]: ["PENDING", "APPROVED"] },
        },
        limit: 10,
        order: [["expense_date", "DESC"]],
      });

      const todayExpenses = todayExpensesData.reduce(
        (sum, e) => sum + parseFloat(e.amount),
        0
      );
      const totalExpensesThisMonth = weekExpensesData.reduce(
        (sum, e) => sum + parseFloat(e.amount),
        0
      );

      const recentExpenses = weekExpensesData.map((e) => ({
        expense_id: e.expense_id,
        category: e.type,
        amount: parseFloat(e.amount),
        date: moment(e.expense_date).format("YYYY-MM-DD"),
      }));

      // ===== Pending Cash Collections (handover approvals) =====
      const pendingCashHandover = await CashHandover.findAll({
        where: {
          status: "PENDING",
          created_at: {
            [Op.between]: [
              moment().tz("Asia/Kolkata").startOf("day").toDate(),
              moment().tz("Asia/Kolkata").endOf("day").toDate(),
            ],
          },
        },
        include: [
          {
            model: Employee,
            as: "biller",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      const cashCollections = pendingCashHandover.map((handover) => ({
        biller_name: handover.biller?.user?.name || "Unknown",
        total_cash_collected: parseFloat(handover.cash_amount || 0),
        handover_id: handover.handover_id,
        approval_status: handover.status,
        date: moment(handover.created_at).format("YYYY-MM-DD"),
      }));

      // ===== Build Final Response =====
      return sendServiceData({
        summary: {
          total_employees: totalEmployees,
          present_today: presentToday,
          absent_today: absentToday,
          low_stock_items: lowStock.length,
          pending_stock_requests: pendingStockRequests.length,
          pending_cash_collections: cashCollections.length,
        },
        attendance: {
          present_count: presentToday,
          absent_count: absentToday,
          attendance_percentage:
            totalEmployees > 0
              ? Math.round((presentToday / totalEmployees) * 100)
              : 0,
        },
        low_stock: lowStock,
        stock_requests: pendingStockRequests,
        expenses: {
          today_expenses: todayExpenses,
          total_expenses_this_month: totalExpensesThisMonth,
          recent_expenses: recentExpenses,
        },
        cash_collections: cashCollections,
      });
    } catch (error) {
      console.error(`${TAG} - getAdminAnalytics:`, error);
      return sendServiceMessage("messages.apis.app.employee.analytics.error");
    }
  },

  updateEmployee: async ({ params, body }) => {
    try {
      // Validate body
      if (!body || Object.keys(body).length === 0) {
        return sendServiceMessage(
          "messages.apis.app.employee.update.invalid_body"
        );
      }

      // Find the employee
      const employee = await Employee.findByPk(params.employee_id, {
        include: [{ model: User, as: "user" }],
      });

      if (!employee) {
        return sendServiceMessage(
          "messages.apis.app.employee.update.not_found"
        );
      }

      // Employee number should be

      if (body.employee_no) {
        const existingEmployee = await Employee.findOne({
          where: { employee_no: body.employee_no },
        });

        if (existingEmployee) {
          return sendServiceMessage(
            "messages.apis.app.employee.update.duplicate_employee_no"
          );
        }
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

      // Update User (if applicable)
      if (body.name || body.email || body.phone_number || body.role_id) {
        const user = employee.user;

        await user.update({
          name: body.name || user.name,
          email: body.email || user.email,
          mobile_number: body.phone_number || user.mobile_number,
          role_id: body.role_id || user.role_id,
          branch_id: body.branch_id || user.branch_id,
          company_id: body.company_id || user.company_id,
        });
      }

      // Update Employee
      const updatedEmployee = await employee.update({
        employee_no: body.employee_no || employee.employee_no,
      });

      // Fetch updated details with associated User
      const employeeWithUser = await Employee.findByPk(
        updatedEmployee.employee_id,
        {
          include: [
            {
              model: User,
              as: "user",
              attributes: [
                "user_id",
                "name",
                "email",
                "mobile_number",
                "role_id",
              ],
            },
          ],
        }
      );

      return sendServiceData(employeeWithUser);
    } catch (error) {
      console.error(`${TAG} - updateEmployee: `, error);
      return sendServiceMessage("messages.apis.app.employee.update.error");
    }
  },

  deleteEmployee: async ({ params }) => {
    try {
      // Find the employee with user details
      const employee = await Employee.findByPk(params.employee_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "status"],
          },
        ],
      });

      if (!employee) {
        return sendServiceMessage(
          "messages.apis.app.employee.delete.not_found"
        );
      }

      // Set employee status to inactive instead of deleting
      await employee.update({ status: "inactive" });

      // Also set the associated user status to inactive
      if (employee.user) {
        await employee.user.update({ status: "inactive" });
      }

      return sendServiceData(null);
    } catch (error) {
      console.error(`${TAG} - deleteEmployee: `, error);
      return sendServiceMessage("messages.apis.app.employee.delete.error");
    }
  },

  checkIn: async ({ body }) => {
    try {
      const { biller_id, branch_id, company_id, opening_balance, timestamp } =
        body;

      // Validate input
      if (
        !biller_id ||
        !branch_id ||
        !company_id ||
        opening_balance === undefined ||
        !timestamp
      ) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkIn.invalid_body"
        );
      }

      if (opening_balance < 0) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkIn.invalid_opening_balance"
        );
      }

      // Validate branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch || branch.company_id !== company_id) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkIn.invalid_branch"
        );
      }

      // Validate biller
      const biller = await Employee.findByPk(biller_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "role_id",
              "branch_id",
            ],
          },
        ],
      });
      if (!biller || biller?.user?.branch_id !== branch_id) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkIn.invalid_biller"
        );
      }

      // Check if the biller has already checked in today
      const startOfDay = moment
        .tz(timestamp, "Asia/Kolkata")
        .startOf("day")
        .valueOf();
      const endOfDay = moment
        .tz(timestamp, "Asia/Kolkata")
        .endOf("day")
        .valueOf();

      const existingCheckIn = await CounterRegister.findOne({
        where: {
          biller_id,
          branch_id,
          company_id,
          status: "OPEN",
          shift_start: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      if (existingCheckIn) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkIn.already_checked_in"
        );
      }

      // Check for pending handovers
      const pendingHandover = await CashHandover.findOne({
        where: {
          biller_id,
        },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: CounterRegister,
            as: "register",
            attributes: ["shift_start", "shift_end", "closing_balance"],
          },
        ],
      });

      if (
        pendingHandover &&
        (pendingHandover?.status === "PENDING" ||
          pendingHandover?.status === "REJECTED")
      ) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkIn.pending_handover_exists",
          { pending_request: pendingHandover }
        );
      }

      // Create check-in entry
      const counterRegister = await CounterRegister.create({
        biller_id,
        branch_id,
        company_id,
        opening_balance,
        status: "OPEN",
        shift_start: timestamp,
        shift_end: null,
        closing_balance: null,
      });

      return sendServiceData(counterRegister);
    } catch (error) {
      console.error(`${TAG} - checkIn: `, error);
      return sendServiceMessage("messages.apis.app.employee.checkIn.error");
    }
  },
  checkOut: async ({ body }) => {
    try {
      const { biller_id, branch_id, company_id, closing_balance, timestamp } =
        body;

      // Validate input
      if (
        !biller_id ||
        !branch_id ||
        !company_id ||
        closing_balance === undefined ||
        !timestamp
      ) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkOut.invalid_body"
        );
      }

      if (closing_balance < 0) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkOut.invalid_closing_balance"
        );
      }

      // Validate branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch || branch.company_id !== company_id) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkOut.invalid_branch"
        );
      }

      // Validate biller
      const biller = await Employee.findByPk(biller_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "role_id",
              "branch_id",
            ],
          },
        ],
      });
      if (!biller || biller?.user?.branch_id !== branch_id) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkOut.invalid_biller"
        );
      }

      // Get today's boundaries
      const todayStart = moment
        .tz(timestamp, "Asia/Kolkata")
        .startOf("day")
        .valueOf();
      const todayEnd = moment
        .tz(timestamp, "Asia/Kolkata")
        .endOf("day")
        .valueOf();

      // Check if already checked out
      // const alreadyCheckedOut = await CounterRegister.findOne({
      //   where: {
      //     biller_id,
      //     branch_id,
      //     company_id,
      //     status: "CLOSED",
      //     shift_start: { [Op.between]: [todayStart, todayEnd] },
      //   },
      // });

      // if (alreadyCheckedOut) {
      //   return sendServiceMessage(
      //     "messages.apis.app.employee.checkOut.already_checked_out"
      //   );
      // }

      // Get the open register
      const openRegister = await CounterRegister.findOne({
        where: {
          biller_id,
          branch_id,
          company_id,
          status: "OPEN",
          shift_start: { [Op.between]: [todayStart, todayEnd] },
        },
        order: [["created_at", "DESC"]],
      });

      if (!openRegister) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkOut.no_open_register_for_today"
        );
      }

      //Check for corresponding handover entry
      const handoverExists = await CashHandover.findOne({
        where: {
          register_id: openRegister.register_id,
          biller_id,
          branch_id,
          status: { [Op.ne]: "REJECTED" },
        },
      });

      console.log("Handover Requests", handoverExists);

      if (!handoverExists) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkOut.no_open_handover_for_today"
        );
      }

      //  Proceed to update the open register
      const closedRegister = await openRegister.update({
        status: "CLOSED",
        shift_end: timestamp,
        closing_balance,
      });

      return sendServiceData(closedRegister);
    } catch (error) {
      console.error(`${TAG} - checkOut: `, error);
      return sendServiceMessage("messages.apis.app.employee.checkOut.error");
    }
  },

  checkInStatus: async (req) => {
    try {
      const { employee_id: biller_id, branch_id, company_id } = req;
      console.log("Body", biller_id, branch_id, company_id);

      const { timestamp } = req.params;

      if (!biller_id || !branch_id || !company_id || !timestamp) {
        return sendServiceMessage(
          "messages.apis.app.employee.checkInStatus.invalid_body"
        );
      }

      // Define start and end of the day based on provided timestamp
      const startOfDay = moment
        .tz(Number(timestamp), "Asia/Kolkata")
        .startOf("day")
        .valueOf();

      const endOfDay = moment
        .tz(Number(timestamp), "Asia/Kolkata")
        .endOf("day")
        .valueOf();

      const registerDetails = await CounterRegister.findOne({
        where: {
          biller_id,
          branch_id,
          company_id,
          shift_start: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        order: [["created_at", "DESC"]],
      });

      return sendServiceData({
        checkInStatus: !!registerDetails,
        checkOutStatus: registerDetails?.status === "CLOSED" || false,
        checkInDetails: registerDetails || null,
      });
    } catch (error) {
      console.error(`${TAG} - checkInStatus: `, error);
      return sendServiceMessage(
        "messages.apis.app.employee.checkInStatus.error"
      );
    }
  },

  markAttendance: async ({ body }) => {
    try {
      const { manager_id, branch_id, company_id, attendance, timestamp } = body;

      // Validate input
      if (
        !manager_id ||
        !branch_id ||
        !company_id ||
        !attendance ||
        !timestamp ||
        attendance.length === 0
      ) {
        return sendServiceMessage(
          "messages.apis.app.employee.attendance.invalid_body"
        );
      }

      // Ensure the timestamp corresponds to today's date
      const now = moment.tz("Asia/Kolkata").startOf("day");
      const providedDate = moment
        .tz(Number(timestamp), "Asia/Kolkata")
        .startOf("day");

      if (!now.isSame(providedDate)) {
        return sendServiceMessage(
          "messages.apis.app.employee.attendance.invalid_date"
        );
      }

      // Validate manager
      const manager = await Employee.findByPk(manager_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["branch_id"],
          },
        ],
      });
      if (!manager || manager.user.branch_id !== branch_id) {
        return sendServiceMessage(
          "messages.apis.app.employee.attendance.invalid_manager"
        );
      }

      // Validate branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch || branch.company_id !== company_id) {
        return sendServiceMessage(
          "messages.apis.app.employee.attendance.invalid_branch"
        );
      }

      // Validate company
      const company = await Company.findByPk(company_id);
      if (!company) {
        return sendServiceMessage(
          "messages.apis.app.employee.attendance.invalid_company"
        );
      }

      // Process each attendance entry
      const results = [];
      const currentDateStart = moment
        .tz(timestamp, "Asia/Kolkata")
        .startOf("day")
        .valueOf();
      const currentDateEnd = moment
        .tz(timestamp, "Asia/Kolkata")
        .endOf("day")
        .valueOf();

      for (const entry of attendance) {
        const { emp_id, live_image, attendance_status, remarks } = entry;

        // Validate entry details
        if (!emp_id || !live_image || !attendance_status) {
          return sendServiceMessage(
            "messages.apis.app.employee.attendance.invalid_entry"
          );
        }

        const employee = await Employee.findByPk(emp_id, {
          include: [
            {
              model: User,
              as: "user",
              attributes: ["branch_id"],
            },
          ],
        });
        if (!employee || employee.user.branch_id !== branch_id) {
          return sendServiceMessage(
            "messages.apis.app.employee.attendance.invalid_employee"
          );
        }

        // Check if attendance for this employee already exists for today
        const existingAttendance = await Attendance.findOne({
          where: {
            emp_id,
            branch_id,
            company_id,
            timestamp: { [Op.between]: [currentDateStart, currentDateEnd] },
          },
        });

        console.log(
          "existingAttendance",
          existingAttendance,
          currentDateEnd,
          currentDateStart
        );

        if (existingAttendance) {
          return sendServiceMessage(
            "messages.apis.app.employee.attendance.already_marked"
          );
        }

        // Create attendance entry
        const attendanceEntry = await Attendance.create({
          emp_id,
          manager_id,
          branch_id,
          company_id,
          live_image,
          timestamp,
          attendance_status,
          remarks: remarks || null,
        });

        results.push(attendanceEntry);
      }

      return sendServiceData({
        message: "Attendance marked successfully",
        attendance: results,
      });
    } catch (error) {
      console.error(`${TAG} - markAttendance: `, error);
      return sendServiceMessage("messages.apis.app.employee.attendance.error");
    }
  },
  getAttendance: async ({ query }) => {
    try {
      const { branch_id, emp_id, fromDate, toDate } = query;

      // Build the filter for attendance records
      const filter = {};
      if (branch_id) filter.branch_id = branch_id;
      if (emp_id) filter.emp_id = emp_id;

      // Add date range filter if provided
      if (fromDate || toDate) {
        const startDate = fromDate
          ? moment.tz(Number(fromDate), "Asia/Kolkata").startOf("day").valueOf()
          : null;
        const endDate = toDate
          ? moment.tz(Number(toDate), "Asia/Kolkata").endOf("day").valueOf()
          : null;

        filter.timestamp = {
          ...(startDate && { [Op.gte]: Number(startDate) }),
          ...(endDate && { [Op.lte]: Number(endDate) }),
        };
      }

      // Fetch attendance records
      const attendanceRecords = await Attendance.findAll({
        where: filter,
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["employee_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name"],
              },
            ],
          },
          {
            model: Employee,
            as: "manager",
            attributes: ["employee_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name"],
              },
            ],
          },
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branch_name", "location"],
          },
          {
            model: Company,
            as: "company",
            attributes: ["company_id", "company_name"],
          },
        ],
        attributes: [
          "attendance_id",
          "emp_id",
          "manager_id",
          "branch_id",
          "company_id",
          "live_image",
          "timestamp",
          "attendance_status",
          "remarks",
        ],
        order: [["timestamp", "DESC"]],
      });

      // Handle no records found
      if (!attendanceRecords.length) {
        return sendServiceMessage(
          "messages.apis.app.employee.attendance.get.no_records"
        );
      }

      // Group attendance records by branch and employee
      // const groupedRecords = {};
      // attendanceRecords.forEach((record) => {
      //   const branch = record.branch.branch_name;
      //   const employee = record.employee.user.name;

      //   if (!groupedRecords[branch]) {
      //     groupedRecords[branch] = {};
      //   }
      //   if (!groupedRecords[branch][employee]) {
      //     groupedRecords[branch][employee] = [];
      //   }

      //   groupedRecords[branch][employee].push({
      //     attendance_id: record.attendance_id,
      //     emp_id: record.emp_id,
      //     live_image: record.live_image,
      //     timestamp: record.timestamp,
      //     attendance_status: record.attendance_status,
      //     remarks: record.remarks,
      //   });
      // });

      // Return the grouped records
      return sendServiceData(attendanceRecords);
    } catch (error) {
      console.error(`${TAG} - getAttendance: `, error);
      return sendServiceMessage(
        "messages.apis.app.employee.attendance.get.error"
      );
    }
  },
};
