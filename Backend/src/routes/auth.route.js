const { Router } = require("express");
const authController = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = Router();

authRouter.post("/register",    authController.registerUsercontroller);
authRouter.post("/login",       authController.loginUsercontroller);
authRouter.post("/logout",      authController.logoutUsercontroller);
authRouter.get("/get-me",       authMiddleware, authController.getMecontroller);

module.exports = authRouter;
