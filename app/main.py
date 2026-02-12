from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.planner_agent import generate_plan
from app.quiz_agent import generate_quiz
from app.schemas import PlanRequest, QuizRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.post("/generate-plan")
def plan(req: PlanRequest):
    """
    Generate a personalized multi-subject study plan.

    Expects structured input including exam dates, topics with knowledge levels,
    and daily study preferences (see PlanRequest schema).
    """
    return {"plan": generate_plan(req)}


@app.post("/generate-quiz")
def quiz(req: QuizRequest):
    """
    Generate a practice quiz tailored to the student's preferences.

    Expects topic, difficulty, number of questions, question types, and purpose
    (see QuizRequest schema).
    """
    return {"quiz": generate_quiz(req)}
