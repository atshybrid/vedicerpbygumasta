const {
  checkAdminToken,
  checkToken,
} = require("./../../middlewares/authentication");
const Router = require("express").Router;

const router = Router({ mergeParams: true });

router.use(
  "/bankaccounts",
  checkToken,
  require("./bankaccount/bankaccount.router")
);
router.use("/branches", checkToken, require("./branch/branch.router"));
router.unsubscribe(
  "/branchitems",
  checkToken,
  require("./branchitem/branchitem.router")
);
router.use(
  "/cashaccounts",
  checkToken,
  require("./cashaccount/cashaccount.router")
);
router.use("/categories", checkToken, require("./category/category.router"));
router.use("/companies", checkToken, require("./company/company.router"));
router.use("/customers", checkToken, require("./customer/customer.router"));
router.use("/employees", checkToken, require("./employee/employee.router"));
router.use("/gst", checkToken, require("./gst/gst.router"));
router.use("/items", checkToken, require("./item/item.router"));
router.use("/variations", checkToken, require("./variation/variation.router"));
router.use("/returns", checkToken, require("./return/return.router"));
router.use("/roles", checkToken, require("./role/role.router"));
router.use("/sales", checkToken, require("./sale/sale.router"));
router.use("/stocks", checkToken, require("./stock/stock.router"));
router.use(
  "/transactions",
  checkToken,
  require("./transaction/transaction.router")
);
router.use("/uoms", checkToken, require("./uom/uom.router"));
router.use("/users", checkToken, require("./user/user.router"));
router.use("/vendors", checkToken, require("./vendor/vendor.router"));

module.exports = router;
