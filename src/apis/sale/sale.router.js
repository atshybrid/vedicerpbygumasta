const Router = require("express").Router;
const controller = require("./sale.controller");

const {
  validateUser,
  validateAdminOrManager,
  validateBiller,
  validateManagerOrBiller,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateUser, controller.listSales);
router.get("/cash-total/:timestamp", validateUser, controller.getCashTotal);
router.get("/handovers", validateUser, controller.getHandoverRequests);
router.get(
  "/handovers/:handover_id",
  validateUser,
  controller.getHandoverDetails
);
router.get("/return", validateUser, controller.getSaleReturns);
router.get("/return/:return_id", validateUser, controller.getSaleReturn);
router.get("/:sale_id", validateUser, controller.getSale);
router.get("/by_branch", validateUser, controller.listSalesByBranch);
router.get("/by_customer", validateUser, controller.listSalesByCustomer);
router.get("/by_pending_payments", controller.listSalesByPendingPayments);
router.get("/", validateUser, controller.listSales);
router.post("/", validateUser, controller.createSale);
router.post("/return", validateUser, controller.createSaleReturn);
router.post("/handover", validateUser, controller.createHandoverRequest);
router.put("/:sale_id", validateUser, controller.updateSale);
router.put(
  "/handover/:handover_id",
  validateAdminOrManager,
  controller.approveHandoverRequest
);
router.delete("/:sale_id", validateAdminOrManager, controller.deleteSale);

module.exports = router;
