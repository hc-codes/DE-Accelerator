import React, { useMemo, useState } from "react";
import { 
  Award, Sparkles, Clock, Calendar, CheckSquare, 
  Play, BookOpen, Briefcase, Activity, CheckCircle2, 
  ChevronRight, ArrowRight, Flame, Hourglass, Trash2, Edit2, Check,
  GraduationCap, ClipboardCheck, Mail, Bell
} from "lucide-react";
import { CurriculumWeek, CurriculumDay } from "../../data/curriculum";
import { ActivityLogEntry } from "../../shared/types";

interface DashboardPageProps {
  curriculum: CurriculumWeek[];
  completedDays: { [dayId: string]: boolean };
  dayDetails: { [dayId: string]: any };
  menteeName: string;
  activityLog: ActivityLogEntry[];
  overallProgressPercent: number; // learning checklist pct
  challengeProgressPercent: number; // sandbox challenge completed pct
  completedUnitsCount: number;
  streakDays: number;
  readinessScore: number;
  onChangeName: (name: string) => void;
  onResumeLearning: (dayId: string) => void;
  onNavigateToView: (view: "curriculum" | "calendar" | "timeline", dayId?: string) => void;
  setRoute: (route: { mainView: string; selectedDayId: string; subView: { type: string } }) => void;
}

