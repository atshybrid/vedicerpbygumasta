const Router = require("express").Router;
const controller = require("./company.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listCompanys);
router.get("/:company_id", controller.getCompany);
router.post("/", controller.createCompany);
router.put("/:company_id", controller.updateCompany);
router.delete("/:company_id", controller.deleteCompany);

module.exports = router;
