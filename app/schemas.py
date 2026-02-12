from __future__ import annotations

from datetime import date
from typing import List, Literal

from pydantic import BaseModel, Field


class TopicInput(BaseModel):
    subject: str = Field(..., description="Subject this topic belongs to, e.g. 'Math'")
    name: str = Field(..., description="Specific topic name, e.g. 'Derivatives - chain rule'")
    knowledge_level: int = Field(
        ...,
        ge=1,
        le=10,
        description="Self-rated knowledge 1-10 (1-4 weak, 5-7 moderate, 8-10 strong)",
    )


class SubjectExamInput(BaseModel):
    name: str = Field(..., description="Subject name, e.g. 'Physics'")
    exam_date: date = Field(..., description="Exam date for this subject")


class StudyPreferences(BaseModel):
    hours_per_day: float = Field(..., gt=0, description="Available study hours per day")
    preferred_times: List[Literal["morning", "afternoon", "evening"]] = Field(
        ..., description="Preferred times of day to study"
    )


class PlanRequest(BaseModel):
    exams: List[SubjectExamInput]
    topics: List[TopicInput]
    preferences: StudyPreferences


class QuizRequest(BaseModel):
    topic: str = Field(..., description="Main topic or subject for the quiz")
    difficulty_level: Literal["beginner", "intermediate", "advanced"] | int = Field(
        ...,
        description="Difficulty level (beginner/intermediate/advanced or 1-10 rating)",
    )
    num_questions: int = Field(
        10, ge=1, le=50, description="Number of questions to generate"
    )
    question_types: List[
        Literal["mcq", "true_false", "short_answer", "problem_solving"]
    ] = Field(
        default_factory=lambda: ["mcq"],
        description="Desired question types",
    )
    purpose: Literal["practice", "diagnostic", "exam_simulation", "deep_dive"] = Field(
        "practice", description="Main goal of the quiz"
    )