export function DashboardPage({
  curriculum,
  completedDays,
  dayDetails,
  menteeName,
  activityLog,
  overallProgressPercent,
  challengeProgressPercent,
  completedUnitsCount,
  streakDays,
  readinessScore,
  onChangeName,
  onResumeLearning,
  onNavigateToView,
  setRoute
}: DashboardPageProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(menteeName);

  const [reminderState, setReminderState] = useState<{
    sending: boolean;
    success: boolean | null;
    message: string;
    detailsVisible: boolean;
    simulatedBody?: string;
  }>({
    sending: false,
    success: null,
    message: "",
    detailsVisible: false,
  });

  const triggerEmailReminder = async () => {
    setReminderState(prev => ({ ...prev, sending: true, success: null, message: "" }));
    try {
      const response = await fetch("/api/coach/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "athilavp@gmail.com",
          pendingCount: daysPending,
          progressPercent: overallProgressPercent,
          nextLessonTitle: currentResumeDay?.focusTitle || "Relational Database Performance"
        })
      });
      const data = await response.json();
      if (data.success) {
        setReminderState({
          sending: false,
          success: true,
          message: data.message || "Email reminder dispatched successfully!",
          detailsVisible: !!data.simulated,
          simulatedBody: data.body
        });
      } else {
        setReminderState({
          sending: false,
          success: false,
          message: data.error || "Failed to send email. Check credentials.",
          detailsVisible: false
        });
      }
    } catch (err: any) {
      setReminderState({
        sending: false,
        success: false,
        message: err.message || "Failed to contact reminder dispatch service.",
        detailsVisible: false
      });
    }
  };

  // Fallback check if curriculum still loading
  const safeCurriculum = useMemo(() => {
    return curriculum.length > 0 ? curriculum : [];
  }, [curriculum]);

  // Determine current active day to display ("Resume Learning")
  const currentResumeDay = useMemo(() => {
    if (safeCurriculum.length === 0) return null;
    // Find first non-completed day
    for (const week of safeCurriculum) {
      for (const day of week.days) {
        if (!completedDays[day.id]) {
          return day;
        }
      }
    }
    return safeCurriculum[0]?.days[0] || null;
  }, [completedDays, safeCurriculum]);

  // Extract upcoming 5 days in curriculum sequence
  const upcomingDays = useMemo(() => {
    const list: CurriculumDay[] = [];
    if (!currentResumeDay || safeCurriculum.length === 0) return list;
    
    let foundCurrent = false;
    for (const week of safeCurriculum) {
      for (const day of week.days) {
        if (day.id === currentResumeDay.id) {
          foundCurrent = true;
        }
        if (foundCurrent && day.id !== currentResumeDay.id) {
          list.push(day);
          if (list.length >= 5) return list;
        }
      }
    }
    // Pad if near end of curriculum
    if (list.length < 5) {
      for (const week of safeCurriculum) {
        for (const day of week.days) {
          if (!list.find(d => d.id === day.id) && day.id !== currentResumeDay.id) {
            list.push(day);
            if (list.length >= 5) return list;
          }
        }
      }
    }
    return list.slice(0, 5);
  }, [currentResumeDay, safeCurriculum]);

  // Calculations for dynamic counts
  const daysTotal = useMemo(() => {
    return safeCurriculum.flatMap(w => w.days).length || 36;
  }, [safeCurriculum]);

  const daysPending = useMemo(() => {
    return Math.max(0, daysTotal - completedUnitsCount);
  }, [daysTotal, completedUnitsCount]);

  const completedChallengesCount = useMemo(() => {
    return safeCurriculum.flatMap(w => w.days).filter(d => {
      const details = dayDetails[d.id];
      return details?.challengeStatus === "Completed" || details?.savedApproved === true;
    }).length;
  }, [dayDetails, safeCurriculum]);
  
  // Relative days target count until mid-August 2026
  const daysUntilDeadline = useMemo(() => {
    const today = new Date("2026-06-14");
    const target = new Date("2026-08-15");
    const diffTime = Math.abs(target.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  // Compute Weekly completions
  const weekStats = useMemo(() => {
    return safeCurriculum.map(week => {
      const total = week.days.length;
      const completed = week.days.filter(d => completedDays[d.id]).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        weekNum: week.weekNum,
        title: week.title,
        completed,
        total,
        pct
      };
    });
  }, [completedDays, safeCurriculum]);

  const handleNameSave = () => {
    if (nameInput.trim()) {
      onChangeName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in" id="dashboard-container">
      
      {/* Top Hero Accent Header */}
      <section 
        id="dashboard-hero-section"
        className="relative overflow-hidden rounded-2xl border border-theme-border bg-theme-hover p-6 md:p-8 shadow-sm"
      >
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-72 h-72 rounded-full bg-theme-accent-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 rounded-full bg-theme-accent-secondary/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 mt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/20 px-2.5 py-0.5 rounded-full">
                Syllabus Learning OS
              </span>
              <span className="text-theme-muted font-mono text-[10px]">•</span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-theme-accent-secondary">
                <Hourglass className="w-3 h-3 text-theme-accent-secondary animate-spin-slow animate-pulse" />
                <span>Offer Target: Aug 2026 (In {daysUntilDeadline} Days)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-theme-bg border border-theme-border rounded px-2.5 py-1 text-theme-text text-lg md:text-xl font-bold focus:outline-none focus:border-theme-accent-primary"
                    autoFocus
                  />
                  <button 
                    onClick={handleNameSave}
                    className="p-1.5 rounded-lg bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/20 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-3xl font-display font-black text-theme-text tracking-tight uppercase animate-fade-in">
                    Welcome Back, {menteeName}!
                  </h2>
                  <button 
                    onClick={() => {
                      setNameInput(menteeName);
                      setIsEditingName(true);
                    }}
                    className="p-1 text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
                    title="Change profile name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-theme-muted text-xs md:text-sm max-w-2xl leading-relaxed">
              Your career trajectory is locked. Under-the-hood relational database analysis and dynamic coding sandboxes bridge your 4-year Informatica engineering mastery into modern code stacks.
            </p>
          </div>

          {/* Decoupled double stats bars */}
          <div className="bg-theme-card border border-theme-border p-4 rounded-xl shrink-0 space-y-3.5 w-full md:w-64">
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-mono text-theme-muted font-bold uppercase">
                <span>📋 Studying Checklist</span>
                <span className="text-theme-accent-primary font-black">{overallProgressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-theme-bg rounded-full overflow-hidden">
                <div 
                  className="h-full bg-theme-accent-primary transition-all duration-300"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-mono text-theme-muted font-bold uppercase">
                <span>💎 Sandbox Challenge Golds</span>
                <span className="text-theme-accent-secondary font-black">{challengeProgressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-theme-bg rounded-full overflow-hidden">
                <div 
                  className="h-full bg-theme-accent-secondary transition-all duration-300"
                  style={{ width: `${challengeProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="text-[10px] text-theme-muted/50 font-mono text-right border-t border-theme-border/60 pt-1.5">
              Pass criteria: Daily Drill Todos Checked
            </div>
          </div>
        </div>
      </section>

      {/* Quick Launch Buttons Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Assessment center launcher card */}
        <div 
          onClick={() => setRoute({ mainView: "assessments", selectedDayId: "", subView: { type: "list" } })}
          className="bg-theme-card border border-amber-500/10 hover:border-amber-500/40 p-5 rounded-2xl flex items-start gap-4 transition duration-200 cursor-pointer shadow-md glow-amber"
        >
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl mt-0.5">
            <GraduationCap className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
              Launch Diagnostic Assessment Center
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Examine multiple-choice conceptual mock exams, evaluate SQL scores, and view analytics-driven revision recommended days.
            </p>
          </div>
        </div>

        {/* Hidden Trainer portal invitation */}
        <div 
          onClick={() => setRoute({ mainView: "trainer", selectedDayId: "", subView: { type: "list" } })}
          className="bg-theme-card border border-indigo-500/10 hover:border-indigo-500/40 p-5 rounded-2xl flex items-start gap-4 transition duration-200 cursor-pointer shadow-md"
        >
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl mt-0.5">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
              Open Trainer Control Center
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Authorized portals for Trainer Hariprasad: edit syllabus models, insert custom topics, reschedule days, and review Athila's code logs.
            </p>
          </div>
        </div>

      </div>

      {/* Quick Stats Grid */}
      <section 
        id="dashboard-stats-grid"
        className="grid grid-cols-2 lg:grid-cols-6 gap-3.5"
      >
        <div className="bg-theme-card border border-theme-border p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-theme-accent-primary/10 border border-theme-accent-primary/15 text-theme-accent-primary shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-theme-muted">Syllabus Units</p>
            <p className="text-base font-bold text-theme-text">{daysTotal}</p>
          </div>
        </div>

        <div className="bg-theme-card border border-theme-border p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-theme-success/10 border border-theme-success/15 text-theme-success shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-theme-muted">Learning Completed</p>
            <p className="text-base font-bold text-theme-text">{completedUnitsCount}</p>
          </div>
        </div>

        <div className="bg-theme-card border border-theme-border p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-red-400/10 border border-red-400/15 text-red-400 shrink-0">
            <Hourglass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-theme-muted">Pending Units</p>
            <p className="text-base font-bold text-theme-text">{daysPending}</p>
          </div>
        </div>

        <div className="bg-theme-card border border-theme-border p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/15 text-amber-500 shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-theme-muted">Daily Streak</p>
            <p className="text-base font-bold text-theme-text">{streakDays} Days</p>
          </div>
        </div>

        <div className="bg-theme-card border border-theme-border p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-theme-accent-secondary/10 border border-theme-accent-secondary/15 text-theme-accent-secondary shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-theme-muted">Challenge Golds</p>
            <p className="text-base font-bold text-theme-text">{completedChallengesCount}</p>
          </div>
        </div>

        <div className="bg-theme-card border border-theme-border p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/15 text-purple-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-theme-muted">Readiness Score</p>
            <p className="text-base font-bold text-theme-text">{readinessScore}%</p>
          </div>
        </div>
      </section>

      {/* Continuing Progress study prompt */}
      {currentResumeDay && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-theme-card border border-theme-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-theme-accent-secondary font-semibold tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> CONTINUE TRAINING SEQUENCE
                </span>
                <span className="text-[10px] font-mono text-theme-muted">Assigned Today</span>
              </div>

              <div className="p-4 bg-theme-bg rounded-xl border border-theme-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-theme-accent-primary">Week {currentResumeDay.weekIndex} • Day {currentResumeDay.id.split("-")[1]?.replace("D", "")}</span>
                  <span className="text-theme-muted uppercase">{currentResumeDay.date}</span>
                </div>
                <h3 className="text-theme-text font-display font-black text-sm md:text-base">
                  {currentResumeDay.focusTitle}
                </h3>
                <p className="text-theme-muted text-xs leading-relaxed max-w-xl">
                  Bridge: <span className="text-theme-text font-medium">{currentResumeDay.informaticaConcept}</span> maps to <span className="text-theme-accent-primary outline-none font-medium">{currentResumeDay.modernEquivalent}</span>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-theme-border/60 pt-4">
              <div className="text-xs text-theme-muted flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-theme-muted/60" />
                <span>{currentResumeDay.todos?.length || 3} tasks and 1 challenge awaiting.</span>
              </div>
              
              <button
                onClick={() => onResumeLearning(currentResumeDay.id)}
                className="px-5 py-2.5 bg-theme-accent-primary hover:opacity-90 text-theme-inverse font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Resume Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mini Calendar Widget */}
          <div className="bg-theme-card border border-theme-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-theme-accent-primary font-semibold tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> SYLLABUS DIRECTORY MAP
                </span>
                <button 
                  onClick={() => onNavigateToView("calendar")}
                  className="text-theme-muted hover:text-theme-accent-primary text-[10px] font-mono transition-colors uppercase cursor-pointer"
                >
                  Expand View →
                </button>
              </div>

              <div className="p-3 bg-theme-bg rounded-xl border border-theme-border">
                <div className="grid grid-cols-6 gap-2 text-center max-h-48 overflow-y-auto scrollbar-thin">
                  {safeCurriculum.flatMap(w => w.days).map((day, idx) => {
                    const isCompleted = completedDays[day.id];
                    const isActive = day.id === currentResumeDay.id;

                    return (
                      <button
                        key={day.id}
                        onClick={() => onNavigateToView("curriculum", day.id)}
                        title={`${day.focusTitle} (${day.id})`}
                        className={`h-7 rounded-md font-mono text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer relative ${
                          isCompleted
                            ? "bg-theme-success/15 border border-theme-success/35 text-theme-success"
                            : isActive
                              ? "bg-theme-accent-primary/25 border border-theme-accent-primary text-theme-accent-primary ring-1 ring-theme-accent-primary/35"
                              : "bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text"
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isCompleted && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-theme-success rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center mt-3 text-[8px] font-mono text-theme-muted px-1 pt-1.5 border-t border-theme-border">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-theme-success inline-block"></span> Pass</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-theme-accent-primary inline-block"></span> Next</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-theme-card inline-block"></span> Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pathway logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next 5 topics list */}
        <div className="bg-theme-card border border-theme-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase text-theme-muted font-semibold tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-theme-accent-primary" /> UPCOMING STUDY SEQUENCE (NEXT 5 UNITS)
            </span>
 
            <div className="divide-y divide-theme-border/50 text-xs">
              {upcomingDays.length === 0 ? (
                <p className="text-theme-muted italic py-6 text-center text-[11px]">Syllabus sequence complete!</p>
              ) : (
                upcomingDays.map((day) => (
                  <div 
                    key={day.id} 
                    className="py-3 last:pb-0 flex items-center justify-between gap-4 transition duration-200"
                  >
                    <div className="flex items-center gap-3 font-sans">
                      <div className="w-7 h-7 rounded bg-theme-bg border border-theme-border font-mono text-[9px] font-bold text-theme-muted flex items-center justify-center shrink-0">
                        {day.id}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-theme-text truncate">{day.focusTitle}</h4>
                        <p className="text-[10px] text-theme-muted font-mono truncate">
                          Bridge: {day.informaticaConcept}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onNavigateToView("curriculum", day.id)}
                      className="p-1 px-2 border border-theme-border rounded bg-theme-bg text-theme-muted hover:text-theme-accent-primary transition font-mono text-[8px] flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
 
        {/* Recent logs */}
        <div className="bg-theme-card border border-theme-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase text-theme-muted font-semibold tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-theme-accent-primary" /> RECENT STREAM ACTIVITY LOGS
            </span>
 
            <div className="space-y-3 max-h-[290px] overflow-y-auto px-1 scrollbar-thin">
              {activityLog.length === 0 ? (
                <p className="text-xs text-theme-muted italic py-12 text-center font-mono">No learning events tracked in current session.</p>
              ) : (
                activityLog.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex gap-3 items-start text-xs font-sans">
                    <div className={`p-1 rounded mt-0.5 shrink-0 border ${
                      log.type === "todo_completed" || log.type === "day_completed" || log.type === "challenge_solved"
                        ? "bg-theme-success/10 border-theme-success/20 text-theme-success"
                        : "bg-theme-accent-primary/10 border-theme-accent-primary/20 text-theme-accent-primary"
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-theme-text">{log.title}</h4>
                        <span className="text-[8px] font-mono text-theme-muted bg-theme-bg border border-theme-border px-1 rounded uppercase font-semibold">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[10px] text-theme-muted mt-0.5 leading-relaxed font-mono">{log.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Daily Reminders Integration */}
        <div className="bg-theme-card border border-theme-border p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm" id="reminders-panel">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase text-theme-muted font-semibold tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-theme-accent-primary animate-pulse" /> DAILY CAMPAIGN REMINDER SERVICE
            </span>

            <div className="space-y-3 text-xs leading-relaxed font-sans">
              <div className="bg-theme-bg/60 p-3 rounded-xl border border-theme-border space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-theme-muted font-bold">RECIPIENT PORTAL</span>
                  <span className="text-theme-success font-black tracking-widest bg-theme-success/10 border border-theme-success/20 px-1.5 py-0.5 rounded text-[8px]">ACTIVE</span>
                </div>
                <p className="text-theme-text font-bold text-xs truncate">athilavp@gmail.com</p>
                <div className="flex items-center gap-1 font-mono text-[9px] text-theme-muted pt-0.5">
                  <Clock className="w-3 h-3 text-theme-accent-primary" />
                  <span>Daily at 8:45 PM IST</span>
                </div>
              </div>

              <div className="space-y-1 bg-theme-bg/20 p-2.5 rounded-xl border border-theme-border/60 text-[10px] text-theme-muted font-sans">
                <p className="font-bold text-theme-text flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-theme-accent-secondary" /> Study Campaign Parameters:
                </p>
                <ul className="list-disc list-inside space-y-0.5 mt-1 font-mono text-[9px]">
                  <li>Pending Tasks: {daysPending} units left</li>
                  <li>Overall Progress: {overallProgressPercent}%</li>
                  <li>Recommended: {currentResumeDay?.focusTitle || "Next Lesson"}</li>
                </ul>
              </div>

              {reminderState.success !== null && (
                <div className={`p-2.5 rounded-lg border text-[10px] ${
                  reminderState.success 
                    ? "bg-theme-success/10 border-theme-success/20 text-theme-success" 
                    : "bg-red-400/10 border-red-400/20 text-red-400"
                }`}>
                  <p className="font-bold font-mono">{reminderState.success ? "✓ Reminders Formed" : "✗ Dispatch Failure"}</p>
                  <p className="mt-0.5 leading-snug">{reminderState.message}</p>
                  
                  {reminderState.simulatedBody && (
                    <div className="mt-2 pt-1.5 border-t border-theme-border/10">
                      <button 
                        onClick={() => setReminderState(prev => ({ ...prev, detailsVisible: !prev.detailsVisible }))}
                        className="text-[9px] font-mono underline hover:text-theme-accent-primary cursor-pointer flex items-center gap-1"
                      >
                        {reminderState.detailsVisible ? "Hide Email Output" : "View Rendereable Output"}
                      </button>
                      
                      {reminderState.detailsVisible && (
                        <div className="bg-theme-bg p-2 rounded border border-theme-border max-h-24 overflow-y-auto font-mono text-[8px] text-theme-muted mt-1 leading-normal select-text">
                          <p className="text-theme-accent-primary font-bold">To: athilavp@gmail.com</p>
                          <p className="text-theme-accent-secondary font-bold">Subject: Today's Learning Session Awaits 🚀</p>
                          <div className="mt-1.5 border-t border-theme-border/50 pt-1 text-[8px]">
                            {reminderState.simulatedBody.replace(/<[^>]*>/g, " ").trim().substring(0, 320)}...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={triggerEmailReminder}
            disabled={reminderState.sending}
            className={`w-full py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider rounded-xl transition duration-150 border cursor-pointer shrink-0 flex items-center justify-center gap-1.5 ${
              reminderState.sending 
                ? "bg-theme-hover border-theme-border text-theme-muted cursor-not-allowed" 
                : "bg-theme-accent-primary border-theme-accent-primary/20 hover:opacity-90 text-theme-inverse"
            }`}
          >
            {reminderState.sending ? "Dispatching Alert..." : "⚡ Dispatch Manual Reminder"}
          </button>
        </div>
 
      </div>

      {/* Weekly Progress Breakdown cards */}
      <section 
        id="weekly-progress-section"
        className="bg-theme-card border border-theme-border p-5 rounded-2xl space-y-4"
      >
        <span className="text-[10px] font-mono uppercase text-theme-muted font-semibold tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-theme-accent-secondary" /> ACCELERATOR SECTOR SYLLABUS SPLIT (WEEKS)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3.5">
          {weekStats.map(week => (
            <div 
              key={week.weekNum} 
              className="p-3.5 bg-theme-bg border border-theme-border hover:border-theme-border/80 rounded-xl flex flex-col justify-between space-y-3 transition duration-150"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold text-theme-muted">Week {week.weekNum}</span>
                <span className="text-[10px] font-mono text-theme-accent-secondary font-bold">{week.pct}%</span>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-theme-text line-clamp-1 truncate" title={week.title}>
                  {week.title}
                </h4>
                <div className="w-full h-1 bg-theme-card rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-theme-accent-primary transition-all duration-300"
                    style={{ width: `${week.pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-theme-muted">
                  <span>Completed</span>
                  <span>{week.completed}/{week.total}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
