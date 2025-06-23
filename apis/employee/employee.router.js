const Router = require("express").Router;
const controller = require("./employee.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listEmployees);
router.get("/:employee_id", controller.getEmployee);
router.post("/", controller.createEmployee);
router.put("/:employee_id", controller.updateEmployee);
router.delete("/:employee_id", controller.deleteEmployee);

module.exports = router;
