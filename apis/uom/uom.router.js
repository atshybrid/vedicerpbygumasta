const Router = require("express").Router;
const controller = require("./uom.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listUoms);
router.get("/report", controller.getUOMUsageReport);
router.get("/:uom_id", controller.getUom);
router.post("/", controller.createUom);
router.post("/bulk", controller.bulkCreateUOMs);
router.put("/:uom_id", controller.updateUom);
router.put("/:uom_id/status", controller.updateUOMStatus);
router.delete("/:uom_id", controller.deleteUom);

module.exports = router;
