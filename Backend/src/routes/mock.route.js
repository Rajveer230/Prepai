const { Router } = require("express");
const mockController = require("../controller/mock.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const mockRouter = Router();

mockRouter.post("/start/:reportId",     authMiddleware, mockController.startMockSession);
mockRouter.post("/submit/:sessionId",   authMiddleware, mockController.submitAnswer);
mockRouter.get("/:sessionId",           authMiddleware, mockController.getSession);

module.exports = mockRouter;
