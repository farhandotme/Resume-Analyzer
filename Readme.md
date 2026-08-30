# 📄 Resume Intelligence

Understand how your resume performs for the role you actually want.

Resume Intelligence is an AI-powered resume intelligence platform that transforms a static resume into an interactive, animated, and story-driven analysis.

Unlike traditional resume analyzers that provide a generic score, Resume Intelligence evaluates a resume against a specific target role. This allows the platform to understand how well a candidate's experience, skills, and positioning align with the role they want to pursue.

## 🔗 Live Demo

[Try Resume Intelligence](https://resume-analyzer.vercel.app)

## ✨ Features

- **Role-Specific Resume Analysis** — Analyze your resume against the specific role you want to pursue
- **ATS Compatibility Score** — Get an overall ATS score with a clear hiring-oriented verdict
- **Detailed Score Breakdown** — Understand your performance across skills, experience, projects, structure, and keywords
- **Strength & Weakness Analysis** — See what makes your resume stand out and where it falls short
- **Actionable Improvements** — Get prioritized recommendations for improving your resume
- **Interactive Story Experience** — Explore your analysis through an animated, story-driven experience instead of a static report
- **AI Resume Chat** — Ask questions about your resume and get contextual answers based on your analysis
- **Report Export** — Download your completed resume analysis for later reference

## 🛠 Tech Stack

<table>
<tr><th>Layer</th><th>Technology</th></tr>

<tr>
<td><b>Frontend</b></td>
<td>React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, GSAP, React Router, jsPDF + html2canvas-pro, react-speech-recognition, Supabase JS client</td>
</tr>

<tr>
<td><b>App Backend</b></td>
<td>Node.js, Bun, Express 5, TypeScript, Axios, Redis, Prisma + PostgreSQL, JWT, bcrypt, Nodemailer</td>
</tr>

<tr>
<td><b>AI Backend</b></td>
<td>Python 3.12, FastAPI, Celery, LangChain, PyMuPDF, Mistral AI, Hugging Face Sentence Transformers (<code>all-MiniLM-L6-v2</code>), Tavily Search API, <code>json-repair</code></td>
</tr>

<tr>
<td><b>Infrastructure</b></td>
<td>Redis, Qdrant, Docker, Docker Compose, Supabase Storage</td>
</tr>

</table>