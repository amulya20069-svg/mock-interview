# Intelligent Mock Interview Agent

An agentic AI-powered mock interview web platform that uses a candidate resume to infer realistic job roles, recommends suitable job applications, conducts an adaptive interview, evaluates technical answers, and produces multimodal feedback using text, audio, and webcam signals.

## Features mapped to the hackathon problem statement

| PDF requirement | Implementation |
|---|---|
| Resume PDF input | `server/routes/interviewRoutes.js` accepts PDF upload using Multer and parses it with `pdf-parse`. |
| Context understanding module | `resumeAnalysisPrompt()` extracts skills, projects, likely roles, focus areas, and weak areas to probe. |
| Resume-based role inference | Role cards show match score, reason, focus areas, and weak areas. |
| Job discovery recommendations | `JobRecommendations.jsx` calls `/api/interview/job-recommendations` and ranks roles by match score with fit reasons and missing skills. |
| Dynamic question generation | `/generate-question` generates one fresh question through Groq for the selected role and candidate resume. |
| Real-time adaptation | `questionPrompt()` uses previous technical score, depth score, confidence score, clarity score, eye contact, engagement, and stress indicators to move easier/harder. |
| Speech-to-text | Browser SpeechRecognition transcribes spoken answers in speech mode. |
| Audio intelligence | Tracks filler words, pause count, longest pause, speaking rate, confidence score, communication clarity score, tone estimate, and pitch-variation estimate. |
| Visual intelligence | MediaPipe face detection estimates eye contact, posture, engagement, looking away/down, face visibility, and stress indicators. COCO-SSD detects mobile phones. |
| Technical evaluation | `/evaluate-answer` uses LLM semantic scoring plus expected-depth context. |
| Explainable feedback | `/final-feedback` returns technical, communication, confidence, webcam, attention flags, readiness, improvements, and practice plan. |
| Multimodal scoring | Final feedback combines text evaluation, audio metrics, typing metrics, and video metrics. |

## Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express
- AI: Groq LLM API
- Resume parsing: pdf-parse
- Webcam intelligence: MediaPipe Tasks Vision, TensorFlow.js COCO-SSD
- Speech: Browser SpeechRecognition API

## Project structure

```text
mock-interview-agent/
├── client/
│   ├── src/components/
│   │   ├── UploadResume.jsx
│   │   ├── JobRecommendations.jsx
│   │   ├── RoleSelection.jsx
│   │   ├── ModeSelection.jsx
│   │   ├── Interview.jsx
│   │   └── Feedback.jsx
│   └── src/config.js
├── server/
│   ├── routes/interviewRoutes.js
│   ├── utils/ai.js
│   ├── utils/prompts.js
│   ├── utils/resumeParser.js
│   └── .env.example
├── docs/architecture.md
└── samples/sample-output.json
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Add your Groq key inside `server/.env`:

```bash
GROQ_API_KEY=your_groq_api_key_here
PORT=5001
```

Run backend:

```bash
npm run dev
```

### 2. Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

By default the frontend calls:

```bash
http://localhost:5001
```

For another backend URL, create `client/.env`:

```bash
VITE_API_URL=https://your-backend-url
```

## One-command local run

Use two terminals:

```bash
# terminal 1
cd server && npm install && npm run dev

# terminal 2
cd client && npm install && npm run dev
```

## Demo flow

1. Login or create a local demo account.
2. Upload a PDF resume.
3. View candidate summary, inferred skills, recommended job postings, and role matches.
4. Select an interview role.
5. Choose speech mode or typing mode.
6. Start interview and answer 3 adaptive questions.
7. View final feedback report with technical, communication, confidence, webcam, and improvement insights.

## Important notes

- SpeechRecognition works best in Chrome.
- Camera and microphone permissions are required for full multimodal scoring.
- Audio pitch/tone are hackathon-safe heuristic estimates, not medical or clinical emotion detection.
- Job discovery is implemented as an AI-powered local aggregation simulation for demo reliability. It can be replaced by a real job API or crawler.
- Do not commit `.env`, `node_modules`, `dist`, uploaded resumes, or `.git` metadata in final submission.
