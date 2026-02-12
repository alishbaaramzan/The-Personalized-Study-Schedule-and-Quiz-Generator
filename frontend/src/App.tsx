import { useState } from "react";
import { PlanCalendarView } from "./components/PlanCalendarView";
import { QuizInteractive } from "./components/QuizInteractive";

const PLAN_ENDPOINT = "/api/generate_plan";
const QUIZ_ENDPOINT = "/api/generate_quiz";

type PreferredTime = "morning" | "afternoon" | "evening";

type QuestionType = "mcq" | "true_false" | "short_answer" | "problem_solving";

function App() {
  const [activeTool, setActiveTool] = useState<"planner" | "quiz">("planner");

  // Planner state
  const [exams, setExams] = useState<
    { id: number; name: string; exam_date: string }[]
  >([{ id: 1, name: "", exam_date: "" }]);

  const [topics, setTopics] = useState<
    { id: number; subject: string; name: string; knowledge_level: number }[]
  >([{ id: 1, subject: "", name: "", knowledge_level: 4 }]);

  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [preferredTimes, setPreferredTimes] = useState<PreferredTime[]>([
    "morning",
    "evening",
  ]);

  const [planOutput, setPlanOutput] = useState<string>("");
  const [plannerLoading, setPlannerLoading] = useState(false);

  // Quiz state
  const [quizTopic, setQuizTopic] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [quizNumQuestions, setQuizNumQuestions] = useState(10);
  const [quizQuestionTypes, setQuizQuestionTypes] = useState<QuestionType[]>([
    "mcq",
  ]);
  const [quizPurpose, setQuizPurpose] = useState<
    "practice" | "diagnostic" | "exam_simulation" | "deep_dive"
  >("practice");
  const [quizOutput, setQuizOutput] = useState<string>("");
  const [quizLoading, setQuizLoading] = useState(false);

  const togglePreferredTime = (time: PreferredTime) => {
    setPreferredTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const toggleQuestionType = (qt: QuestionType) => {
    setQuizQuestionTypes((prev) =>
      prev.includes(qt) ? prev.filter((t) => t !== qt) : [...prev, qt]
    );
  };

  const updateExam = (
    id: number,
    patch: Partial<{ name: string; exam_date: string }>
  ) => {
    setExams((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)));
  };

  const updateTopic = (
    id: number,
    patch: Partial<{
      subject: string;
      name: string;
      knowledge_level: number;
    }>
  ) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const addExamRow = () => {
    setExams((prev) => [
      ...prev,
      { id: prev.length ? prev[prev.length - 1].id + 1 : 1, name: "", exam_date: "" },
    ]);
  };

  const addTopicRow = () => {
    setTopics((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        subject: "",
        name: "",
        knowledge_level: 4,
      },
    ]);
  };

  const handleGeneratePlan = async () => {
    setPlannerLoading(true);
    setPlanOutput("");
    try {
      const payload = {
        exams: exams
          .filter((e) => e.name && e.exam_date)
          .map(({ id, ...rest }) => rest),
        topics: topics
          .filter((t) => t.subject && t.name)
          .map(({ id, ...rest }) => rest),
        preferences: {
          hours_per_day: hoursPerDay,
          preferred_times: preferredTimes,
        },
      };

      const res = await fetch(PLAN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to generate plan");
      }
      const data = await res.json();
      setPlanOutput(data.plan ?? "");
    } catch (err: any) {
      setPlanOutput(
        `Error generating plan:\n\n${err?.message ?? String(err)}\n\n` +
          "Run the backend: uvicorn app.main:app --reload (dev) or use vercel dev for full app."
      );
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setQuizOutput("");
    try {
      const payload = {
        topic: quizTopic,
        difficulty_level: quizDifficulty,
        num_questions: quizNumQuestions,
        question_types: quizQuestionTypes,
        purpose: quizPurpose,
      };

      const res = await fetch(QUIZ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to generate quiz");
      }
      const data = await res.json();
      setQuizOutput(data.quiz ?? "");
    } catch (err: any) {
      setQuizOutput(
        `Error generating quiz:\n\n${err?.message ?? String(err)}\n\n` +
          "Run the backend: uvicorn app.main:app --reload (dev) or use vercel dev for full app."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  const showPlanner = activeTool === "planner";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="brand-lockup">
            <div className="brand-logo" />
            <div className="brand-text">
              <span className="brand-pill">
                <span className="badge-dot" /> Groq-powered tutor
              </span>
              <h1>Taleemabad Study Studio</h1>
            </div>
          </div>
          <p className="header-caption">
            Design realistic study plans and teaching-style quizzes in one
            responsive workspace. Perfect for exam crunch time and daily
            practice.
          </p>
        </div>

        <div className="header-meta">
          <div className="meta-chip">
            <span className="meta-dot" />
            Live with your FastAPI backend
          </div>
          <div className="meta-chip">Mobile-friendly · Calendar-based planner</div>
        </div>
      </header>

      <main className="layout-grid">
        {/* Left: Inputs */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                {showPlanner ? "Study Planner" : "Quiz Generator"}
              </div>
              <div className="panel-kicker">
                {showPlanner
                  ? "Work backwards from your exam calendar with smart breaks."
                  : "High‑quality questions with teaching‑style explanations."}
              </div>
            </div>
            <div>
              <div className="tabs">
                <button
                  className={`tab ${showPlanner ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setActiveTool("planner")}
                >
                  Planner
                </button>
                <button
                  className={`tab ${!showPlanner ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setActiveTool("quiz")}
                >
                  Quiz
                </button>
              </div>
            </div>
          </div>

          <div className="panel-body">
            {showPlanner ? (
              <>
                <div className="form-grid">
                  <div className="fieldset">
                    <div className="fieldset-legend">Exam calendar</div>
                    {exams.map((exam) => (
                      <div key={exam.id} className="field-row">
                        <div className="field">
                          <label>Subject</label>
                          <input
                            placeholder="e.g. Math"
                            value={exam.name}
                            onChange={(e) =>
                              updateExam(exam.id, { name: e.target.value })
                            }
                          />
                        </div>
                        <div className="field calendar-input">
                          <label>Exam date</label>
                          <input
                            type="date"
                            value={exam.exam_date}
                            onChange={(e) =>
                              updateExam(exam.id, { exam_date: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={addExamRow}
                    >
                      + Add another subject
                    </button>
                    <p className="helper-text">
                      Tap the date field to open a native calendar picker on all
                      devices.
                    </p>
                  </div>

                  <div className="fieldset">
                    <div className="fieldset-legend">Topics & difficulty</div>
                    {topics.map((topic) => (
                      <div key={topic.id} className="field-row">
                        <div className="field">
                          <label>Subject</label>
                          <input
                            placeholder="e.g. Physics"
                            value={topic.subject}
                            onChange={(e) =>
                              updateTopic(topic.id, { subject: e.target.value })
                            }
                          />
                        </div>
                        <div className="field">
                          <label>Topic</label>
                          <input
                            placeholder="e.g. Kinematics – graphs"
                            value={topic.name}
                            onChange={(e) =>
                              updateTopic(topic.id, { name: e.target.value })
                            }
                          />
                        </div>
                        <div className="field">
                          <label>
                            Knowledge level{" "}
                            <span className="helper-text">(1‑4 weak · 8‑10 strong)</span>
                          </label>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={topic.knowledge_level}
                            onChange={(e) =>
                              updateTopic(topic.id, {
                                knowledge_level: Number(e.target.value),
                              })
                            }
                          />
                          <span className="helper-text">
                            {topic.knowledge_level}/10
                          </span>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={addTopicRow}
                    >
                      + Add another topic
                    </button>
                  </div>
                </div>

                <div className="fieldset">
                  <div className="fieldset-legend">Study preferences</div>
                  <div className="field-row">
                    <div className="field" style={{ maxWidth: 160 }}>
                      <label>Hours per day</label>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={hoursPerDay}
                        onChange={(e) =>
                          setHoursPerDay(Number(e.target.value) || 1)
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Preferred times</label>
                      <div className="pill-checkboxes">
                        {(["morning", "afternoon", "evening"] as PreferredTime[]).map(
                          (t) => (
                            <label
                              key={t}
                              className={`pill ${
                                preferredTimes.includes(t) ? "is-active" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={preferredTimes.includes(t)}
                                onChange={() => togglePreferredTime(t)}
                              />
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </label>
                          )
                        )}
                      </div>
                    </div>
                    <div className="field">
                      <label>Summary</label>
                      <div className="list-chips">
                        <span className="chip">
                          {exams.filter((e) => e.name && e.exam_date).length} exams
                        </span>
                        <span className="chip">
                          {topics.filter((t) => t.subject && t.name).length} topics
                        </span>
                        <span className="chip">{hoursPerDay} hrs/day</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="btn-row">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleGeneratePlan}
                    disabled={plannerLoading}
                  >
                    {plannerLoading ? "Generating plan…" : "Generate study plan"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="fieldset">
                  <div className="fieldset-legend">Quiz topic</div>
                  <div className="field-row">
                    <div className="field">
                      <label>Topic or chapter</label>
                      <input
                        placeholder="e.g. Limits & continuity"
                        value={quizTopic}
                        onChange={(e) => setQuizTopic(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="fieldset">
                    <div className="fieldset-legend">Difficulty & length</div>
                    <div className="field-row">
                      <div className="field">
                        <label>Difficulty level</label>
                        <select
                          value={quizDifficulty}
                          onChange={(e) =>
                            setQuizDifficulty(
                              e.target.value as "beginner" | "intermediate" | "advanced"
                            )
                          }
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="field" style={{ maxWidth: 160 }}>
                        <label># of questions</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={quizNumQuestions}
                          onChange={(e) =>
                            setQuizNumQuestions(Number(e.target.value) || 10)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="fieldset">
                    <div className="fieldset-legend">Format & purpose</div>
                    <div className="field-row">
                      <div className="field">
                        <label>Question types</label>
                        <div className="pill-checkboxes">
                          {(
                            ["mcq", "true_false", "short_answer", "problem_solving"] as
                              QuestionType[]
                          ).map((qt) => (
                            <label
                              key={qt}
                              className={`pill ${
                                quizQuestionTypes.includes(qt) ? "is-active" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={quizQuestionTypes.includes(qt)}
                                onChange={() => toggleQuestionType(qt)}
                              />
                              {qt
                                .replace("_", " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field" style={{ maxWidth: 220 }}>
                        <label>Purpose</label>
                        <select
                          value={quizPurpose}
                          onChange={(e) =>
                            setQuizPurpose(
                              e.target.value as
                                | "practice"
                                | "diagnostic"
                                | "exam_simulation"
                                | "deep_dive"
                            )
                          }
                        >
                          <option value="practice">Practice</option>
                          <option value="diagnostic">Diagnostic (find weak areas)</option>
                          <option value="exam_simulation">Exam simulation</option>
                          <option value="deep_dive">Deep dive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="btn-row">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleGenerateQuiz}
                    disabled={quizLoading}
                  >
                    {quizLoading ? "Generating quiz…" : "Generate quiz"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Right: Output */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                {showPlanner ? "Study plan preview" : "Quiz preview"}
              </div>
              <div className="panel-kicker">
                Markdown view that stays readable on mobile and desktop.
              </div>
            </div>
            <span className="panel-badge">
              {showPlanner ? "Plan · Markdown" : "Quiz · Markdown"}
            </span>
          </div>

          <div className="panel-body output-panel">
            <div className="output-body">
              {showPlanner ? (
                planOutput ? (
                  <PlanCalendarView planMarkdown={planOutput} />
                ) : (
                  <div className="empty-state">
                    Start by adding your subjects, exam dates via the calendar inputs,
                    and study preferences — then hit{" "}
                    <strong>&ldquo;Generate study plan&rdquo;</strong>.
                  </div>
                )
              ) : quizOutput ? (
                <QuizInteractive quizMarkdown={quizOutput} />
              ) : (
                <div className="empty-state">
                  Describe a topic and choose difficulty, then tap{" "}
                  <strong>&ldquo;Generate quiz&rdquo;</strong> to see questions and
                  teaching‑style explanations here.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

