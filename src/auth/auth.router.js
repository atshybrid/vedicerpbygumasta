const Router = require("express").Router;
const controller = require("./auth.controller");

const router = Router({ mergeParams: true });

router.get("/mpin-status/:phoneNo", controller.getMpinStatus);
router.post("/signIn", controller.signIn);
router.post("/sendOtp", controller.generateAndSendOTP);
router.post("/verifyOtp", controller.verifyOTP);
router.post("/resendOtp", controller.resendOTP);
router.post("/forgotPassword", controller.forgotPassword);

module.exports = router;
