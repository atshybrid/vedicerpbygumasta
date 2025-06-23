const Router = require("express").Router;
const controller = require("./stock.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listStocks);
router.get("/by_branch/:branch_id", controller.listStocksByBranch);
router.get("/by_item/:item_id", controller.listStocksByItem);
router.get("/", controller.listStocks);
router.get("/:stock_id", controller.getStock);
router.post("/", controller.createStock);
router.put("/:stock_id", controller.updateStock);
router.delete("/:stock_id", controller.deleteStock);

module.exports = router;
