import ReactMarkdown from "react-markdown";
import { parsePlanToCalendar, type DayBlock } from "../utils/parsePlan";

export function PlanCalendarView({ planMarkdown }: { planMarkdown: string }) {
  const parsed = parsePlanToCalendar(planMarkdown);

  return (
    <div className="plan-calendar">
      {parsed.overview && (
        <section className="plan-overview">
          <h3>Your Study Schedule</h3>
          <div className="plan-overview-content">
            <ReactMarkdown>{parsed.overview}</ReactMarkdown>
          </div>
        </section>
      )}

      {parsed.topicTable && (
        <section className="plan-topics">
          <h3>Topics at a Glance</h3>
          <div className="plan-topic-table">
            <ReactMarkdown>{parsed.topicTable}</ReactMarkdown>
          </div>
        </section>
      )}

      {parsed.days.length > 0 ? (
        <section className="plan-calendar-grid">
          <h3>Daily Schedule</h3>
          <div className="calendar-days">
            {parsed.days.map((day, i) => (
              <DayCard key={i} day={day} />
            ))}
          </div>
        </section>
      ) : (
        <section className="plan-raw">
          <ReactMarkdown>{planMarkdown}</ReactMarkdown>
        </section>
      )}

      {parsed.checklist && (
        <section className="plan-checklist">
          <h3>Progress Checklist</h3>
          <div className="plan-checklist-content">
            <ReactMarkdown>{parsed.checklist}</ReactMarkdown>
          </div>
        </section>
      )}

      {parsed.tips && (
        <section className="plan-tips">
          <h3>Quick Tips</h3>
          <div className="plan-tips-content">
            <ReactMarkdown>{parsed.tips}</ReactMarkdown>
          </div>
        </section>
      )}
    </div>
  );
}

function DayCard({ day }: { day: DayBlock }) {
  return (
    <div className="calendar-day-card">
      <div className="calendar-day-header">{day.dayLabel}</div>
      <ul className="calendar-day-sessions">
        {day.sessions.map((s, i) => (
          <li key={i} className={`session session-${s.type}`}>
            <span className="session-time">{s.time}</span>
            <span className="session-task">{s.task}</span>
          </li>
        ))}
      </ul>
      {day.sessions.length === 0 && (
        <div className="calendar-day-raw">
          <ReactMarkdown>{day.rawText}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
