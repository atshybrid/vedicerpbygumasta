const Router = require("express").Router;
const controller = require("./branch.controller");

const {
  validateUser,
  validateAdminOrManager,
  validateAdmin,
  validateManager,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateUser, controller.listBranches);
router.get(
  "/by_manager/:manager_id",
  validateAdminOrManager,
  controller.listBranchesByManager
);
router.get(
  "/by_company/:company_id",
  validateAdminOrManager,
  controller.listBranchesByCompany
);
router.get("/expense", validateAdminOrManager, controller.listExpenses);
router.get(
  "/expense/:expense_id",
  validateAdminOrManager,
  controller.getExpense
);
router.get(
  "/cash-transfer",
  validateAdminOrManager,
  controller.getCashTransfers
);
router.get(
  "/petty-cash/:branch_id",
  validateAdminOrManager,
  controller.getPettyCashBalance
);
router.get(
  "/cash-account/:branch_id",
  validateAdminOrManager,
  controller.getCashAccountBalance
);
router.get(
  "/financial-transaction",
  validateAdminOrManager,
  controller.getFinancialTransactions
);
router.get("/:branch_id", validateAdminOrManager, controller.getBranch);
router.post("/expense", validateAdminOrManager, controller.createExpense);
router.post("/", validateAdmin, controller.createBranch);
router.post("/cash-transfer", validateManager, controller.createCashTransfer);
router.put("/add-balance", validateAdmin, controller.addBalanceToPettyCash);
router.put("/expense", validateAdmin, controller.updateExpenseStatus);
router.put("/invoice-prefix", validateAdmin, controller.updateInvoicePrefix);
router.put(
  "/cash-transfer",
  validateAdminOrManager,
  controller.approveOrRejectCashTransfer
);
router.put("/:branch_id", validateAdmin, controller.updateBranch);
router.delete("/:branch_id", validateAdmin, controller.deleteBranch);

module.exports = router;
