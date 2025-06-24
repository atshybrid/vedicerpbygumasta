const Router = require("express").Router;
const controller = require("./employee.controller");

const {
  validateAdmin,
  validateAdminOrManager,
  validateUser,
  validateBiller,
  validateManagerOrBiller,
  validateManager,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateUser, controller.listEmployees);
router.get("/attendance", validateUser, controller.getAttendance);
router.get("/checkInStatus/:timestamp", validateUser, controller.checkInStatus);
router.get("/analytics/biller", validateBiller, controller.getBillerAnalytics);
router.get(
  "/analytics/manager",
  validateManager,
  controller.getManagerAnalytics
);
router.get("/analytics/admin", validateAdmin, controller.getAdminAnalytics);
router.get("/:employee_id", validateUser, controller.getEmployee);
router.post("/", validateAdminOrManager, controller.createEmployee);
router.post("/checkIn", validateManagerOrBiller, controller.checkIn);
router.post("/attendance", validateAdminOrManager, controller.markAttendance);
router.put("/checkOut", validateManagerOrBiller, controller.checkOut);
router.put("/:employee_id", validateAdminOrManager, controller.updateEmployee);
router.delete("/:employee_id", validateAdmin, controller.deleteEmployee);

module.exports = router;
