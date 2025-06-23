const Router = require("express").Router;
const controller = require("./item.controller");

const {
  validateUser,
  validateAdminOrManager,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateUser, controller.listItems);
router.get("/search", validateUser, controller.searchItems);
router.get("/:item_id", validateUser, controller.getItem);
router.post("/", validateAdminOrManager, controller.createItem);
router.put("/:item_id", validateAdminOrManager, controller.updateItem);
router.put(
  "/:item_id/status",
  validateAdminOrManager,
  controller.updateItemStatus
);
router.put("/bulk", validateAdminOrManager, controller.bulkUpdateItems);
router.delete("/:item_id", validateAdminOrManager, controller.deleteItem);

module.exports = router;
