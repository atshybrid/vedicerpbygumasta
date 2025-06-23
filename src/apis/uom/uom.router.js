const Router = require("express").Router;
const controller = require("./uom.controller");

const {
  validateAdmin,
  validateUser,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateUser, controller.listUoms);
router.get("/report", validateAdmin, controller.getUOMUsageReport);
router.get("/:uom_id", validateUser, controller.getUom);
router.post("/", validateAdmin, controller.createUom);
router.post("/bulk", validateAdmin, controller.bulkCreateUOMs);
router.put("/:uom_id", validateAdmin, controller.updateUom);
router.put("/:uom_id/status", validateAdmin, controller.updateUOMStatus);
router.delete("/:uom_id", validateAdmin, controller.deleteUom);

module.exports = router;
