const Router = require("express").Router;
const controller = require("./item.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listItems);
router.get("/:item_id", controller.getItem);
router.get("/search/:keyword", controller.searchItems);
router.post("/", controller.createItem);
router.put("/:item_id", controller.updateItem);
router.put("/:item_id/status", controller.updateItemStatus);
router.put("/bulk", controller.bulkUpdateItems);
router.delete("/:item_id", controller.deleteItem);

module.exports = router;
