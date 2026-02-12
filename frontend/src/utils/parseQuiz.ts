/** Parse quiz markdown - extract only questions and options for clean UI */

export type QuizQuestion = {
  id: number;
  question: string;
  options: { key: string; text: string }[];
  correctKey: string;
};

export function parseQuiz(quizMarkdown: string): {
  title: string;
  questions: QuizQuestion[];
} {
  const questions: QuizQuestion[] = [];

  const questionsPart = quizMarkdown.split(/Answer Key|Results Summary/i)[0] ?? quizMarkdown;

  const titleMatch = quizMarkdown.match(/^#\s+(.+?)(?:\n|$)/m);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const correctAnswers: Record<number, string> = {};
  const answerPart = quizMarkdown.split(/Answer Key|Results Summary/i)[1] ?? "";
  for (const m of answerPart.matchAll(/Correct answer:\s*([A-D])\)/gi)) {
    const idx = Object.keys(correctAnswers).length + 1;
    correctAnswers[idx] = m[1].toUpperCase();
  }
  for (const m of answerPart.matchAll(/\|\s*(\d+)\s*\|\s*([A-D])\)/g)) {
    correctAnswers[parseInt(m[1], 10)] = m[2].toUpperCase();
  }

  const blocks = questionsPart.split(/(?=MCQ\s*\(|True\/False|Short Answer|Problem-Solving|Q\d+\.?\s)/i);

  for (const block of blocks) {
    const text = block.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    if (text.length < 20) continue;

    const withoutPrefix = text.replace(/^(?:MCQ\s*\([^)]+\)|Q\d+\.?)\s*[:\-]?\s*/i, "").trim();

    const split = withoutPrefix.split(/\s+([A-D])\)\s+/);
    if (split.length < 9) continue;

    const question = split[0]?.trim() ?? "";
    const options: { key: string; text: string }[] = [];
    for (let i = 1; i < split.length - 1; i += 2) {
      const key = split[i]?.trim().toUpperCase() ?? "";
      let optText = split[i + 1]?.trim() ?? "";
      const nextOpt = optText.match(/\s+[A-D]\)\s+/);
      if (nextOpt) optText = optText.slice(0, nextOpt.index).trim();
      if (/^[A-D]$/.test(key)) options.push({ key, text: optText });
    }

    if (question && options.length >= 2) {
      const qId = questions.length + 1;
      questions.push({
        id: qId,
        question,
        options,
        correctKey: correctAnswers[qId] ?? options[0]?.key ?? "A",
      });
    }
  }

  return { title, questions };
}
