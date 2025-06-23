const Router = require("express").Router;
const controller = require("./customer.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listCustomers);
router.get("/:customer_id", controller.getCustomer);
router.get("/without_gst", controller.listCustomersWithoutGst);
router.post("/", controller.createCustomer);
router.post("/deduplicate", controller.deduplicateCustomers);
router.post("/normalize", controller.normalizeCustomerData);
router.put("/:customer_id", controller.updateCustomer);
router.delete("/:customer_id", controller.deleteCustomer);

module.exports = router;
