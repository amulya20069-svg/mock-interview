const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { askAI } = require("../utils/ai");
const { parseResume } = require("../utils/resumeParser");

const {
  resumeAnalysisPrompt,
  questionPrompt,
  evaluationPrompt,
  jobRecommendationPrompt,
  finalFeedbackPrompt
} = require("../utils/prompts");

const router = express.Router();
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF resumes are supported"));
    }
    cb(null, true);
  }
});

function safeUnlink(filePath) {
  if (filePath && fs.existsSync(filePath)) fs.unlink(filePath, () => {});
}

function latestSignals(previousAnswers = []) {
  const last = previousAnswers[previousAnswers.length - 1];
  if (!last) return { interviewStage: "first_question" };

  return {
    interviewStage: `question_${previousAnswers.length + 1}`,
    lastTechnicalScore: last.evaluation?.technicalScore ?? null,
    lastDepthScore: last.evaluation?.depthScore ?? null,
    lastClarityScore: last.evaluation?.clarityScore ?? null,
    lastNextDifficulty: last.evaluation?.nextDifficulty ?? null,
    lastConfidenceScore: last.audioMetrics?.confidenceScore ?? null,
    lastCommunicationClarityScore: last.audioMetrics?.communicationClarityScore ?? null,
    lastPauseCount: last.audioMetrics?.pauseCount ?? null,
    lastEyeContactScore: last.videoMetrics?.eyeContactScore ?? null,
    lastEngagementScore: last.videoMetrics?.engagementScore ?? null,
    lastStressIndicators: last.videoMetrics?.stressIndicators ?? []
  };
}

router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No resume file uploaded" });

    const resumeText = await parseResume(req.file.path);
    safeUnlink(req.file.path);

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ message: "Resume text could not be extracted properly" });
    }

    const analysis = await askAI(resumeAnalysisPrompt(resumeText));
    return res.json({ resumeText, analysis });
  } catch (error) {
    if (req.file) safeUnlink(req.file.path);
    console.error("Resume analysis error:", error);
    return res.status(500).json({ message: "Resume analysis failed", error: error.message });
  }
});

router.post("/job-recommendations", async (req, res) => {
  try {
    const { resumeAnalysis } = req.body;
    if (!resumeAnalysis) return res.status(400).json({ message: "resumeAnalysis is required" });

    const jobs = await askAI(jobRecommendationPrompt(resumeAnalysis));
    res.json(jobs);
  } catch (error) {
    console.error("Job recommendation error:", error);
    res.status(500).json({ message: "Job recommendation failed", error: error.message });
  }
});

router.post("/generate-question", async (req, res) => {
  try {
    const { resumeAnalysis, selectedRole, previousAnswers } = req.body;
    if (!resumeAnalysis || !selectedRole) {
      return res.status(400).json({ message: "resumeAnalysis and selectedRole are required" });
    }

    const history = previousAnswers || [];
    const question = await askAI(questionPrompt(resumeAnalysis, selectedRole, history, latestSignals(history)));
    res.json(question);
  } catch (error) {
    console.error("Question generation error:", error);
    res.status(500).json({ message: "Question generation failed", error: error.message });
  }
});

router.post("/evaluate-answer", async (req, res) => {
  try {
    const { question, answer, selectedRole, expectedDepth, note, audioMetrics, videoMetrics } = req.body;
    if (!question || !selectedRole) {
      return res.status(400).json({ message: "question and selectedRole are required" });
    }

    const evaluatorContext = {
      expectedDepth: expectedDepth || [],
      note: note || "",
      audioMetrics: audioMetrics || {},
      videoMetrics: videoMetrics || {}
    };

    const evaluation = await askAI(
      evaluationPrompt(
        `${question}\nEvaluator context: ${JSON.stringify(evaluatorContext)}`,
        answer || "",
        selectedRole
      )
    );

    res.json(evaluation);
  } catch (error) {
    console.error("Answer evaluation error:", error);
    res.status(500).json({ message: "Answer evaluation failed", error: error.message });
  }
});

router.post("/final-feedback", async (req, res) => {
  try {
    const { sessionData } = req.body;
    if (!Array.isArray(sessionData) || sessionData.length === 0) {
      return res.status(400).json({ message: "sessionData must contain at least one answer" });
    }

    const feedback = await askAI(finalFeedbackPrompt(sessionData));
    res.json(feedback);
  } catch (error) {
    console.error("Final feedback error:", error);
    res.status(500).json({ message: "Final feedback failed", error: error.message });
  }
});

module.exports = router;
