import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Check, Lock, BookOpen, Clock, AlertCircle } from "lucide-react";
import { CurriculumWeek, CurriculumDay } from "../../data/curriculum";

interface CalendarComponentProps {
  curriculum: CurriculumWeek[];
  completedDays: { [dayId: string]: boolean };
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
}

export function CalendarComponent({
  curriculum,
  completedDays,
  activeDayId,
  onSelectDay
}: CalendarComponentProps) {
  // Navigation: Toggle between June 2026 (Month 5) and July 2026 (Month 6)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed: 5 = June, 6 = July

  const safeCurriculum = useMemo(() => {
    return curriculum || [];
  }, [curriculum]);

  // Map 36 curriculum days into active map of Dates for quick reference
  const calendarEvents = useMemo(() => {
    const events: { [dateKey: string]: CurriculumDay & { index: number } } = {};
    let globalIndex = 0;

    safeCurriculum.forEach(week => {
      week.days.forEach(day => {
        globalIndex++;
        
        let dateKey = "";
        const dateStr = day.date.toLowerCase();
        let dayNum = 0;
        
        const matchedNum = dateStr.match(/\d+/);
        if (matchedNum) {
          dayNum = parseInt(matchedNum[0], 10);
        }
        
        let monthNum = 5; // default June
        if (dateStr.includes("july") || dateStr.includes("jul")) {
          monthNum = 6; // July
        } else if (dateStr.includes("aug") || dateStr.includes("august")) {
          monthNum = 7; // August
        } else if (dateStr.includes("june") || dateStr.includes("jun")) {
          monthNum = 5; // June
        }
        
        if (dayNum > 0) {
          const padM = String(monthNum + 1).padStart(2, "0");
          const padD = String(dayNum).padStart(2, "0");
          dateKey = `2026-${padM}-${padD}`;
        } else {
          // Fallback to incremental offsite offset formula
          const weekOffset = week.weekNum - 1;
          const daysInWeekIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day.dayOfWeek);
          const dayOffset = daysInWeekIndex >= 0 ? daysInWeekIndex : 0;
          const eventDate = new Date("2026-06-15");
          eventDate.setDate(eventDate.getDate() + (weekOffset * 7) + dayOffset);
          dateKey = eventDate.toISOString().split("T")[0];
        }
        
        events[dateKey] = {
          ...day,
          index: globalIndex
        };
      });
    });
    return events;
  }, [safeCurriculum]);

  // Names of months
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Total days in Month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  // Day of week index of Month first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  // Navigate month
  const handlePrevMonth = () => {
    if (currentMonth === 5) return; // Cap at June
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 7) return; // Cap at August
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate grid cells
  const calendarCells = useMemo(() => {
    const cells: { dateString: string; dayNum: number | null; eventData: (CurriculumDay & { index: number }) | null }[] = [];

    // Push empty padding cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dateString: "", dayNum: null, eventData: null });
    }

    // Push standard calendar dates
    for (let d = 1; d <= daysInMonth; d++) {
      const padM = String(currentMonth + 1).padStart(2, "0");
      const padD = String(d).padStart(2, "0");
      const dateString = `${currentYear}-${padM}-${padD}`;
      const eventData = calendarEvents[dateString] || null;

      cells.push({
        dateString,
        dayNum: d,
        eventData
      });
    }

    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDayIndex, calendarEvents]);

  const totalCompleted = useMemo(() => {
    return Object.keys(completedDays).filter(k => completedDays[k]).length;
  }, [completedDays]);

  return (
    <div className="bg-theme-card border border-theme-border p-5 md:p-6 rounded-2xl space-y-6 md:space-y-8 animate-fade-in font-sans" id="calendar-view">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-theme-border/60 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-display font-black text-theme-text flex items-center gap-2">
            <Calendar className="w-6 h-6 text-theme-accent-primary" />
            Transition Calendar Dashboard
          </h2>
          <p className="text-xs text-theme-muted">
            Map out your personalized study curriculum across June, July & August 2026.
          </p>
        </div>

        {/* Month Navigation Control */}
        <div className="flex items-center gap-2 bg-theme-bg border border-theme-border rounded-xl p-1.5 shrink-0 self-end sm:self-auto">
          <button
            disabled={currentMonth === 5}
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-hover disabled:opacity-30 disabled:hover:text-theme-muted transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-mono text-xs font-bold text-theme-text px-3 min-w-[7.5rem] select-none text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>

          <button
            disabled={currentMonth === 7}
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-hover disabled:opacity-30 disabled:hover:text-theme-muted transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Counter Segment */}
      <div className="bg-theme-bg/60 border border-theme-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-theme-success animate-pulse inline-block" />
          <p className="text-xs text-theme-text font-medium font-sans">
            Completed: <strong className="text-theme-success font-mono">{totalCompleted}</strong> Syllabus Training Units Completed.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] font-mono text-theme-muted">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-theme-success/10 border border-theme-success/20 inline-block" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-theme-accent-primary/10 border border-theme-accent-primary inline-block" /> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-theme-bg border border-theme-border inline-block" /> Locked</span>
        </div>
      </div>

      {/* Grid Calendar */}
      <div className="space-y-2">
        {/* Days of week text header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono uppercase tracking-wider text-theme-muted font-bold mb-1 select-none">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2.5">
          {calendarCells.map((cell, idx) => {
            const hasEvent = !!cell.eventData;
            const ev = cell.eventData;
            const isToday = cell.dateString === "2026-06-14"; // Context anchor
            
            let cellStyle = "bg-theme-bg/20 border border-theme-border/60 text-theme-muted/40 pointer-events-none";
            let statusBadge = null;

            if (cell.dayNum !== null) {
              if (hasEvent && ev) {
                const isCompleted = completedDays[ev.id];
                const isActive = ev.id === activeDayId;

                if (isCompleted) {
                  cellStyle = "bg-theme-success/10 border-2 border-theme-success/20 text-theme-text hover:border-theme-success hover:bg-theme-success/15 duration-200 transition-all";
                  statusBadge = <Check className="w-3.5 h-3.5 text-theme-success" />;
                } else if (isActive) {
                  cellStyle = "bg-theme-accent-primary/10 border-2 border-theme-accent-primary text-theme-text hover:bg-theme-accent-primary/15 ring-2 ring-theme-accent-primary/10 transition-all duration-200";
                  statusBadge = <span className="w-1.5 h-1.5 rounded-full bg-theme-accent-primary animate-ping inline-block" />;
                } else {
                  cellStyle = "bg-theme-card border border-theme-border text-theme-text hover:bg-theme-hover transition-all duration-150";
                }
              } else {
                cellStyle = `bg-theme-bg border border-theme-border ${isToday ? "bg-theme-hover/60 border border-theme-accent-secondary text-theme-accent-secondary" : "text-theme-muted font-normal opacity-50"}`;
              }
            }

            return (
              <div
                key={idx}
                className={`min-h-[7rem] rounded-xl p-2.5 flex flex-col justify-between relative ${cellStyle} group cursor-pointer`}
                onClick={() => {
                  if (cell.dayNum && hasEvent && ev) {
                    onSelectDay(ev.id);
                  }
                }}
              >
                <div className="flex justify-between items-start select-none">
                  <span className={`font-mono text-xs font-bold leading-none ${isToday ? "bg-theme-accent-secondary text-theme-bg font-black px-1.5 rounded" : "text-theme-text"}`}>
                    {cell.dayNum || ""}
                  </span>
                  {statusBadge}
                </div>

                {/* Event micro text description */}
                {hasEvent && ev && (
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-bold tracking-widest text-theme-accent-primary block uppercase">
                      {ev.id}
                    </span>
                    <p className="text-[10px] font-bold text-theme-text leading-snug line-clamp-2 truncate" title={ev.focusTitle}>
                      {ev.focusTitle}
                    </p>
                    <div className="flex items-center gap-1 text-[8px] text-theme-muted font-mono">
                      <BookOpen className="w-2.5 h-2.5 text-theme-muted group-hover:text-theme-accent-secondary transition-colors" />
                      <span>{ev.riddleLanguage?.toUpperCase()} Riddle</span>
                    </div>
                  </div>
                )}

                {/* If standard off-day */}
                {!hasEvent && cell.dayNum !== null && (
                  <span className="text-[9px] font-mono text-theme-muted block leading-tight select-none">
                    {isToday ? "🎯 Launch Preparation" : "📅 Review Session"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful calendar instructions disclaimer */}
      <div className="flex gap-2.5 items-start p-4 bg-theme-bg/85 border border-theme-border rounded-xl select-none">
        <AlertCircle className="w-4 h-4 text-theme-muted mt-0.5 shrink-0" />
        <div>
          <p className="text-[11px] text-theme-muted leading-relaxed font-sans mt-0.5">
            <strong>Sprint scheduling updates:</strong> Days rescheduled or added in the Trainer Portal instantly reposition themselves on this calendar. Select any day tile to jump directly into the interactive study detail panel.
          </p>
        </div>
      </div>
    </div>
  );
}
