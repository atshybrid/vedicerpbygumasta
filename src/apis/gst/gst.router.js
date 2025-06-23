const Router = require("express").Router;
const controller = require("./gst.controller");

const {
  validateAdmin,
  validateUser,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateUser, controller.listGsts);
router.get("/:gst_id", validateUser, controller.getGst);
router.post("/", validateAdmin, controller.createGst);
router.post("/archive", validateAdmin, controller.archiveOldGSTRates);
router.put("/:gst_id", validateAdmin, controller.updateGst);
router.put(
  "/:gst_id/items/apply",
  validateAdmin,
  controller.applyGSTToMultipleItems
);
router.delete("/:gst_id", validateAdmin, controller.deleteGst);

module.exports = router;
