const Router = require("express").Router;
const controller = require("./user.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listUsers);
router.get("/:user_id", controller.getUser);
router.get("/:user_id/history", controller.getUserLoginHistory);
router.post("/", controller.createUser);
router.put("/:user_id", controller.updateUser);
router.put("/:user_id/activate", controller.changeUserState);
router.put("/:user_id/mpin", controller.resetMPIN);
router.delete("/:user_id", controller.deleteUser);

module.exports = router;
