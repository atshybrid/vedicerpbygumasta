const Router = require("express").Router;
const controller = require("./variation.controller");
const {
  validateUser,
  validateAdminOrManager,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/search", validateUser, controller.searchVariations);
router.get("/:variation_id", validateUser, controller.getVariation);
router.get("/by_item/:item_id", validateUser, controller.listVariations);
router.post("/", validateAdminOrManager, controller.createVariation);
router.post("/bulk", validateAdminOrManager, controller.bulkCreateVariations);
router.put(
  "/:variation_id",
  validateAdminOrManager,
  controller.updateVariation
);
router.put(
  "/:variation_id/stock",
  validateAdminOrManager,
  controller.adjustStock
);
router.delete(
  "/:variation_id",
  validateAdminOrManager,
  controller.deleteVariation
);

module.exports = router;
