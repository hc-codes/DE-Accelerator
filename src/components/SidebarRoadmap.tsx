import React, { useState, useMemo } from "react";
import { 
  Search, Calendar, ChevronDown, ChevronRight, CheckCircle2, 
  Circle, BookOpen, Award, Target, HelpCircle, CheckSquare
} from "lucide-react";
import { CurriculumWeek, CurriculumDay } from "../data/curriculum";

interface SidebarProps {
  curriculum: CurriculumWeek[];
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
  completedDays: { [dayId: string]: boolean };
}

export function SidebarRoadmap({ curriculum, activeDayId, onSelectDay, completedDays }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedWeeks, setExpandedWeeks] = useState<{ [weekNum: number]: boolean }>({
    1: true, // Default open first week
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  const safeCurriculum = useMemo(() => {
    return curriculum || [];
  }, [curriculum]);

  // Calculate dynamic stats
  const totalDays = useMemo(() => {
    return safeCurriculum.flatMap(w => w.days).length || 36;
  }, [safeCurriculum]);

  const completedCount = useMemo(() => {
    return Object.values(completedDays).filter(Boolean).length;
  }, [completedDays]);

  const completionPercentage = useMemo(() => {
    return totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
  }, [completedCount, totalDays]);

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  // Filter days based on search input
  const filteredWeeks = useMemo(() => {
    if (!searchTerm.trim()) return safeCurriculum;

    const term = searchTerm.toLowerCase();
    return safeCurriculum.map(week => {
      const matchingDays = week.days.filter(day => 
        day.focusTitle.toLowerCase().includes(term) ||
        day.informaticaConcept.toLowerCase().includes(term) || 
        day.modernEquivalent.toLowerCase().includes(term) ||
        day.riddleTitle?.toLowerCase().includes(term)
      );

      return {
        ...week,
        days: matchingDays,
        isMatched: matchingDays.length > 0 || week.title.toLowerCase().includes(term)
      };
    }).filter(week => week.isMatched);
  }, [searchTerm, safeCurriculum]);

  return (
    <aside className="w-full lg:w-80 bg-theme-card border-r border-theme-border flex flex-col h-full overflow-hidden">
      {/* Brand Profile Logo */}
      <div className="p-5 border-b border-theme-border bg-theme-bg/15">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-theme-accent-secondary to-theme-accent-primary text-theme-text flex items-center justify-center font-display font-semibold shadow-inner">
            <Target className="w-5 h-5 text-theme-text animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-bold text-theme-text leading-tight select-none">DE Career Mentor</h2>
            <p className="text-[10px] text-theme-accent-primary font-mono tracking-wider uppercase select-none">Informatica-To-Code Portal</p>
          </div>
        </div>

        {/* Progress Metrics Panel */}
        <div className="mt-4 bg-theme-bg/60 border border-theme-border rounded-xl p-3 shadow-md">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5 text-theme-text">
            <span className="flex items-center gap-1.5 text-theme-muted select-none">
              <Award className="w-3.5 h-3.5 text-theme-warning animate-bounce-slow" /> Progression Status
            </span>
            <span className="font-semibold text-theme-accent-primary">{completionPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-theme-hover rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-theme-accent-secondary via-theme-accent-primary to-theme-success transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-theme-muted font-mono mt-1.5 text-right select-none">
            {completedCount} of {totalDays} curriculum units done
          </p>
        </div>
      </div>

      {/* Dynamic Search Box */}
      <div className="px-4 py-3 border-b border-theme-border bg-theme-card">
        <div className="relative">
          <input
            type="text"
            placeholder="Search filters, concepts, SQL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-theme-bg/60 border border-theme-border rounded-lg text-xs py-2 pl-8 pr-3 text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-accent-primary focus:ring-1 focus:ring-theme-accent-primary transition-all"
          />
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-theme-muted" />
        </div>
      </div>

      {/* Accordion Units list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredWeeks.length === 0 ? (
          <div className="text-center py-8 text-xs text-theme-muted font-mono">
            No daily studies match your filter.
          </div>
        ) : (
          filteredWeeks.map((week) => {
            const isExpanded = expandedWeeks[week.weekNum] || searchTerm.trim() !== "";
            // Calculate week completion
            const weekCompletedCount = week.days.filter(d => completedDays[d.id]).length;

            return (
              <div 
                key={week.weekNum} 
                className={`border rounded-xl transition-all duration-300 ${
                  isExpanded ? "bg-theme-card border-theme-border" : "bg-theme-bg/15 border-theme-border/60"
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleWeek(week.weekNum)}
                  className="w-full px-3.5 py-3 flex items-center justify-between text-left focus:outline-none select-none"
                >
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-semibold text-theme-accent-primary/80 tracking-wider uppercase block">
                      WEEK {week.weekNum}
                    </span>
                    <h3 className="font-display font-bold text-theme-text text-xs">
                      {week.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-theme-muted">
                    <span className="text-[10px] font-mono bg-theme-bg border border-theme-border rounded px-1.5 py-0.5 text-theme-text font-bold">
                      {weekCompletedCount}/{week.days.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-theme-text" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                </button>

                {/* Day Items */}
                {isExpanded && (
                  <div className="border-t border-theme-border/60 p-1.5 space-y-1">
                    {week.days.map((day) => {
                      const isActive = activeDayId === day.id;
                      const isDone = completedDays[day.id];

                      return (
                        <button
                          key={day.id}
                          onClick={() => onSelectDay(day.id)}
                          className={`w-full p-2.5 rounded-lg text-left flex items-start gap-2.5 transition-all outline-none ${
                            isActive
                              ? "bg-theme-bg border border-theme-border text-theme-accent-primary font-medium scale-[0.98]"
                              : "hover:bg-theme-hover text-theme-muted hover:text-theme-text border border-transparent"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-theme-success fill-theme-success/10" />
                            ) : (
                              <Circle className="w-4 h-4 text-theme-muted/40 hover:text-theme-accent-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-[10px] font-mono uppercase bg-theme-bg border border-theme-border/60 px-1 py-0.5 rounded text-theme-muted">
                                {day.dayOfWeek} • {day.date}
                              </span>
                              {day.riddleLanguage === 'sql' && (
                                <span className="text-[8px] font-mono text-purple-400 px-1 border border-purple-500/10 rounded uppercase">
                                  sql
                                </span>
                              )}
                              {day.riddleLanguage === 'python' && (
                                <span className="text-[8px] font-mono text-amber-500 px-1 border border-amber-500/10 rounded uppercase">
                                  python
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs truncate font-medium text-theme-text">
                              {day.focusTitle}
                            </h4>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-4 bg-theme-card border-t border-theme-border text-[10px] text-theme-muted font-mono flex items-center justify-between select-none">
        <span>© 2026 DE Career Master</span>
        <div className="flex gap-2">
          <span className="text-theme-accent-primary font-bold">Aug 2026</span>
        </div>
      </div>
    </aside>
  );
}
