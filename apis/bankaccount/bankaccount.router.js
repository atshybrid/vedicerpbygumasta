const Router = require("express").Router;
const controller = require("./bankaccount.controller");

const router = Router({ mergeParams: true });

router.get("/", controller.listBankAccounts);
router.get("/by_company/:company_id", controller.listBankAccountsByCompany);
router.get("/:bank_id", controller.getBankAccount);
router.post("/", controller.createBankAccount);
router.put("/:bank_id", controller.updateBankAccount);
router.delete("/:bank_id", controller.deleteBankAccount);
router.post("/:bank_id/funds/transfer", controller.transferFunds);

module.exports = router;
