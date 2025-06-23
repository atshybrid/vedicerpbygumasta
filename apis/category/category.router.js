const Router = require("express").Router;
const controller = require("./category.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listCategorys);
router.get("/:category_id", controller.getCategory);
router.get("/tree", controller.getRecursiveCategories);
router.post("/", controller.createCategory);
router.put("/:category_id", controller.updateCategory);
router.get("/:category_id/items_count", controller.getItemCountByCategory);
router.delete("/:category_id", controller.deleteCategory);

module.exports = router;
