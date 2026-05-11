# Intelligent Mock Interview Agent

Agentic AI-powered mock interview platform for the hackathon problem statement. The app accepts a candidate resume, infers realistic job roles, recommends suitable jobs, conducts an adaptive mock interview, analyzes text/audio/video signals, and generates explainable coaching feedback.

## 1. Prerequisites

Install these before running:

- Node.js 18 or higher
- npm 9 or higher
- Chrome browser for speech recognition, microphone, and webcam features
- Groq API key from Groq Console

Optional:

- MongoDB is not required for the current demo build. The system works locally without a database.
- If you later add persistent user history, add MongoDB and store interview reports.

## 2. Environment setup

Create this file:

```text
server/.env
```

Use this format:

```env
PORT=5001
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=any_long_random_secret_key
```

A template is already provided at:

```text
server/.env.example
```

## 3. One-command local run

From the project root, run:

```bash
bash scripts/run-local.sh
```

This command installs missing dependencies for both `server` and `client`, starts the backend on port `5001`, and starts the frontend using Vite.

Then open the local frontend URL shown in the terminal, usually:

```text
http://localhost:5173
```

Allow camera and microphone permissions in Chrome.

## 4. Manual run option

Use two terminals.

### Terminal 1: backend

```bash
cd server
npm install
npm start
```

Expected output:

```text
Server running on port 5001
```

### Terminal 2: frontend

```bash
cd client
npm install
npm run dev
```

Expected output:

```text
Local: http://localhost:5173
```

## 5. Project structure

```text
mock-interview-agent-perfect/
├── README.md
├── package.json
├── scripts/
│   └── run-local.sh
├── server/
│   ├── index.js
│   ├── routes/
│   │   └── interviewRoutes.js
│   └── utils/
│       ├── ai.js
│       ├── prompts.js
│       └── resumeParser.js
├── client/
│   └── src/
│       ├── App.jsx
│       ├── config.js
│       └── components/
├── docs/
│   ├── architecture.md
│   └── scoring-and-assumptions.md
└── samples/
    ├── sample-resume.txt
    ├── sample-jd.txt
    ├── sample-output.json
    └── quick-evaluation-checklist.md
```

## 6. How the agents/modules interact

### Context Understanding Module

Input: uploaded PDF resume  
Backend route: `/api/interview/analyze-resume`  
Important files: `resumeParser.js`, `prompts.js`, `ai.js`

It extracts resume text, identifies skills/projects, estimates suitable roles, and returns interview focus areas and weak areas to probe.

### Job Discovery Agent

Backend route: `/api/interview/job-recommendations`

It uses the resume analysis to generate job recommendations with match scores, fit reasons, and missing skills. For demo stability, it uses AI-generated aggregated sample postings instead of live web scraping. This keeps the hackathon demo reliable even without internet access.

### Interview Orchestrator Agent

Backend route: `/api/interview/generate-question`

It generates one question at a time. It adapts the next question based on:

- Candidate answer quality
- Previous technical score
- Depth score
- Confidence score
- Communication clarity
- Eye contact and engagement
- Stress/nervousness signals

Example behavior:

```text
If the candidate struggles with system design and confidence drops,
the agent shifts to fundamentals, gives encouragement, and gradually increases difficulty.
```

### Audio Intelligence Module

Frontend speech mode captures candidate speech using browser SpeechRecognition. It estimates:

- Speech-to-text transcript
- Filler words
- Pause count
- Longest pause
- Speaking rate
- Confidence score
- Communication clarity score
- Tone estimate
- Pitch-variation estimate

### Visual Intelligence Module

The frontend uses webcam-based heuristics and pretrained models where available. It estimates:

- Eye contact
- Face visibility
- Looking away/down
- Posture
- Engagement
- Stress/nervousness indicators
- Phone detection

### Technical Evaluation Engine

Backend route: `/api/interview/evaluate-answer`

It scores the candidate answer using LLM semantic evaluation and expected-depth context. Outputs include:

- Correctness score
- Depth of knowledge
- Clarity score
- Semantic match
- Key strengths
- Missing concepts
- Improvement suggestion

### Feedback & Coaching Agent

Backend route: `/api/interview/final-feedback`

It aggregates technical, communication, confidence, audio, and visual signals into a final feedback report.

## 7. Sample input for quick evaluation

Use:

```text
samples/sample-resume.txt
samples/sample-jd.txt
```

You can upload a PDF resume in the UI. If you do not have one, copy the sample resume into a document and export it as PDF.

## 8. Expected output

A successful run should produce:

- Resume summary
- Recommended roles
- Job recommendations with match scores
- Adaptive questions
- Technical scores
- Confidence and communication scores
- Webcam engagement scores
- Final feedback and practice plan

See:

```text
samples/sample-output.json
```

## 9. Quick evaluation checklist

See:

```text
samples/quick-evaluation-checklist.md
```

This checklist maps the implementation to the hackathon PDF requirements.

## 10. Important limitations

This is a hackathon-ready prototype. Some advanced signals use lightweight heuristics:

- Tone and pitch are estimated heuristically from speech behavior and answer patterns.
- Facial expression and stress detection are heuristic-based, not medical/emotion-certified.
- Job recommendations are generated as demo-safe aggregated listings, not real-time scraped jobs.
- Persistent history is not fully database-backed in this version.

These trade-offs are acceptable for the problem statement because it allows simplified heuristic models and emphasizes agent logic over model perfection.
