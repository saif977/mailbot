const express=require("express");
const router=express.Router();
const authController=require("./controllers/authController")
const cron=require("./cron");

router.get("",authController.login);
router.get("/oauth2callback",authController.oauth2callback);
// router.get("/start",authController.start);
router.get("/stop",authController.stop);

module.exports=router;