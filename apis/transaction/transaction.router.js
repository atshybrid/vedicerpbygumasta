const Router = require("express").Router;
const controller = require("./transaction.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listTransactions);
router.get("/by_branch/:branch_id", controller.listTransactionsByBranch);
router.get("/by_customer/:customer_id", controller.listTransactionsByCustomer);
router.get("/by_vendor/:vendor_id", controller.listTransactionsByVendor);
router.get("/:transaction_id", controller.getTransaction);
router.post("/", controller.createTransaction);
router.put("/:transaction_id", controller.updateTransaction);
router.delete("/:transaction_id", controller.deleteTransaction);

module.exports = router;
