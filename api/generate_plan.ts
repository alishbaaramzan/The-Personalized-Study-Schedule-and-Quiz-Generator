import Groq from "groq-sdk";

const PLAN_PROMPT = `You are an expert study planner. Create a personalized study schedule that is CLEAN and USER-FRIENDLY.
The student should see only helpful schedule content—no backend logic, quality checks, or meta-commentary.

You will receive the student's data as JSON in plan_input_json (exam dates, topics, knowledge levels, hours per day, preferred times).

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
9:00–9:50 AM: Subject - Topic (specific task, e.g. Read Ch. 5.1–5.3)
Include breaks between sessions. No generic placeholders—give concrete times and tasks.

## ✓ Progress Checklist
Daily checkboxes the student can tick: - [ ] 9:00 AM: Math - Derivatives

## 💡 Quick Tips
2–4 short tips: resources, exam prep, study strategies.

CRITICAL: Do NOT include quality checks, Part 1/2/3 numbering, backend logic, or meta-commentary.

STUDENT INPUT (JSON):
`;

export default async function handler(req: { method?: string; body?: string }, res: { status: (n: number) => { json: (o: object) => void; setHeader: (k: string, v: string) => void; end: () => void }; setHeader: (k: string, v: string) => void }) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const data = req.body ?? {};
    const planInputJson = JSON.stringify(data);
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "GROQ_API_KEY is not set" });
      return;
    }

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.3,
      messages: [
        { role: "user", content: PLAN_PROMPT + planInputJson },
      ],
    });

    const plan = completion.choices[0]?.message?.content?.trim() ?? "";
    res.status(200).json({ plan });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
}
