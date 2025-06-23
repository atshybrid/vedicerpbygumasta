const Router = require("express").Router;
const controller = require("./customer.controller");

const { validateUser } = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateUser, controller.listCustomers);
router.get("/gst-details", validateUser, controller.fetchGSTDetails);
router.get("/:customer_id", validateUser, controller.getCustomer);
router.get("/without_gst", validateUser, controller.listCustomersWithoutGst);
router.post("/", validateUser, controller.createCustomer);
router.post("/deduplicate", validateUser, controller.deduplicateCustomers);
router.post("/normalize", validateUser, controller.normalizeCustomerData);
router.put("/:customer_id", validateUser, controller.updateCustomer);
router.delete("/:customer_id", validateUser, controller.deleteCustomer);

module.exports = router;
