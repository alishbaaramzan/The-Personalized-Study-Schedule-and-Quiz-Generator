/** Parse study plan markdown into structured data for calendar view */

export type Session = {
  time: string;
  task: string;
  type: "study" | "break" | "lunch" | "rest";
};

export type DayBlock = {
  dayLabel: string;
  date?: string;
  sessions: Session[];
  rawText: string;
};

export function parsePlanToCalendar(planMarkdown: string): {
  overview: string;
  topicTable: string;
  days: DayBlock[];
  checklist: string;
  tips: string;
} {
  const lines = planMarkdown.split("\n");
  const sections: Record<string, string[]> = {
    overview: [],
    topicTable: [],
    days: [],
    checklist: [],
    tips: [],
  };

  let current = "overview";
  const dayBlocks: DayBlock[] = [];
  let buffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2 = line.match(/^##\s+(.+)$/);
    const dayMatch = line.match(/^###?\s*(Day\s+[\d\-]+[^:]*)(?::\s*(.+))?$/i);
    if (h2) {
      const title = h2[1].toLowerCase();
      if (title.includes("schedule") || title.includes("📆")) current = "days";
      else if (title.includes("topic") || title.includes("glance") || title.includes("📋"))
        current = "topicTable";
      else if (title.includes("checklist") || title.includes("✓") || title.includes("progress"))
        current = "checklist";
      else if (title.includes("tip") || title.includes("💡")) current = "tips";
      else if (title.includes("overview") || title.includes("📅")) current = "overview";
      continue;
    }

    if (current === "days" && dayMatch) {
      if (buffer.length) {
        const sessions = parseSessionsFromBuffer(buffer);
        dayBlocks.push({
          dayLabel: buffer[0]?.replace(/^###?\s*/, "").trim() || dayMatch[1],
          sessions,
          rawText: buffer.join("\n"),
        });
      }
      buffer = [line];
      continue;
    }

    if (current === "days") buffer.push(line);
    else sections[current].push(line);
  }

  if (buffer.length) {
    const sessions = parseSessionsFromBuffer(buffer);
    dayBlocks.push({
      dayLabel: buffer[0]?.replace(/^###?\s*/, "").trim() || "Day",
      sessions,
      rawText: buffer.join("\n"),
    });
  }

  const overview = sections.overview.filter((l) => l.trim()).join("\n");
  const topicTable = sections.topicTable.filter((l) => l.trim()).join("\n");
  const checklist = sections.checklist.filter((l) => l.trim()).join("\n");
  const tips = sections.tips.filter((l) => l.trim()).join("\n");

  return { overview, topicTable, days: dayBlocks, checklist, tips };
}

function parseSessionsFromBuffer(buffer: string[]): Session[] {
  const sessions: Session[] = [];
  const timeRe = /^[-*]?\s*(\d{1,2}:\d{2}(?:\s*[-–]\s*\d{1,2}:\d{2})?\s*(?:AM|PM)?)\s*[:\-]\s*(.+)$/i;
  for (const line of buffer) {
    const m = line.match(timeRe);
    if (m) {
      const time = m[1].trim();
      const task = m[2].trim();
      const lower = task.toLowerCase();
      let type: Session["type"] = "study";
      if (lower.includes("break") || lower.includes("rest")) type = "break";
      else if (lower.includes("lunch")) type = "lunch";
      sessions.push({ time, task, type });
    }
  }
  return sessions;
}
