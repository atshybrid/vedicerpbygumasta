const Router = require("express").Router;
const controller = require("./vendor.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listVendors);
router.get("/:vendor_id", controller.getVendor);
router.get("/by_type", controller.listVendorsByType);
router.post("/", controller.createVendor);
router.post("/deduplicate", controller.deduplicateVendors);
router.post("/normalize", controller.normalizeVendorData);
router.put("/:vendor_id", controller.updateVendor);
router.delete("/:vendor_id", controller.deleteVendor);

module.exports = router;
