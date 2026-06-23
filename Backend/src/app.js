const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

const allowedOrigins = [
    /^http:\/\/localhost:\d+$/,
    /\.vercel\.app$/,
    /\.netlify\.app$/,
    /\.onrender\.com$/,
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(pattern => pattern.test(origin))) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

const authRouter = require("./routes/auth.route");
app.use("/api/auth", authRouter);

const interviewRouter = require("./routes/interview.route");
app.use("/api/interview", interviewRouter);

const mockRouter = require("./routes/mock.route");
app.use("/api/mock", mockRouter);

const userRouter = require("./routes/user.route");
app.use("/api/user", userRouter);

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

module.exports = app;