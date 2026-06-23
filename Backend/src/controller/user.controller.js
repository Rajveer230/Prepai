const userModel = require("../model/user.model");
const interviewModel = require("../model/interview.model");
const mockInterviewModel = require("../model/mockInterview.model");
const bcrypt = require("bcryptjs");

const getProfileStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId).select("username email createdAt");
        if (!user) return res.status(404).json({ message: "User not found" });

        const totalReports = await interviewModel.countDocuments({ userId });

        const completedMocks = await mockInterviewModel
            .find({ userId, status: "completed" })
            .select("overallScore questions createdAt reportTitle")
            .sort({ createdAt: 1 });

        const totalMocks = completedMocks.length;

        const scores = completedMocks
            .filter(m => m.overallScore !== null)
            .map(m => m.overallScore);

        const avgScore = scores.length
            ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
            : null;

        const bestScore = scores.length ? Math.max(...scores) : null;

        // Score trend — last 10 completed sessions
        const scoreTrend = completedMocks.slice(-10).map((m, i) => ({
            session: `#${i + 1}`,
            score: m.overallScore ?? 0,
            date: new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            title: m.reportTitle,
        }));

        // Technical vs Behavioral question-level breakdown (avg out of 10, converted to %)
        let techScores = [], behavScores = [];
        completedMocks.forEach(mock => {
            mock.questions.forEach(q => {
                if (q.score !== null) {
                    if (q.type === "technical") techScores.push(q.score);
                    else behavScores.push(q.score);
                }
            });
        });

        const avgTech = techScores.length
            ? parseFloat(((techScores.reduce((a, b) => a + b, 0) / techScores.length) * 10).toFixed(1))
            : 0;
        const avgBehav = behavScores.length
            ? parseFloat(((behavScores.reduce((a, b) => a + b, 0) / behavScores.length) * 10).toFixed(1))
            : 0;

        // Recent reports for quick reference
        const recentReports = await interviewModel
            .find({ userId })
            .select("title matchScore createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            user: {
                username: user.username,
                email: user.email,
                memberSince: user.createdAt,
            },
            stats: {
                totalReports,
                totalMocks,
                avgScore,
                bestScore,
                scoreTrend,
                breakdown: [
                    { name: "Technical", score: avgTech, fill: "#ff2d78" },
                    { name: "Behavioral", score: avgBehav, fill: "#58a6ff" },
                ],
                recentReports,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({ message: "Both fields are required" });

        if (newPassword.length < 6)
            return res.status(400).json({ message: "New password must be at least 6 characters" });

        const user = await userModel.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Current password is incorrect" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getProfileStats, changePassword };
