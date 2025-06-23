const Router = require("express").Router;
const controller = require("./sale.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listSales);
router.get("/:sale_id", controller.getSale);
router.get("/by_branch", controller.listSalesByBranch);
router.get("/by_customer", controller.listSalesByCustomer);
router.get("/by_pending_payments", controller.listSalesByPendingPayments);
router.post("/", controller.createSale);
router.put("/:sale_id", controller.updateSale);
router.delete("/:sale_id", controller.deleteSale);

module.exports = router;
