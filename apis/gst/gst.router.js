const Router = require("express").Router;
const controller = require("./gst.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listGsts);
router.get("/:gst_id", controller.getGst);
router.post("/", controller.createGst);
router.post("/archive", controller.archiveOldGSTRates);
router.put("/:gst_id", controller.updateGst);
router.put("/:gst_id/items/apply", controller.applyGSTToMultipleItems);
router.delete("/:gst_id", controller.deleteGst);

module.exports = router;
