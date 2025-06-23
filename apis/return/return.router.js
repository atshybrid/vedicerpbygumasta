const Router = require("express").Router;
const controller = require("./return.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listReturns);
router.get("/pending", controller.listReturnsPending);
router.get("/:return_id", controller.getReturn);
router.post("/", controller.createReturn);
router.put("/:return_id", controller.updateReturn);
router.put("/:return_id/status", controller.updateReturnStatus);
router.delete("/:return_id", controller.deleteReturn);

module.exports = router;
