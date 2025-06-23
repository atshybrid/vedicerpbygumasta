const Router = require("express").Router;
const controller = require("./category.controller");

const {
  validateUser,
  validateAdminOrManager,
} = require("../../../middlewares/authorization");

const router = Router({ mergeParams: true });

router.get("/", validateUser, controller.listCategorys);
router.get("/:category_id", validateUser, controller.getCategory);
router.get("/tree", controller.getRecursiveCategories);
router.post("/", validateAdminOrManager, controller.createCategory);
router.put("/:category_id", validateAdminOrManager, controller.updateCategory);
router.get(
  "/:category_id/items_count",
  validateUser,
  controller.getItemCountByCategory
);
router.delete(
  "/:category_id",
  validateAdminOrManager,
  controller.deleteCategory
);

module.exports = router;
