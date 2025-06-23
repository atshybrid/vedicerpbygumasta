const Router = require("express").Router;
const controller = require("./branchitem.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listBranchItems);
router.get("/by_branch/:branch_id", controller.listBranchItemsByBranch);
router.get("/by_low_stock", controller.listBranchItemsLowAtStock);
router.get("/:item_id", controller.getBranchItem);
router.post("/", controller.createBranchItem);
router.put("/:item_id", controller.updateBranchItem);
router.put("/:item_id/stock", controller.updateBranchItemStock);
router.delete("/:item_id", controller.deleteBranchItem);

module.exports = router;
