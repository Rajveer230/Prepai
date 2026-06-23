const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

userRouter.get("/stats",           authMiddleware, userController.getProfileStats);
userRouter.put("/change-password", authMiddleware, userController.changePassword);

module.exports = userRouter;
