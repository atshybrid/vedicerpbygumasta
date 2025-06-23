const Router = require("express").Router;
const controller = require("./variation.controller");

const router = Router({ mergeParams: true });

router.get("/:variation_id", controller.getVariation);
router.get("/by_item/:item_id", controller.listVariations);
router.post("/", controller.createVariation);
router.post("/bulk", controller.bulkCreateVariations);
router.put("/:variation_id", controller.updateVariation);
router.put("/:variation_id/stock", controller.adjustStock);
router.delete("/:variation_id", controller.deleteVariation);

module.exports = router;
