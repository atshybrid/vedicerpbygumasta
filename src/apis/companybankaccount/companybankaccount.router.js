const Router = require("express").Router;
const controller = require("./companybankaccount.controller");
const { validateAdmin } = require("../../../middlewares/authorization");
const router = Router({ mergeParams: true });

router.get("/", validateAdmin, controller.listBankAccountsByCompanyId);

module.exports = router;
