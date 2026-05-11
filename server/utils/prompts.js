function resumeAnalysisPrompt(resumeText) {
  return `
Analyze this resume like a recruiter and interview designer.

Do NOT simply match keywords. Infer roles using skills evidence, project complexity,
tools used, seniority level, domain exposure, missing areas, and practical employability.

Resume:
${resumeText}

Return only valid JSON:
{
  "candidateSummary": "short summary",
  "skills": ["skill1", "skill2"],
  "projects": [
    { "name": "project name", "whatItShows": "what this project proves" }
  ],
  "recommendedRoles": [
    {
      "role": "role name",
      "matchScore": 0-100,
      "reason": "why this role fits",
      "focusAreas": ["area1", "area2"],
      "weakAreasToProbe": ["area1", "area2"]
    }
  ]
}`;
}

function questionPrompt(resumeAnalysis, selectedRole, previousAnswers, latestSignals = {}) {
  return `
You are the Interview Orchestrator Agent for an intelligent mock interview platform.
Generate exactly ONE next interview question.

Candidate analysis:
${JSON.stringify(resumeAnalysis)}

Selected role:
${selectedRole}

Previous interview turns:
${JSON.stringify(previousAnswers)}

Latest multimodal/performance signals:
${JSON.stringify(latestSignals)}

Adaptive strategy rules:
- Do NOT follow a fixed script.
- If technicalScore/depthScore is low OR candidate struggled, move to fundamentals first.
- If technicalScore/depthScore is high, increase depth and ask tradeoffs/system-design/project deep-dive.
- If confidenceScore, clarityScore, eyeContactScore, or engagementScore is low, ask a simpler confidence-building question and include a short encouraging transition.
- If candidate is strong technically but weak in communication, ask a question that requires structured explanation.
- Use weakAreasToProbe from the resume analysis.
- Connect the question to real projects/skills from the resume whenever possible.

Return only valid JSON:
{
  "question": "question text",
  "difficulty": "easy | medium | hard",
  "adaptiveReason": "explain which previous score/signal caused this question",
  "encouragement": "one short supportive line before the question",
  "whyAsked": "why this question was selected",
  "expectedDepth": ["point1", "point2", "point3"]
}`;
}

function evaluationPrompt(question, answer, selectedRole) {
  return `
Evaluate this candidate's interview answer.

Role:
${selectedRole}

Question and expected depth:
${question}

Candidate transcript:
${answer}

Evaluation rules:
- Be tolerant of speech-to-text mistakes.
- Score meaning, conceptual correctness, practical understanding, and depth.
- Do not punish grammar heavily.
- If answer is short but correct, score fairly.
- If answer is unrelated, empty, or wrong, score low.
- Also identify whether the candidate should receive easier, same-level, or harder next question.

Return only valid JSON:
{
  "technicalScore": 0-100,
  "depthScore": 0-100,
  "clarityScore": 0-100,
  "semanticMatchScore": 0-100,
  "knowledgeDepthLabel": "basic | moderate | strong",
  "strengths": ["point1", "point2"],
  "mistakes": ["point1", "point2"],
  "missingPoints": ["point1", "point2"],
  "improvedAnswer": "a better interview-style answer",
  "nextDifficulty": "easier | same | harder"
}`;
}

function jobRecommendationPrompt(resumeAnalysis) {
  return `
Act as a job discovery agent. Based on this resume analysis, suggest realistic job postings the candidate should apply for.
Since this hackathon demo may run locally without live internet crawling, generate realistic aggregated postings that look like a job board result.
Rank by match score and explain why each role fits.

Resume analysis:
${JSON.stringify(resumeAnalysis)}

Return only valid JSON:
{
  "jobRecommendations": [
    {
      "title": "job title",
      "company": "company or sample employer",
      "location": "location or remote",
      "matchScore": 0-100,
      "whyFits": ["reason1", "reason2"],
      "missingSkills": ["skill1", "skill2"],
      "suggestedApplicationAction": "what the candidate should do before applying"
    }
  ]
}`;
}

function finalFeedbackPrompt(sessionData) {
  return `
Create final mock interview feedback using answer evaluation plus multimodal signals.

Session data:
${JSON.stringify(sessionData)}

Each answer may contain:
- evaluation: technicalScore, depthScore, clarityScore, semanticMatchScore
- audioMetrics: wordCount, fillerCount, pauseCount, longestPauseSeconds, speakingRateWPM, averagePitchHz, pitchVariation, toneLabel, confidenceScore, communicationClarityScore
- videoMetrics: faceVisible, eyeContactScore, postureScore, engagementScore, stressIndicators, cheatingFlags

Important:
- Use actual scores and observations.
- Explain technical gaps specifically.
- Explain communication and confidence using audio metrics.
- Explain eye contact/posture/stress using video metrics.
- Mention if speech recognition or camera limitations may affect scoring.
- Feedback must be actionable, not generic.

Return only valid JSON:
{
  "overallScore": 0-100,
  "technicalFeedback": "specific technical feedback",
  "communicationFeedback": "specific feedback using audio metrics",
  "confidenceFeedback": "specific feedback using confidence, pauses, eye contact, posture, engagement",
  "webcamFeedback": "specific webcam-based feedback",
  "cheatingOrAttentionFlags": ["flag1", "flag2"],
  "roleReadiness": "ready | needs practice | beginner",
  "topImprovements": ["point1", "point2", "point3"],
  "practicePlan": ["step1", "step2", "step3"]
}`;
}

module.exports = {
  resumeAnalysisPrompt,
  questionPrompt,
  evaluationPrompt,
  jobRecommendationPrompt,
  finalFeedbackPrompt
};
