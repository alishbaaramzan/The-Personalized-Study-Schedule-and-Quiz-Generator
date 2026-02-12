from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from pathlib import Path
import os

from app.schemas import PlanRequest

# Explicitly load .env from project root (one level above app/)
dotenv_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=dotenv_path)

groq_api_key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    temperature=0.3,
    api_key=groq_api_key,
)

prompt = ChatPromptTemplate.from_template(
    """
You are an expert study planner. Create a personalized study schedule that is CLEAN and USER-FRIENDLY.
The student should see only helpful schedule content—no backend logic, quality checks, or meta-commentary.

You will receive the student's data as JSON in `plan_input_json` (exam dates, topics, knowledge levels, hours per day, preferred times).

Planning rules (apply these internally; do NOT mention them in output):
- Work backwards from exam dates; front-load weak topics (1–4/10) for multiple reviews
- Time-blocked sessions: 25–50 min each; breaks every 50–60 min (Pomodoro or 50+10)
- Allocate: weak 60%, moderate 30%, strong 10% of subject time
- Include buffer days before exams, one rest day per week, 1-hour lunch, 7–9h sleep

Output ONLY what the student needs to see, in clear markdown. Use these friendly headings:

## 📅 Your Study Schedule
Brief overview (1–2 lines): total days, hours/day, main focus.

## 📋 Topics at a Glance
Simple table: Topic | Focus Level | Time % | Approach (e.g. Learn → Practice → Review)

## 📆 Daily Schedule
Day-by-day plan with specific time slots. Format each session as:
`9:00–9:50 AM: Subject - Topic (specific task, e.g. Read Ch. 5.1–5.3)`
Include breaks between sessions. No generic placeholders—give concrete times and tasks.

## ✓ Progress Checklist
Daily checkboxes the student can tick: `- [ ] 9:00 AM: Math - Derivatives`

## 💡 Quick Tips
2–4 short tips: resources, exam prep, study strategies.

CRITICAL: Do NOT include any of the following in your output:
- Quality checks, verification lists, or "satisfies the following" sections
- Part 1 / Part 2 / Part 3 numbering
- Backend logic or planning rules
- Meta-commentary like "based on the provided input" or "the plan satisfies..."

STUDENT INPUT (JSON):
{plan_input_json}
"""
)

chain = prompt | llm | StrOutputParser()


def generate_plan(req: PlanRequest) -> str:
    """
    Generate a study plan from a structured PlanRequest.
    """
    return chain.invoke({"plan_input_json": req.model_dump_json()})
