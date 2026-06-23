const mongoose = require("mongoose");

const mockQuestionSchema = new mongoose.Schema({
    question:         { type: String, required: true },
    type:             { type: String, enum: ["technical", "behavioral"], required: true },
    modelAnswer:      { type: String, required: true },
    intention:        { type: String, required: true },
    userAnswer:       { type: String, default: "" },
    score:            { type: Number, default: null },
    feedback:         { type: String, default: "" },
    keyPoints:        [{ type: String }],
    answered:         { type: Boolean, default: false },
    nervousnessScore: { type: Number, default: null },
    fillerCount:      { type: Number, default: 0 },
    wpm:              { type: Number, default: 0 },
}, { _id: false });

const mockInterviewSchema = new mongoose.Schema(
    {
        userId:       { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        reportId:     { type: mongoose.Schema.Types.ObjectId, ref: "interview", required: true },
        reportTitle:  { type: String, required: true },
        status:       { type: String, enum: ["active", "completed"], default: "active" },
        currentIndex: { type: Number, default: 0 },
        questions:    [mockQuestionSchema],
        overallScore: { type: Number, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("mockinterview", mockInterviewSchema);
