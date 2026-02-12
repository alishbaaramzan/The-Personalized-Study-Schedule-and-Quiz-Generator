import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { parseQuiz, type QuizQuestion } from "../utils/parseQuiz";

export function QuizInteractive({ quizMarkdown }: { quizMarkdown: string }) {
  const { title, questions } = parseQuiz(quizMarkdown);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qId: number, key: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: key }));
  };

  const handleSubmit = () => setSubmitted(true);

  const score = questions.filter((q) => answers[q.id] === q.correctKey).length;
  const total = questions.length;

  if (questions.length === 0) {
    const questionsOnly = quizMarkdown.split(/Answer Key|Results Summary|Correct answer:/i)[0] ?? quizMarkdown;
    return (
      <div className="quiz-fallback">
        <ReactMarkdown>{questionsOnly.trim()}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="quiz-interactive">
      <div className="quiz-header">
        <h3>{title || "Practice Quiz"}</h3>
        <span className="quiz-meta">
          {total} question{total !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="quiz-questions">
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            selected={answers[q.id]}
            correctKey={q.correctKey}
            submitted={submitted}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {!submitted ? (
        <div className="quiz-actions">
          <button
            type="button"
            className="btn-submit-quiz"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0}
          >
            Submit & See Score
          </button>
        </div>
      ) : (
        <div className="quiz-score-card">
          <h4>Your Score</h4>
          <div className="quiz-score-value">
            {score} / {total}
          </div>
          <div className="quiz-score-percent">
            {total > 0 ? Math.round((score / total) * 100) : 0}% correct
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  selected,
  correctKey,
  submitted,
  onSelect,
}: {
  question: QuizQuestion;
  selected?: string;
  correctKey: string;
  submitted: boolean;
  onSelect: (qId: number, key: string) => void;
}) {
  const isCorrect = selected === correctKey;
  const isWrong = submitted && selected && selected !== correctKey;

  return (
    <div
      className={`quiz-question-card ${submitted ? (isCorrect ? "correct" : isWrong ? "wrong" : "") : ""}`}
    >
      <div className="quiz-question-text">
        <span className="quiz-q-num">Q{question.id}.</span> {question.question}
      </div>
      <div className="quiz-options">
        {question.options.map((opt) => {
          let state = "";
          if (submitted) {
            if (opt.key === correctKey) state = "correct";
            else if (opt.key === selected) state = "wrong";
          }
          return (
            <button
              key={opt.key}
              type="button"
              className={`quiz-option ${selected === opt.key ? "selected" : ""} ${state}`}
              onClick={() => onSelect(question.id, opt.key)}
              disabled={submitted}
            >
              <span className="quiz-option-key">{opt.key})</span>
              <span className="quiz-option-text">{opt.text}</span>
              {submitted && opt.key === correctKey && (
                <span className="quiz-option-check">✓</span>
              )}
              {submitted && opt.key === selected && opt.key !== correctKey && (
                <span className="quiz-option-cross">✗</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
