import Groq from "groq-sdk";

const QUIZ_PROMPT = `You create high-quality practice quizzes that test understanding and teach through detailed explanations.

You will receive the student's preferences as structured JSON in quiz_input_json with:
- topic/subject
- difficulty level (beginner/intermediate/advanced or 1–10)
- desired number of questions
- question types (MCQ, True/False, Short Answer, Problem-Solving)
- purpose (practice, diagnostic, exam simulation, deep dive)

Follow these rules:
- Questions must be clear and unambiguous with exactly one correct answer (for MCQ).
- Use plausible distractors that reveal misconceptions.
- Match the requested difficulty using Bloom's taxonomy distribution.

For each question provide: 1. The question 2. Options (for MCQ) labeled A–D 3. The correct answer 4. A detailed explanation.

Output format (markdown):
1. Title on first line: # Topic: Difficulty Quiz (N questions)
2. Questions section - each MCQ on one line: "QN. Question text? A) opt1 B) opt2 C) opt3 D) opt4"
3. Answer Key section - for each: "Question N: Correct answer: X) value" then explanation
4. Results Summary table: | N | X) value |

Keep question text clean. Options must be exactly "A) ... B) ... C) ... D) ..." on the same line.

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
    const quizInputJson = JSON.stringify(data);
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "GROQ_API_KEY is not set" });
      return;
    }

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.2,
      messages: [
        { role: "user", content: QUIZ_PROMPT + quizInputJson },
      ],
    });

    const quiz = completion.choices[0]?.message?.content?.trim() ?? "";
    res.status(200).json({ quiz });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
}
