const { Router } = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware");
const {
    generateReportController,
    getAllReportsController,
    getReportByIdController,
    generateResumePdfController,
} = require("../controller/interview.controller");

const interviewRouter = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") cb(null, true);
        else cb(new Error("Only PDF files are allowed"), false);
    },
});

interviewRouter.use(authMiddleware);

interviewRouter.post("/", upload.single("resume"), generateReportController);
interviewRouter.get("/", getAllReportsController);
interviewRouter.get("/report/:id", getReportByIdController);
interviewRouter.post("/resume/pdf/:id", generateResumePdfController);

module.exports = interviewRouter;
