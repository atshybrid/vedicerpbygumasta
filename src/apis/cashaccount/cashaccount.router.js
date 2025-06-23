const Router = require("express").Router;
const controller = require("./cashaccount.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listCashAccounts);
router.get("/:account_id", controller.getCashAccount);
router.get("/:account_id/balance", controller.getCashAccountBalance);
router.post("/", controller.createCashAccount);
router.put("/:account_id", controller.updateCashAccount);
router.put("/:account_id/balance", controller.updateCashAccountBalance);
router.delete("/:account_id", controller.deleteCashAccount);

module.exports = router;
