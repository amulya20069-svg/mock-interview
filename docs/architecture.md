# Architecture Document: Intelligent Mock Interview Agent

## 1. Problem summary

The Intelligent Mock Interview Agent is a web-based platform that helps candidates practice realistic job interviews. The system uses the candidate resume to understand skills, projects, and possible job roles. It then runs a role-specific interview, adapts the difficulty based on performance, analyzes communication and webcam behavior, and produces structured feedback.

The goal is not only to ask questions, but to behave like an interviewer. If the candidate performs well, the system can increase difficulty. If the candidate struggles or confidence drops, the system moves to fundamentals, gives encouragement, and gradually ramps up again.

## 2. User journey

1. The user opens the web app.
2. The user uploads a resume PDF.
3. The backend extracts resume text.
4. The Context Understanding Agent identifies skills, projects, likely roles, strong areas, and weak areas.
5. The Job Discovery Agent recommends suitable job roles/postings with match scores.
6. The user selects one role and starts the interview.
7. The Interview Orchestrator Agent generates the first role-specific question.
8. The user answers by speaking or typing.
9. The system captures transcript, audio metrics, and webcam metrics.
10. The Technical Evaluation Engine scores the answer.
11. The next question adapts based on answer quality, confidence, clarity, knowledge depth, and visual engagement.
12. After the interview, the Feedback Agent creates a final report with technical gaps, communication feedback, confidence feedback, behavioral observations, and a practice plan.

## 3. High-level architecture

```text
Resume PDF
   ↓
Resume Parser
   ↓
Context Understanding Agent
   ↓
Role Recommendations + Focus Areas + Weak Areas
   ↓
Job Discovery Agent
   ↓
Interview Orchestrator Agent
   ↓
Dynamic Question
   ↓
Candidate Answer
   ↓
Technical Evaluation Engine ← Audio Intelligence + Visual Intelligence
   ↓
Adaptive Next Question
   ↓
Final Feedback & Coaching Agent
```

## 4. Main modules and interfaces

### 4.1 Context Understanding Module

Files:

- `server/utils/resumeParser.js`
- `server/utils/prompts.js`
- `server/routes/interviewRoutes.js`

API:

```text
POST /api/interview/analyze-resume
```

Responsibilities:

- Parse uploaded resume PDF.
- Extract candidate skills, tools, projects, education, and experience signals.
- Infer likely job roles such as Full Stack Developer, Frontend Developer, Backend Developer, Data Analyst, QA, DevOps, or ML Intern.
- Generate focus areas and weak areas to probe during the interview.

### 4.2 Job Discovery Agent

API:

```text
POST /api/interview/job-recommendations
```

Responsibilities:

- Recommend suitable jobs based on resume evidence.
- Rank each job using match score.
- Explain why the role fits.
- Highlight missing skills and application improvement suggestions.

Trade-off:

- For hackathon demo reliability, recommendations are generated from AI-simulated aggregated postings instead of live crawling. This avoids demo failure due to blocked sites, rate limits, or network issues.

### 4.3 Interview Orchestrator Agent

API:

```text
POST /api/interview/generate-question
```

Responsibilities:

- Generate dynamic interview questions instead of using a fixed list.
- Use role, resume, previous answers, scores, and behavioral signals.
- Adapt difficulty and topic flow.

Adaptation examples:

- Low technical score + low confidence → easier fundamentals and encouragement.
- High technical score + high depth → harder design/deep-dive question.
- Weak project explanation → project follow-up.
- Poor eye contact/stress signal → shorter, clearer question.

### 4.4 Audio Intelligence Module

Frontend/browser responsibilities:

- Convert speech to text using browser SpeechRecognition.
- Estimate speaking behavior.

Outputs:

- Transcript
- Filler word count
- Pause count
- Longest pause
- Speaking rate
- Tone estimate
- Pitch-variation estimate
- Confidence score
- Communication clarity score

Design trade-off:

- Real pitch/tone modeling usually needs dedicated audio DSP or ML models. For a hackathon prototype, the system uses explainable heuristics based on pauses, filler words, speaking rate, and answer length.

### 4.5 Visual Intelligence Module

Frontend/webcam responsibilities:

- Estimate eye contact.
- Detect face visibility and head direction.
- Estimate posture and engagement.
- Identify stress/nervousness indicators.
- Detect phone usage where model support is available.

Outputs:

- Eye contact score
- Engagement score
- Posture score
- Stress indicators
- Attention flags

Design trade-off:

- The problem statement allows simplified heuristic CV models. The system therefore uses lightweight browser-side analysis so the demo remains fast and does not require GPU/cloud video processing.

### 4.6 Technical Evaluation Engine

API:

```text
POST /api/interview/evaluate-answer
```

Responsibilities:

- Score answer correctness.
- Score depth of knowledge.
- Score clarity.
- Compare the answer against expected concepts.
- Return strengths, missing points, and improvement suggestions.

### 4.7 Feedback & Coaching Agent

API:

```text
POST /api/interview/final-feedback
```

Responsibilities:

- Aggregate all interview evidence.
- Give explainable feedback.
- Separate technical, communication, confidence, and visual behavior feedback.
- Provide a practice plan.

## 5. Data flow

```text
Client uploads resume
→ Server parses PDF
→ Groq model analyzes resume
→ Client displays roles/jobs
→ Client starts interview
→ Server generates adaptive question
→ Candidate answers
→ Client collects audio/video metrics
→ Server evaluates answer
→ Server generates next adaptive question
→ Server creates final feedback report
```

## 6. Scoring approach

The final report combines multiple signals:

| Signal type | Example metrics | Purpose |
|---|---|---|
| Technical | correctness, depth, semantic match | Measures answer quality |
| Communication | clarity, filler words, speech rate, pauses | Measures speaking quality |
| Confidence | answer length, hesitation, vocal steadiness estimate | Measures confidence |
| Visual | eye contact, posture, engagement, stress indicators | Measures behavioral presence |

Aggregation approach:

```text
Final readiness = weighted combination of technical performance, communication clarity, confidence, and engagement.
```

The system keeps scores explainable instead of only showing one black-box number.

## 7. Key design choices and trade-offs

### Latency

The app generates and evaluates one question at a time to keep the interview interactive. Heavy video/audio processing is avoided to reduce lag.

### Scalability

The backend is modular. Each agent route can later be moved into separate services if needed.

### Model selection

Groq is used for fast LLM responses. Browser APIs are used for webcam and speech capture to reduce backend load.

### Reliability

Live job scraping and advanced emotion detection can fail during demos. The current build uses stable AI-generated job recommendations and heuristic behavior analysis.

## 8. Limitations

- Tone, pitch, facial expression, and stress detection are heuristic-based.
- Job recommendations are demo-safe generated listings, not live scraped postings.
- No full database-backed historical performance dashboard in the current version.
- Browser speech recognition works best in Chrome.
- Webcam scoring depends on lighting, camera angle, and user permissions.

## 9. Assumptions

- Candidate uses Chrome and grants microphone/camera permissions.
- Resume is uploaded as readable PDF text.
- Groq API key is available in `.env`.
- The goal is hackathon demonstration quality, not production-certified emotion analysis.

## 10. Next steps

- Add MongoDB-based interview history and progress tracking.
- Add real job API integration such as LinkedIn/Indeed-compatible providers or company career pages.
- Add a stronger audio feature extractor for true pitch and tone.
- Add pretrained facial expression model for richer emotion analysis.
- Add coding-round simulation with test-case feedback.
- Deploy backend on Render/Railway and frontend on Vercel/Netlify.
