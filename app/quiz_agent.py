from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from pathlib import Path
import os

from app.schemas import QuizRequest

# Explicitly load .env from project root (one level above app/)
dotenv_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=dotenv_path)

groq_api_key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    temperature=0.2,
    api_key=groq_api_key,
)

prompt = ChatPromptTemplate.from_template(
    """
You create high-quality practice quizzes that test understanding and teach through detailed explanations.

You will receive the student's preferences as structured JSON in `quiz_input_json` with:
- topic/subject
- difficulty level (beginner/intermediate/advanced or 1–10)
- desired number of questions
- question types (MCQ, True/False, Short Answer, Problem-Solving)
- purpose (practice, diagnostic, exam simulation, deep dive)

Follow these rules:
- Questions must be clear and unambiguous with exactly one correct answer (for MCQ).
- Use plausible distractors that reveal misconceptions.
- Match the requested difficulty using Bloom's taxonomy distribution:
  - Knowledge/Recall: 20–30%
  - Comprehension: 30–40%
  - Application: 20–30%
  - Analysis/Evaluation: 10–20% (intermediate/advanced)
  - Synthesis: 5–10% (advanced only)

For each question provide:
1. The question (with type and difficulty tag)
2. Options (for MCQ) labeled A–D
3. The correct answer
4. A detailed explanation:
   - Why the correct answer is right
   - Why each wrong option is wrong (for MCQ)
   - A teaching moment with memory tips and related concepts

Output format (markdown) - use exactly this structure for MCQs:
1. Title on first line: # Topic: Difficulty Quiz (N questions)
2. Questions section - each MCQ on one line: "QN. Question text? A) opt1 B) opt2 C) opt3 D) opt4"
3. Answer Key section - for each: "Question N: Correct answer: X) value" then explanation
4. Results Summary table: | N | X) value |

Keep question text clean. No extra labels inside the question. Options must be exactly "A) ... B) ... C) ... D) ..." on the same line.

Quality checks (must all be satisfied):
- Exactly one correct answer per MCQ
- Questions span different cognitive levels
- No trick or unfair questions
- All necessary information is provided

STUDENT INPUT (JSON):
{quiz_input_json}
"""
)

chain = prompt | llm | StrOutputParser()


def generate_quiz(req: QuizRequest) -> str:
    """
    Generate a quiz based on a structured QuizRequest.
    """
    return chain.invoke({"quiz_input_json": req.model_dump_json()})
