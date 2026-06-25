const Groq = require("groq-sdk");
const pdfParse = require("pdf-parse");
const PDFDocument = require("pdfkit");
const interviewModel = require("../model/interview.model");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Helpers ───────────────────────────────────────────────────────────────────

async function extractTextFromPdf(buffer) {
    const data = await pdfParse(buffer);
    return data.text;
}

async function generateInterviewDataFromGroq({ jobDescription, profileText }) {
    const prompt = `You are an expert technical recruiter and interview coach. Based on the job description and candidate profile below, generate a comprehensive interview preparation report.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
${profileText}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation, no code block):
{
  "title": "Job title extracted from the description (short, e.g. 'Senior React Developer at Google')",
  "matchScore": <number 0-100 reflecting how well the candidate matches>,
  "skillGaps": [
    { "skill": "skill name", "severity": "high" | "medium" | "low" }
  ],
  "technicalQuestions": [
    { "question": "...", "intention": "What the interviewer is testing", "answer": "A strong model answer" }
  ],
  "behavioralQuestions": [
    { "question": "...", "intention": "What the interviewer is testing", "answer": "A strong model answer using STAR method" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "Topic to focus on", "tasks": ["task 1", "task 2", "task 3"] }
  ]
}

Rules:
- Generate exactly 12 technical questions
- Generate exactly 8 behavioral questions
- Generate a 10-day preparation plan
- matchScore should be honest based on the candidate profile vs job requirements
- skillGaps should list 4-6 skills the candidate is missing or weak in
- Keep answers concise but complete (2-4 sentences)`;

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 8192,
        temperature: 0.7,
    });

    const raw = response.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Groq did not return valid JSON");
    return JSON.parse(jsonMatch[0]);
}

// ── Controllers ───────────────────────────────────────────────────────────────

const generateReportController = async (req, res) => {
    try {
        const { jobDescription, selfDescription } = req.body;
        const resumeFile = req.file;

        if (!jobDescription || jobDescription.trim().length < 20) {
            return res.status(400).json({ message: "Job description is required (min 20 characters)" });
        }

        let resumeText = "";
        if (resumeFile) {
            resumeText = await extractTextFromPdf(resumeFile.buffer);
        }

        const profileText = resumeText
            ? `Resume:\n${resumeText}`
            : selfDescription
                ? `Self Description:\n${selfDescription}`
                : "No profile provided";

        if (!resumeText && !selfDescription) {
            return res.status(400).json({ message: "Please provide either a resume or a self description" });
        }

        const aiData = await generateInterviewDataFromGroq({ jobDescription, profileText });

        const interviewReport = await interviewModel.create({
            userId: req.user.id,
            title: aiData.title,
            jobDescription,
            selfDescription: selfDescription || "",
            resumeText,
            matchScore: aiData.matchScore,
            skillGaps: aiData.skillGaps,
            technicalQuestions: aiData.technicalQuestions,
            behavioralQuestions: aiData.behavioralQuestions,
            preparationPlan: aiData.preparationPlan,
        });

        res.status(201).json({ message: "Interview report generated successfully", interviewReport });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getAllReportsController = async (req, res) => {
    try {
        const interviewReports = await interviewModel
            .find({ userId: req.user.id })
            .select("title matchScore createdAt skillGaps")
            .sort({ createdAt: -1 });

        res.status(200).json({ message: "Reports fetched successfully", interviewReports });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getReportByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const interviewReport = await interviewModel.findOne({ _id: id, userId: req.user.id });

        if (!interviewReport) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.status(200).json({ message: "Report fetched successfully", interviewReport });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const generateResumePdfController = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await interviewModel.findOne({ _id: id, userId: req.user.id });

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="interview-plan-${id}.pdf"`);
        doc.pipe(res);

        // Title
        doc.fontSize(22).fillColor("#ff2d78").text(report.title, { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor("#666").text(`Match Score: ${report.matchScore}%  |  Generated: ${new Date(report.createdAt).toLocaleDateString()}`, { align: "center" });
        doc.moveDown(1.5);

        // Skill Gaps
        doc.fontSize(15).fillColor("#000").text("Skill Gaps to Address", { underline: true });
        doc.moveDown(0.4);
        report.skillGaps.forEach(gap => {
            doc.fontSize(11).fillColor("#333").text(`• ${gap.skill} (${gap.severity} priority)`);
        });
        doc.moveDown(1.5);

        // Technical Questions
        doc.fontSize(15).fillColor("#000").text("Technical Questions", { underline: true });
        doc.moveDown(0.4);
        report.technicalQuestions.forEach((q, i) => {
            doc.fontSize(12).fillColor("#000").text(`Q${i + 1}: ${q.question}`);
            doc.fontSize(10).fillColor("#444").text(`Intention: ${q.intention}`);
            doc.fontSize(10).fillColor("#222").text(`Answer: ${q.answer}`);
            doc.moveDown(0.8);
        });

        // Behavioral Questions
        doc.addPage();
        doc.fontSize(15).fillColor("#000").text("Behavioral Questions", { underline: true });
        doc.moveDown(0.4);
        report.behavioralQuestions.forEach((q, i) => {
            doc.fontSize(12).fillColor("#000").text(`Q${i + 1}: ${q.question}`);
            doc.fontSize(10).fillColor("#444").text(`Intention: ${q.intention}`);
            doc.fontSize(10).fillColor("#222").text(`Answer: ${q.answer}`);
            doc.moveDown(0.8);
        });

        // Preparation Plan
        doc.addPage();
        doc.fontSize(15).fillColor("#000").text("Preparation Roadmap", { underline: true });
        doc.moveDown(0.4);
        report.preparationPlan.forEach(day => {
            doc.fontSize(12).fillColor("#ff2d78").text(`Day ${day.day}: ${day.focus}`);
            day.tasks.forEach(task => {
                doc.fontSize(10).fillColor("#333").text(`  ✓ ${task}`);
            });
            doc.moveDown(0.6);
        });

        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteReportController = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await interviewModel.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!deleted) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    generateReportController,
    getAllReportsController,
    getReportByIdController,
    generateResumePdfController,
    deleteReportController,
};
