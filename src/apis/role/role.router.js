const Router = require("express").Router;
const controller = require("./role.controller");
const {
  validateAdmin,
  validateAdminOrManager,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateAdminOrManager, controller.listRoles);
router.get("/:role_id", validateAdminOrManager, controller.getRole);
router.post("/", validateAdminOrManager, controller.createRole);
router.post(
  "/user/:user_id",
  validateAdminOrManager,
  controller.assignRoleToUser
);
router.post(
  "/:role_id/permissions",
  validateAdminOrManager,
  controller.addPermissionsToRole
);
router.put("/:role_id", validateAdminOrManager, controller.updateRole);
router.delete("/:role_id", validateAdminOrManager, controller.deleteRole);

module.exports = router;
