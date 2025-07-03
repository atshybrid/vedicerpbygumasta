const {
  Branch,
  Employee,
  User,
  Company,
  Expense,
  BranchPettyCashAccount,
  FinancialTransaction,
  BankAccount,
  CashTransfer,
  CashAccount,
} = require("./../../../models");

const sequelize = require("sequelize");

const moment = require("moment-timezone");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "branch.service.js";

module.exports = {
  createBranch: async ({ body }) => {
    try {
      // Validate body
      if (!body.branch_name || !body.location || !body.company_id) {
        return sendServiceMessage(
          "messages.apis.app.branch.create.invalid_body"
        );
      }

      // Check if branch name already exists
      const branchExists = await Branch.findOne({
        where: { branch_name: body.branch_name },
      });

      if (branchExists) {
        return sendServiceMessage(
          "messages.apis.app.branch.create.branch_exists"
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
        manager_id: body?.manager_id || null,
        company_id: body?.company_id || null,
      });

      return sendServiceData(branch);
    } catch (error) {
      console.error(`${TAG} - createBranch: `, error);
      return sendServiceMessage("messages.apis.app.branch.create.error");
    }
  },

  getBranches: async () => {
    try {
      // Retrieve all branches with related manager (via User) and company details
      const branches = await Branch.findAll({
        include: [
          {
            model: Employee,
            as: "manager",
            attributes: ["employee_id", "user_id"], // Include fields needed to join with User
            required: false, // Allows branches without managers
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name"], // Fetch name from the User table
              },
            ],
          },
          {
            model: Company,
            as: "company",
            attributes: ["company_id", "company_name"],
          },
        ],
        attributes: [
          "branch_name",
          "id",
          "location",
          "manager_id",
          "company_id",
        ],
      });

      // Process branches to handle `manager_id` being null
      const processedBranches = branches.map((branch) => {
        return {
          ...branch.toJSON(),
          manager: branch.manager
            ? branch.manager.user?.name || "No name available" // Default message if User is missing
            : "No manager assigned", // Default message if manager is missing
        };
      });

      return sendServiceData(processedBranches);
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
          {
            model: Employee,
            as: "manager",
            attributes: ["employee_id", "user_id"], // Include fields needed to join with User
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name"], // Fetch name from the User table
              },
            ],
          },
          {
            model: Company,
            as: "company",
            attributes: ["company_name"],
          },
        ],
        attributes: ["branch_name", "location", "manager_id", "company_id"],
      });

      if (!branch) {
        return sendServiceMessage("messages.apis.app.branch.read.not_found");
      }

      // Process branch data to handle `manager` or `user` being null
      const processedBranch = {
        ...branch.toJSON(),
        manager: branch.manager
          ? branch.manager.user?.name || "No name available" // Default message if User is missing
          : "No manager assigned", // Default message if manager is missing
      };

      return sendServiceData(processedBranch);
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
        attributes: ["id", "branch_name", "location", "company_id"],
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
      console.log("params", params.company_id);
      // Retrieve branches for a specific company
      const branches = await Branch.findAll({
        where: { company_id: params.company_id },
        attributes: ["id", "branch_name", "location", "manager_id"],
        include: [{ model: Employee, as: "manager" }],
      });

      return sendServiceData(branches);
    } catch (error) {
      console.error(`${TAG} - getBranchesByCompany: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.read.by_company_error"
      );
    }
  },

  createExpense: async ({ body }) => {
    try {
      const {
        branch_id,
        amount,
        photo_proof,
        expense_date,
        type,
        remarks,
        recorded_by,
        company_id,
      } = body;

      // Validate input
      if (
        !branch_id ||
        !amount ||
        !expense_date ||
        !type ||
        !recorded_by ||
        !company_id
      ) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.create.invalid_body"
        );
      }

      if (amount <= 0) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.create.invalid_amount"
        );
      }

      // Validate Company
      const company = await Company.findByPk(company_id);
      if (!company) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.create.invalid_company"
        );
      }

      // Validate Branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.create.invalid_branch"
        );
      }

      // Validate Employee (who is recording the expense)
      const employee = await Employee.findByPk(recorded_by);
      if (!employee) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.create.invalid_employee"
        );
      }

      // Validate Petty Cash Account
      const pettyCashAccount = await BranchPettyCashAccount.findOne({
        where: { branch_id },
      });

      if (!pettyCashAccount || pettyCashAccount.balance < amount) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.create.insufficient_funds"
        );
      }

      // Fetch total pending expenses for the branch
      const pendingExpenses = await Expense.findAll({
        where: { branch_id, status: "PENDING" },
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "total_pending"],
        ],
        raw: true,
      });

      const totalPending = parseFloat(pendingExpenses[0]?.total_pending) || 0;
      const availableBalance = parseFloat(pettyCashAccount.balance);

      // Check if new expense exceeds available balance
      if (totalPending + parseFloat(amount) > availableBalance) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.create.insufficient_funds"
        );
      }

      // Create Expense Record
      const expense = await Expense.create({
        branch_id,
        amount,
        photo_proof,
        type,
        remarks: remarks || null,
        status: "PENDING",
        recorded_by,
        expense_date,
        company_id,
      });

      return sendServiceData(expense);
    } catch (error) {
      console.error(`${TAG} - createExpense: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.expenses.create.error"
      );
    }
  },

  updateExpenseStatus: async (req) => {
    try {
      const { expense_id, payment_method, status } = req.body;
      const { user_id: admin_id } = req.user;

      // Validate input
      if (!expense_id || !status || !admin_id) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.update_status.invalid_body"
        );
      }

      if (!["APPROVED", "REJECTED"].includes(status)) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.update_status.invalid_status"
        );
      }

      // Fetch expense entry
      const expense = await Expense.findByPk(expense_id, {
        include: [
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branch_name"],
          },
          {
            model: Company,
            as: "company",
            attributes: ["company_id", "company_name"],
          },
          {
            model: BankAccount,
            as: "bank_account",
            attributes: ["bank_account_id", "balance"],
          },
        ],
      });

      if (!expense) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.update_status.invalid_expense"
        );
      }

      if (expense.status !== "PENDING") {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.update_status.already_processed"
        );
      }

      if (status === "REJECTED") {
        // Update status and exit
        await expense.update({ status: "REJECTED" });
        return sendServiceData({ expense_id, status: "REJECTED" });
      }

      // If Approved, continue processing
      const { branch_id, company_id, bank_account_id, amount, expense_date } =
        expense;

      let updatedBalance = 0;
      let financialTransaction = null;

      if (branch_id) {
        // Branch Expense - Deduct from Petty Cash
        const pettyCashAccount = await BranchPettyCashAccount.findOne({
          where: { branch_id },
        });

        if (!pettyCashAccount) {
          return sendServiceMessage(
            "messages.apis.app.branch.expenses.update_status.no_petty_cash_account"
          );
        }

        if (parseFloat(pettyCashAccount.balance) < parseFloat(amount)) {
          return sendServiceMessage(
            "messages.apis.app.branch.expenses.update_status.insufficient_funds"
          );
        }

        // Create financial transaction entry
        financialTransaction = await FinancialTransaction.create({
          transaction_type: "EXPENSE",
          amount,
          transaction_date: expense_date,
          payment_method,
          reference_number: expense_id,
          employee_id: admin_id,
          branch_id,
          description: `Branch Expense: ${expense.type} - ${
            expense.remarks || "No remarks"
          }`,
        });

        // Deduct from petty cash
        updatedBalance =
          parseFloat(pettyCashAccount.balance) - parseFloat(amount);
        await pettyCashAccount.update({ balance: updatedBalance });
      } else if (company_id && bank_account_id) {
        // Company Expense - Deduct from Bank Account
        const bankAccount = await BankAccount.findOne({
          bank_account_id,
          company_id,
        });

        if (!bankAccount) {
          return sendServiceMessage(
            "messages.apis.app.branch.expenses.update_status.no_bank_account"
          );
        }

        if (parseFloat(bankAccount.balance) < parseFloat(amount)) {
          return sendServiceMessage(
            "messages.apis.app.branch.expenses.update_status.insufficient_funds"
          );
        }

        // Create financial transaction entry
        financialTransaction = await FinancialTransaction.create({
          transaction_type: "EXPENSE",
          amount,
          transaction_date: expense_date,
          payment_method,
          reference_number: expense_id,
          employee_id: admin_id,
          company_id,
          bank_account_id,
          description: `Company Expense: ${expense.type} - ${
            expense.remarks || "No remarks"
          }`,
        });

        // Deduct from Bank Account
        updatedBalance = parseFloat(bankAccount.balance) - parseFloat(amount);
        await bankAccount.update({ balance: updatedBalance });
      } else {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.update_status.invalid_expense_type"
        );
      }

      // Update expense status to Approved
      await expense.update({ status: "APPROVED" });

      return sendServiceData({
        status: "APPROVED",
        expense_id,
        financial_transaction_id: financialTransaction.transaction_id,
        new_balance: updatedBalance.toFixed(2),
      });
    } catch (error) {
      console.error(`${TAG} - updateExpenseStatus: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.expenses.update_status.error"
      );
    }
  },

  listExpenses: async ({ query }) => {
    try {
      const { branch: branch_id, status, fromDate, toDate, company_id } = query;

      console.log("Query Params: ", query);

      // Build filter conditions
      const filter = {};

      if (branch_id) {
        filter.branch_id = branch_id;
      }

      if (company_id) {
        filter.company_id = company_id;
      }

      if (status) {
        filter.status = status;
      }

      if (fromDate && toDate) {
        const fromTimestamp = moment
          .tz(+fromDate, "Asia/Kolkata")
          .startOf("day")
          .valueOf();
        const toTimestamp = moment
          .tz(+toDate, "Asia/Kolkata")
          .endOf("day")
          .valueOf();

        filter.expense_date = {
          [sequelize.Op.between]: [fromTimestamp, toTimestamp],
        };
      }

      // Fetch expenses
      const expenses = await Expense.findAll({
        where: filter,
        include: [
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branch_name", "location"],
          },
          {
            model: Employee,
            as: "employee",
            attributes: ["employee_id"],
            include: {
              model: User,
              as: "user",
              attributes: ["company_id"],
            },
          },
        ],
        attributes: [
          "expense_id",
          "branch_id",
          "amount",
          "type",
          "remarks",
          "status",
          "recorded_by",
          "expense_date",
          "photo_proof",
          "created_at",
        ],
        order: [["expense_date", "DESC"]],
      });

      if (!expenses.length) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.list.no_expenses"
        );
      }

      return sendServiceData(expenses);
    } catch (error) {
      console.error(`${TAG} - listExpenses: `, error);
      return sendServiceMessage("messages.apis.app.branch.expenses.list.error");
    }
  },

  getExpense: async ({ params }) => {
    try {
      const expense = await Expense.findByPk(params.expense_id, {
        include: [
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branch_name", "location"],
          },
          {
            model: Employee,
            as: "employee",
            attributes: ["employee_id"],
          },
        ],
        attributes: [
          "expense_id",
          "branch_id",
          "amount",
          "type",
          "remarks",
          "status",
          "photo_proof",
          "recorded_by",
          "expense_date",
          "created_at",
        ],
      });

      if (!expense) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.read.not_found"
        );
      }

      return sendServiceData(expense);
    } catch (error) {
      console.error(`${TAG} - getExpense: `, error);
      return sendServiceMessage("messages.apis.app.branch.expenses.read.error");
    }
  },

  addBalanceToPettyCash: async (req) => {
    try {
      const { branch_id, company_id, bank_account_id, timestamp, amount } =
        req.body;

      const { user_id: admin_id } = req.user;

      console.log("Admin ID: ", admin_id);

      // Validate input
      if (
        !branch_id ||
        !company_id ||
        !bank_account_id ||
        !timestamp ||
        !amount ||
        !admin_id
      ) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.add_balance.invalid_body"
        );
      }

      if (amount <= 0) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.add_balance.invalid_amount"
        );
      }

      // Validate Branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.add_balance.invalid_branch"
        );
      }

      // Validate Company
      const company = await Company.findByPk(company_id);
      if (!company) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.add_balance.invalid_company"
        );
      }

      // Validate Bank Account
      const bankAccount = await BankAccount.findByPk(bank_account_id);
      if (!bankAccount || bankAccount.company_id !== company_id) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.add_balance.invalid_bank_account"
        );
      }

      if (parseFloat(bankAccount.balance) < parseFloat(amount)) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.add_balance.insufficient_funds"
        );
      }

      // Validate Petty Cash Account
      let pettyCashAccount = await BranchPettyCashAccount.findOne({
        where: { branch_id },
      });

      if (!pettyCashAccount) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.add_balance.no_account"
        );
      }

      // Deduct amount from Bank Account
      const newBankBalance =
        parseFloat(bankAccount.balance) - parseFloat(amount);
      await bankAccount.update({ balance: newBankBalance.toFixed(2) });

      // Add amount to Petty Cash
      const newPettyCashBalance =
        parseFloat(pettyCashAccount.balance) + parseFloat(amount);
      await pettyCashAccount.update({
        balance: newPettyCashBalance.toFixed(2),
      });

      // Create Financial Transaction Entry
      const financialTransaction = await FinancialTransaction.create({
        transaction_type: "INTERNAL_PETTY_CASH",
        amount,
        transaction_date: timestamp,
        payment_method: "NETBANKING",
        reference_number: `BANK_TO_PETTY_${bank_account_id}_${branch_id}`,
        employee_id: admin_id,
        company_id,
        branch_id,
        bank_account_id: bank_account_id,
        description: `Transferred ${amount} from Bank Account ID: ${bank_account_id} to Branch Petty Cash ID: ${pettyCashAccount.petty_cash_account_id}`,
      });

      return sendServiceData({
        message: "Balance successfully added to Petty Cash",
        new_petty_cash_balance: newPettyCashBalance.toFixed(2),
        new_bank_balance: newBankBalance.toFixed(2),
        financial_transaction_id: financialTransaction.transaction_id,
      });
    } catch (error) {
      console.error(`${TAG} - addBalanceToPettyCash: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.expenses.add_balance.error"
      );
    }
  },

  getPettyCashBalance: async ({ params }) => {
    try {
      const { branch_id } = params;
      // Validate input
      if (!branch_id) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.get_balance.invalid_branch"
        );
      }
      // Validate Branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.get_balance.invalid_branch"
        );
      }
      // Fetch Petty Cash Account
      const pettyCashAccount = await BranchPettyCashAccount.findOne({
        where: { branch_id },
      });
      if (!pettyCashAccount) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.get_balance.no_account"
        );
      }
      // Return Petty Cash Balance

      return sendServiceData({
        petty_cash_balance: pettyCashAccount.balance,
        petty_cash_account_id: pettyCashAccount.petty_cash_account_id,
        branch_id: pettyCashAccount.branch_id,
        branch_name: branch.branch_name,
        location: branch.location,
      });
    } catch (error) {
      console.error(`${TAG} - getPettyCashBalance: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.expenses.get_balance.error"
      );
    }
  },
  getCashAccountBalance: async ({ params }) => {
    try {
      const { branch_id } = params;
      // Validate input
      if (!branch_id) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.get_balance.invalid_branch"
        );
      }
      // Validate Branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.get_balance.invalid_branch"
        );
      }
      // Fetch Petty Cash Account
      const branchCashAccount = await CashAccount.findOne({
        where: { branch_id },
      });
      if (!branchCashAccount) {
        return sendServiceMessage(
          "messages.apis.app.branch.expenses.get_balance.no_account"
        );
      }
      // Return Petty Cash Balance

      return sendServiceData({
        cash_account_balance: branchCashAccount.balance,
        cash_account_id: branchCashAccount.cash_account_id,
        branch_id: branchCashAccount.branch_id,
        branch_name: branch.branch_name,
        location: branch.location,
      });
    } catch (error) {
      console.error(`${TAG} - getBranchCashBalance: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.expenses.get_balance.error"
      );
    }
  },
  getFinancialTransactions: async (req) => {
    try {
      const {
        transaction_type,
        payment_method,
        branch_id,
        company_id,
        fromDate,
        toDate,
      } = req.query;

      const whereClause = {};

      if (transaction_type) whereClause.transaction_type = transaction_type;
      if (payment_method) whereClause.payment_method = payment_method;
      if (branch_id) whereClause.branch_id = branch_id;
      if (company_id) whereClause.company_id = company_id;

      const now = moment.tz("Asia/Kolkata");

      if (fromDate || toDate) {
        whereClause.transaction_date = {};

        if (fromDate) {
          const startOfDay = moment
            .tz(+fromDate, "Asia/Kolkata")
            .startOf("day")
            .valueOf();
          whereClause.transaction_date[sequelize.Op.gte] = startOfDay;
        }

        if (toDate) {
          const endOfDay = moment
            .tz(+toDate, "Asia/Kolkata")
            .endOf("day")
            .valueOf();
          whereClause.transaction_date[sequelize.Op.lte] = endOfDay;
        }
      } else {
        // Default last 30 days
        const defaultFrom = now
          .clone()
          .subtract(30, "days")
          .startOf("day")
          .valueOf();
        const defaultTo = now.clone().endOf("day").valueOf();

        whereClause.transaction_date = {
          [sequelize.Op.gte]: defaultFrom,
          [sequelize.Op.lte]: defaultTo,
        };
      }

      const transactions = await FinancialTransaction.findAll({
        where: whereClause,
        order: [["transaction_date", "DESC"]],
      });

      return transactions;
    } catch (error) {
      console.error(`${TAG} - getFinancialTransactions: `, error);
      throw error;
    }
  },

  createCashTransfer: async (req) => {
    try {
      const { branch_id, company_id, amount, remarks } = req.body;

      const { employee_id } = req;

      // Validate body
      if (!branch_id || !company_id || amount === undefined || amount <= 0) {
        return sendServiceMessage(
          "messages.apis.app.branch.cashTransfer.invalid_body"
        );
      }

      // Validate Branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return sendServiceMessage(
          "messages.apis.app.branch.cashTransfer.invalid_branch"
        );
      }

      // Validate Company
      const company = await Company.findByPk(company_id);
      if (!company) {
        return sendServiceMessage(
          "messages.apis.app.branch.cashTransfer.invalid_company"
        );
      }

      // Check Branch's cash account balance
      const cashAccount = await CashAccount.findOne({ where: { branch_id } });
      if (!cashAccount) {
        return sendServiceMessage(
          "messages.apis.app.branch.cashTransfer.cash_account_missing"
        );
      }

      // Fetch total of all PENDING cash transfers for this branch
      const pendingTransfers = await CashTransfer.findAll({
        where: { branch_id, status: "PENDING" },
      });

      const pendingAmount = pendingTransfers.reduce((sum, transfer) => {
        return sum + parseFloat(transfer.amount);
      }, 0);

      // Available cash = Cash Account Balance - Pending Transfers
      const availableCash = parseFloat(cashAccount.balance) - pendingAmount;

      if (availableCash < parseFloat(amount)) {
        return sendServiceMessage(
          "messages.apis.app.branch.cashTransfer.insufficient_funds"
        );
      }
      // Create the transfer request
      const transfer = await CashTransfer.create({
        branch_id,
        company_id,
        amount,
        status: "PENDING",
        remarks: remarks || null,
        created_by: employee_id || null,
      });

      return sendServiceData(transfer);
    } catch (error) {
      console.error(`${TAG} - createCashTransfer: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.cashTransfer.create_error"
      );
    }
  },
  getCashTransfers: async ({ query }) => {
    try {
      const { branch_id } = query;

      const whereClause = {};
      if (branch_id) {
        whereClause.branch_id = branch_id;
      }

      const transfers = await CashTransfer.findAll({
        where: whereClause,
        include: [
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
          {
            model: Employee,
            as: "employee",
            attributes: ["employee_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["branch_id", "name"],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      return sendServiceData(transfers);
    } catch (error) {
      console.error(`${TAG} - getCashTransfers: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.cashTransfer.list.error"
      );
    }
  },

  approveOrRejectCashTransfer: async (req) => {
    try {
      const { transfer_id, status, remarks } = req.body;

      const { user_id } = req;

      if (!transfer_id || !["APPROVED", "REJECTED"].includes(status)) {
        return sendServiceMessage(
          "messages.apis.app.branch.cashTransfer.invalid_body"
        );
      }

      const transfer = await CashTransfer.findByPk(transfer_id);
      if (!transfer || transfer.status !== "PENDING") {
        return sendServiceMessage(
          "messages.apis.app.branch.cashTransfer.invalid_transfer"
        );
      }

      const cashAccount = await CashAccount.findOne({
        where: { branch_id: transfer.branch_id },
      });
      const bankAccount = await BankAccount.findOne({
        where: { company_id: transfer.company_id },
      });

      if (!cashAccount || !bankAccount) {
        return sendServiceMessage(
          "messages.apis.app.branch.cashTransfer.invalid_accounts"
        );
      }

      if (status === "REJECTED") {
        if (!remarks) {
          return sendServiceMessage(
            "messages.apis.app.branch.cashTransfer.remarks_required_on_reject"
          );
        }

        await transfer.update({
          status,
          remarks,
        });

        return sendServiceData({ transfer });
      }

      // Check for sufficient balance
      if (parseFloat(cashAccount.balance) < parseFloat(transfer.amount)) {
        return sendServiceMessage(
          "messages.apis.app.branch.cashTransfer.insufficient_funds"
        );
      }

      // Create financial transaction
      await FinancialTransaction.create({
        transaction_type: "BRANCH_CASH_TRANSFER",
        amount: transfer.amount,
        transaction_date: moment().tz("Asia/Kolkata").valueOf(),
        payment_method: "CASH",
        reference_number: transfer_id,
        employee_id: null,
        branch_id: transfer.branch_id,
        company_id: transfer.company_id,
        bank_account_id: bankAccount.bank_account_id,
        description: `Cash transfer from Branch ID ${transfer.branch_id}`,
      });

      // Update balances
      await cashAccount.update({
        balance: +(
          parseFloat(cashAccount.balance) - parseFloat(transfer.amount)
        ).toFixed(2),
        last_updated_by: user_id,
      });

      await bankAccount.update({
        balance: +(
          parseFloat(bankAccount.balance) + parseFloat(transfer.amount)
        ).toFixed(2),
      });

      // Update transfer record
      await transfer.update({
        status,
        remarks: remarks || null,
      });

      return sendServiceData({ transfer });
    } catch (error) {
      console.error(`${TAG} - approveOrRejectCashTransfer: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.cashTransfer.approval_error"
      );
    }
  },

  updateInvoicePrefix: async ({ body }) => {
    try {
      const { branch_id, invoice_prefix } = body;

      // Validate input
      if (!branch_id || !invoice_prefix) {
        return sendServiceMessage(
          "messages.apis.app.branch.create.invalid_body"
        );
      }

      // Validate Branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return sendServiceMessage(
          "messages.apis.app.branch.create.invalid_branch"
        );
      }

      // Update Invoice Prefix
      await branch.update({ invoice_prefix });

      return sendServiceData(branch);
    } catch (error) {
      console.error(`${TAG} - updateInvoicePrefix: `, error);
      return sendServiceMessage(
        "messages.apis.app.branch.invoice_prefix.error"
      );
    }
  },
};
