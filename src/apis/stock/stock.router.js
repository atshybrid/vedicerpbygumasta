const Router = require("express").Router;
const controller = require("./stock.controller");

const {
  validateUser,
  validateAdminOrManager,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateUser, controller.listStocks);
router.get("/by_branch/:branch_id", validateUser, controller.getBranchStock);
router.get(
  "/by_branch-search/:branch_id",
  validateUser,
  controller.getBranchItemBySearch
);
router.get("/by_company/:company_id", validateUser, controller.getCompanyStock);
router.get("/by_item/:item_id", validateUser, controller.listStocksByItem);
router.get("/request", validateAdminOrManager, controller.getStockRequests);
router.get("/transfers", validateAdminOrManager, controller.getStockTransfers);
router.get("/:stock_id", validateUser, controller.getStock);
router.post("/company", validateAdminOrManager, controller.createCompanyStock);
router.post("/branch", validateAdminOrManager, controller.createBranchStock);
router.post("/transfer", validateAdminOrManager, controller.transferStock);
router.post("/request", validateAdminOrManager, controller.createStockRequest);
router.post("/", validateAdminOrManager, controller.createStock);
router.put(
  "/acknowledge-transfer",
  validateAdminOrManager,
  controller.acknowledgeStockTransfer
);
router.put(
  "/request-status",
  validateAdminOrManager,
  controller.updateStockRequestStatus
);
router.put("/:stock_id", validateAdminOrManager, controller.updateStock);
router.delete("/:stock_id", validateAdminOrManager, controller.deleteStock);

module.exports = router;
