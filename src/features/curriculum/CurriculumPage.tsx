import React, { useState, useMemo } from "react";
import { 
  BookOpen, Calendar, HelpCircle, ChevronRight, CheckSquare, 
  Map, GitCommit, GitPullRequest, GitBranch, Sparkles, Check, Clock 
} from "lucide-react";
import { CurriculumWeek, CurriculumDay } from "../../data/curriculum";
import { CalendarComponent } from "../calendar/CalendarComponent";

interface CurriculumPageProps {
  curriculum: CurriculumWeek[];
  completedDays: { [dayId: string]: boolean };
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
  dayDetails: { [dayId: string]: any };
}

export function CurriculumPage({
  curriculum,
  completedDays,
  activeDayId,
  onSelectDay,
  dayDetails
}: CurriculumPageProps) {
  const [activeTab, setActiveTab] = useState<"week" | "calendar" | "timeline">("week");

  const safeCurriculum = useMemo(() => {
    return curriculum || [];
  }, [curriculum]);

  // Calculate day completion status count
  const renderDayStatus = (dayId: string) => {
    if (completedDays[dayId]) {
      return (
        <span className="text-[10px] bg-theme-success/10 text-theme-success border border-theme-success/35 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
          <Check className="w-3 h-3 text-theme-success" /> PASSED
        </span>
      );
    }
    return (
      <span className="text-[10px] bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/25 px-1.5 py-0.5 rounded font-mono font-bold">
        IN PROGRESS
      </span>
    );
  };

  const totalCompleted = Object.keys(completedDays).filter(k => completedDays[k]).length;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans" id="curriculum-container">
      {/* Upper Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-theme-border pb-4 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-black text-theme-text flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-theme-accent-primary font-bold" />
            Curriculum Core Mapping
          </h2>
          <p className="text-xs text-theme-muted mt-1">
            Browse through intermediate sessions, trace timeline metrics, and map visual nodes to optimized constructs.
          </p>
        </div>

        {/* Pill buttons switcher */}
        <div className="bg-theme-card p-1 border border-theme-border rounded-xl flex items-center gap-1 text-xs font-mono select-none">
          <button
            onClick={() => setActiveTab("week")}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === "week" ? "bg-theme-accent-primary text-theme-inverse font-black shadow" : "text-theme-muted hover:text-theme-text"
            }`}
          >
            Syllabus Grid
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === "calendar" ? "bg-theme-accent-primary text-theme-inverse font-black shadow" : "text-theme-muted hover:text-theme-text"
            }`}
          >
            Sprint Calendar
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === "timeline" ? "bg-theme-accent-primary text-theme-inverse font-black shadow" : "text-theme-muted hover:text-theme-text"
            }`}
          >
            Timeline Roadmap
          </button>
        </div>
      </div>

      {activeTab === "week" && (
        <section className="space-y-8" id="syllabus-weeks-sections">
          {safeCurriculum.map((week) => {
            const completedCount = week.days.filter(d => completedDays[d.id]).length;
            const isFullyDone = completedCount === week.days.length && week.days.length > 0;

            return (
              <div key={week.weekNum} className="space-y-4">
                {/* Week Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-theme-border pb-2.5 gap-2 select-none">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono uppercase bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/25 px-2 py-0.5 rounded-md font-bold font-sans">
                      Week 0{week.weekNum}
                    </span>
                    <h3 className="font-display font-black text-theme-text text-sm md:text-base tracking-tight">
                      {week.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-theme-muted">
                    <span>Sprints completion:</span>
                    <strong className={`px-2 py-0.5 rounded font-black ${isFullyDone ? "bg-theme-success/10 text-theme-success" : "bg-theme-bg text-theme-muted"}`}>
                      {completedCount} / {week.days.length} Days done
                    </strong>
                  </div>
                </div>

                {/* Days Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {week.days.map((day) => {
                    const progress = dayDetails[day.id] || { todos: {} };
                    const totalTodos = day.todos.length;
                    const completedTodos = Object.values(progress.todos).filter(Boolean).length;

                    return (
                      <div 
                        key={day.id}
                        onClick={() => onSelectDay(day.id)}
                        className={`bg-theme-card/35 border p-5 rounded-2xl flex flex-col justify-between cursor-pointer group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                          completedDays[day.id] 
                            ? "border-theme-success/20 hover:border-theme-success/40 hover:bg-theme-success/5" 
                            : "border-theme-border/80 hover:border-theme-accent-primary hover:bg-theme-hover"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-mono select-none">
                            <span className="text-theme-accent-primary font-bold uppercase">{day.id} • {day.dayOfWeek}</span>
                            <span className="text-theme-muted">{day.date}</span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-display font-medium text-theme-text text-sm group-hover:text-theme-accent-primary transition-colors leading-tight truncate uppercase">
                              {day.focusTitle}
                            </h4>
                            <p className="text-[11px] text-theme-muted leading-relaxed font-normal line-clamp-3">
                              Visual: "{day.informaticaConcept}". Code Equivalent corresponds to: {day.modernEquivalent}.
                            </p>
                          </div>
                        </div>

                        {/* Status bar bottom */}
                        <div className="border-t border-theme-border pt-3 flex items-center justify-between text-[10px] text-theme-muted font-mono mt-3.5 select-none">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5 text-theme-muted/40" />
                            <span>{completedTodos} / {totalTodos} Tasks</span>
                          </span>
                          {renderDayStatus(day.id)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {activeTab === "calendar" && (
        <CalendarComponent 
          curriculum={safeCurriculum}
          completedDays={completedDays}
          activeDayId={activeDayId}
          onSelectDay={onSelectDay}
        />
      )}

      {activeTab === "timeline" && (
        <section className="bg-theme-card border border-theme-border p-5 md:p-8 rounded-2xl space-y-8 shadow-md font-sans" id="timeline-view">
          <div className="space-y-1 select-none">
            <h3 className="font-display font-black text-theme-text text-sm md:text-base">
              System Timeline Roadmap
            </h3>
            <p className="text-xs text-theme-muted">Chronological pipeline representing logical steps to transition complete master units.</p>
          </div>

          <div className="relative pl-6 md:pl-8 border-l border-theme-border space-y-10">
            {safeCurriculum.map((week) => {
              const completedCount = week.days.filter(d => completedDays[d.id]).length;
              const isWeekActive = week.days.some(d => d.id === activeDayId);

              return (
                <div key={week.weekNum} className="relative space-y-4">
                  {/* Timeline Circle Connector */}
                  <span className={`absolute -left-[1.85rem] top-1 w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[9px] font-bold select-none ${
                    completedCount === week.days.length && week.days.length > 0
                      ? "bg-theme-success border-theme-success/40 text-theme-bg font-black"
                      : isWeekActive
                        ? "bg-theme-accent-primary border-theme-accent-primary text-theme-inverse"
                        : "bg-theme-bg border-theme-border text-theme-muted"
                  }`}>
                    {week.weekNum}
                  </span>

                  <div className="space-y-1 select-none">
                    <h4 className="text-theme-text font-bold text-sm flex items-center gap-2">
                      Week {week.weekNum}: {week.title}
                      <span className="text-[10px] font-mono text-theme-muted bg-theme-bg border border-theme-border px-1.5 py-0.2 rounded font-normal uppercase">
                        {completedCount} / {week.days.length} Complete
                      </span>
                    </h4>
                    <p className="text-xs text-theme-muted font-normal">Accelerates data-warehouse transition and modern cloud workflows.</p>
                  </div>

                  {/* Flow timeline of days inside this week */}
                  <div className="flex flex-wrap gap-2.5 pt-1.5">
                    {week.days.map((day) => {
                      const isCompleted = completedDays[day.id];
                      const isActive = day.id === activeDayId;

                      return (
                        <button
                          key={day.id}
                          onClick={() => onSelectDay(day.id)}
                          className={`px-3 py-2 border rounded-xl text-left font-sans flex items-center gap-2.5 transition-all cursor-pointer text-xs ${
                            isCompleted
                              ? "bg-theme-success/10 border-theme-success/20 text-theme-text"
                              : isActive
                                ? "bg-theme-accent-primary/20 border-theme-accent-primary text-theme-text ring-2 ring-theme-accent-primary/10"
                                : "bg-theme-bg/60 border-theme-border hover:bg-theme-hover text-theme-muted"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            isCompleted ? "bg-theme-success animate-pulse" : isActive ? "bg-theme-accent-primary animate-ping" : "bg-theme-muted/50"
                          }`} />
                          <span className="font-bold">{day.focusTitle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
