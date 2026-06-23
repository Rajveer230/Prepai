const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true },
}, { _id: false });

const skillGapSchema = new mongoose.Schema({
    skill: { type: String, required: true },
    severity: { type: String, enum: ["high", "medium", "low"], required: true },
}, { _id: false });

const roadmapDaySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    focus: { type: String, required: true },
    tasks: [{ type: String }],
}, { _id: false });

const interviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        title: { type: String, required: true },
        jobDescription: { type: String, required: true },
        selfDescription: { type: String, default: "" },
        resumeText: { type: String, default: "" },
        matchScore: { type: Number, required: true, min: 0, max: 100 },
        skillGaps: [skillGapSchema],
        technicalQuestions: [questionSchema],
        behavioralQuestions: [questionSchema],
        preparationPlan: [roadmapDaySchema],
    },
    { timestamps: true }
);

const interviewModel = mongoose.model("interview", interviewSchema);
module.exports = interviewModel;
