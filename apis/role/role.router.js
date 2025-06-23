const Router = require("express").Router;
const controller = require("./role.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listRoles);
router.get("/:role_id", controller.getRole);
router.post("/", controller.createRole);
router.post("/user/:user_id", controller.assignRoleToUser);
router.post("/:role_id/permissions", controller.addPermissionsToRole);
router.put("/:role_id", controller.updateRole);
router.delete("/:role_id", controller.deleteRole);

module.exports = router;
