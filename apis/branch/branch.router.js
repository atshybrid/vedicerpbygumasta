const Router = require("express").Router;
const controller = require("./branch.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listBranches);
router.get("/by_manager/:manager_id", controller.listBranchesByManager);
router.get("/by_company/:company_id", controller.listBranchesByCompany);
router.get("/:branch_id", controller.getBranch);
router.get("/:branch_id", controller.getBranch);
router.post("/", controller.createBranch);
router.put("/:branch_id", controller.updateBranch);
router.delete("/:branch_id", controller.deleteBranch);

module.exports = router;
