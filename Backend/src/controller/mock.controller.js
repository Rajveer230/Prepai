const Groq = require("groq-sdk");
const mockInterviewModel = require("../model/mockInterview.model");
const interviewModel = require("../model/interview.model");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const startMockSession = async (req, res) => {
    try {
        const { reportId } = req.params;
        const userId = req.user.id;

        // Return existing active session if found
        const existing = await mockInterviewModel.findOne({ userId, reportId, status: "active" });
        if (existing) {
            return res.status(200).json({ message: "Resuming existing session", session: existing });
        }

        const report = await interviewModel.findOne({ _id: reportId, userId });
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const technicalQs = report.technicalQuestions.map(q => ({
            question: q.question,
            type: "technical",
            modelAnswer: q.answer,
            intention: q.intention,
        }));
        const behavioralQs = report.behavioralQuestions.map(q => ({
            question: q.question,
            type: "behavioral",
            modelAnswer: q.answer,
            intention: q.intention,
        }));

        const session = await mockInterviewModel.create({
            userId,
            reportId,
            reportTitle: report.title,
            questions: [...technicalQs, ...behavioralQs],
        });

        res.status(201).json({ message: "Mock interview started", session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const submitAnswer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userAnswer, nervousnessScore, fillerCount, wpm } = req.body;
        const userId = req.user.id;

        const session = await mockInterviewModel.findOne({ _id: sessionId, userId });
        if (!session) return res.status(404).json({ message: "Session not found" });
        if (session.status === "completed") return res.status(400).json({ message: "Session already completed" });

        const currentQ = session.questions[session.currentIndex];

        const prompt = `You are an expert interviewer evaluating a candidate's answer.

Question: ${currentQ.question}
Type: ${currentQ.type}
Intention: ${currentQ.intention}
Model Answer: ${currentQ.modelAnswer}
Candidate's Answer: ${userAnswer || "(skipped - no answer provided)"}

Return ONLY valid JSON (no markdown, no explanation):
{
  "score": <number 0-10>,
  "feedback": "2-3 sentence constructive feedback on the answer",
  "keyPoints": ["point 1", "point 2", "point 3"]
}

Rules:
- score 0 if skipped or empty answer
- keyPoints: mix of what they got right and what they missed (3-4 points)`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 512,
            temperature: 0.4,
        });

        const raw = response.choices[0].message.content.trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI did not return valid JSON");
        const evaluation = JSON.parse(jsonMatch[0]);

        session.questions[session.currentIndex].userAnswer       = userAnswer || "";
        session.questions[session.currentIndex].score            = evaluation.score;
        session.questions[session.currentIndex].feedback         = evaluation.feedback;
        session.questions[session.currentIndex].keyPoints        = evaluation.keyPoints;
        session.questions[session.currentIndex].answered         = true;
        session.questions[session.currentIndex].nervousnessScore = nervousnessScore ?? null;
        session.questions[session.currentIndex].fillerCount      = fillerCount ?? 0;
        session.questions[session.currentIndex].wpm              = wpm ?? 0;

        const isLast = session.currentIndex === session.questions.length - 1;

        if (isLast) {
            const scores = session.questions.map(q => q.score ?? 0);
            session.overallScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10);
            session.status = "completed";
        } else {
            session.currentIndex += 1;
        }

        session.markModified("questions");
        await session.save();

        res.status(200).json({
            message: isLast ? "Interview completed!" : "Answer submitted",
            evaluation,
            isCompleted: isLast,
            overallScore: isLast ? session.overallScore : null,
            nextIndex: isLast ? null : session.currentIndex,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await mockInterviewModel.findOne({ _id: sessionId, userId });
        if (!session) return res.status(404).json({ message: "Session not found" });

        res.status(200).json({ message: "Session fetched", session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { startMockSession, submitAnswer, getSession };
