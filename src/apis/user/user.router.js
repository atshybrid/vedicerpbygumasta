const Router = require("express").Router;
const controller = require("./user.controller");
const { upload } = require("../../../middlewares/upload");

const {
  validateAdminOrManager,
  validateUser,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateAdminOrManager, controller.listUsers);
router.get("/:user_id", validateAdminOrManager, controller.getUser);
router.get(
  "/:user_id/history",
  validateAdminOrManager,
  controller.getUserLoginHistory
);
router.post("/", validateAdminOrManager, controller.createUser);
router.post(
  "/image",
  validateUser,
  upload.single("image"),
  controller.uploadImage
);
router.put("/:user_id", validateAdminOrManager, controller.updateUser);
router.put(
  "/:user_id/activate",
  validateAdminOrManager,
  controller.changeUserState
);
router.put("/:user_id/mpin", validateAdminOrManager, controller.resetMPIN);
router.delete("/:user_id", validateAdminOrManager, controller.deleteUser);

module.exports = router;
