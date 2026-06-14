import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  ChevronRight, ArrowLeft, CheckCircle2, Square, Clock, 
  HelpCircle, Calendar, Sparkles, BookOpen, AlertTriangle, 
  Cpu, Award, Play, ExternalLink, ShieldCheck, Dumbbell, Terminal,
  ChevronDown, ChevronUp, Zap, Check, CheckCircle
} from "lucide-react";
import { CurriculumDay, CurriculumWeek } from "../../data/curriculum";
import { DayProgress, SubViewType } from "../../shared/types";
import { InteractiveCodeLab } from "../../components/InteractiveCodeLab";
import { KnowledgeCheckPortal } from "../../components/KnowledgeCheckPortal";

interface DayDetailPageProps {
  curriculum: CurriculumWeek[];
  day: CurriculumDay;
  progress: DayProgress;
  completedDays: { [dayId: string]: boolean };
  onToggleTodo: (todoIdx: number) => void;
  onNavigateHome: () => void;
  onNavigateCurriculum: () => void;
  onNavigateToSubView: (subView: SubViewType) => void;
  subView: SubViewType;
  onSaveCodeDay: (code: string) => void;
  onSubmitCodeResultDay: (approved: boolean, review: string) => void;
  onGoToNextDay?: () => void;
  onUpdateChallengeStatus?: (dayId: string, status: "Not Started" | "In Progress" | "Completed" | "Skipped") => void;
}

export function DayDetailPage({
  curriculum,
  day,
  progress,
  completedDays,
  onToggleTodo,
  onNavigateHome,
  onNavigateCurriculum,
  onNavigateToSubView,
  subView,
  onSaveCodeDay,
  onSubmitCodeResultDay,
  onGoToNextDay,
  onUpdateChallengeStatus
}: DayDetailPageProps) {
  // State variables for progressive disclosure
  const [expandedTodoIdx, setExpandedTodoIdx] = useState<number | null>(null);
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  
  // State for collapsible Informatica -> Modern Code references
  const [expandedBridgeCards, setExpandedBridgeCards] = useState<{ [key: string]: boolean }>({
    concept: false,
    sql: false,
    usage: false,
    performance: false
  });

  // Keep a reference to expanded items to scroll on expansion
  const todoRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const totalTodos = day.todos.length;
  const completedTodosCount = useMemo(() => {
    return Object.values(progress.todos).filter(Boolean).length;
  }, [progress.todos]);

  const activeDayProgressPercent = Math.round((completedTodosCount / totalTodos) * 100);

  // Derive Week completion statistics
  const currentWeekDays = useMemo(() => {
    for (const week of curriculum) {
      if (week.weekNum === day.weekIndex) {
        return week.days;
      }
    }
    return [];
  }, [day.weekIndex, curriculum]);

  const completedWeekDays = useMemo(() => {
    return currentWeekDays.filter(d => completedDays[d.id]).length;
  }, [currentWeekDays, completedDays]);

  // Next action computation logic
  const nextAction = useMemo(() => {
    const incompleteIdx = day.todos.findIndex((_, idx) => !progress.todos[idx]);
    if (incompleteIdx !== -1) {
      return {
        title: `Complete Task #${incompleteIdx + 1}: ${day.todos[incompleteIdx]}`,
        description: "Review concepts, analyze real-world examples, and tick this milestone.",
        type: "todo",
        index: incompleteIdx
      };
    }
    // We treat the day as completed once todos are checked off, independent of sandbox.
    return {
      title: "All Curriculum Learning Tasks Cleared! 🎉",
      description: "You've successfully completed all todos. Move on or solve the advanced sandbox optionally.",
      type: "completed"
    };
  }, [day, progress.todos]);

  const toggleBridgeCard = (card: string) => {
    setExpandedBridgeCards(prev => ({
      ...prev,
      [card]: !prev[card]
    }));
  };

  const handleActionClick = () => {
    if (nextAction.type === "todo" && nextAction.index !== undefined) {
      setExpandedTodoIdx(nextAction.index);
      setTimeout(() => {
        todoRefs.current[nextAction.index!]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else if (nextAction.type === "completed" && onGoToNextDay) {
      onGoToNextDay();
    }
  };

  const getTodoMeta = (idx: number, todoText: string) => {
    const isBridge = todoText.toLowerCase().includes("informatica") || todoText.toLowerCase().includes("mapping");
    const isLab = todoText.toLowerCase().includes("riddle") || todoText.toLowerCase().includes("solve") || todoText.toLowerCase().includes("snippet");
    
    return {
      duration: isLab ? "20 Mins" : isBridge ? "15 Mins" : "10 Mins",
      difficulty: isLab ? "Medium" : "Easy" as "Easy" | "Medium" | "Hard",
      learningType: isLab ? "Practice" : isBridge ? "Informatica-Bridge" : "Concept"
    };
  };

  // Structured Todo Content Generator (dynamic documentation caching)
  const getTodoContent = (todoIdx: number, todoTitle: string) => {
    const meta = getTodoMeta(todoIdx, todoTitle);
    
    return {
      objective: `Master the complete physical, visual, and performance characteristics of '${day.focusTitle}' inside production pipelines.`,
      conceptExplanation: `In high-volume streaming, '${day.focusTitle}' represents critical stage gate operations. While traditional visual maps run within dedicated local ETL caches, modern cloud architectures translate this operations logic directly into vectorized compiler instructions mapped flatly onto cloud database engines (reducing network serialization costs from DB-to-ETL servers).`,
      informaticaMapping: `Visual Pipeline: '${day.informaticaConcept}'\nMapping workflow hierarchy: Port links -> setup properties criteria -> pipe metadata forward.\n\nCode Translation: The property dialog expression corresponds directly to '${day.modernEquivalent}' queries executed natively in-database.`,
      codeEquivalent: `${day.riddleLanguage === "sql" ? 
`-- Production SQL Pattern
SELECT 
  employee_id, 
  first_name, 
  last_name,
  salary,
  CASE WHEN department_id = 10 THEN 'Core DE Dept' ELSE 'Standard' END as staff_meta
FROM employees
WHERE salary > 120000 
  AND hire_date < '2026-01-01'
ORDER BY salary DESC;` : 
`# Vectorized Pandas Data Pipeline
import pandas as pd

df = pd.read_csv("employees.csv")
target_mask = (df["salary"] > 120000) & (df["hire_date"] < "2026-01-01")
filtered_df = df[target_mask]
print(filtered_df.head(10))`}`,
      performanceNotes: `1. Physical pushdown optimization (PDO) translates ETL logical models directly to source SQL queries.\n2. Filter qualifiers should reside as close to source tables as possible to reduce intermediate memory arrays.\n3. Keep CASE statements shallow to maximize CPU vectorization pathways in analytical queries.`,
      interviewNotes: `Q: What is the benefit of filtering in a SQL source query vs. an ETL filter node?\nA: Filtering in SQL reduces transmission load over network lines, filters out records before memory buffers are populated, and leverages database indices directly.`,
      summary: `Transitioning visual patterns to written code simplifies Git branch versioning, supports native software testing, and unlocks massive distributed speed benchmarks.`,
      resources: [
        { label: "Modern Pipeline Design Guides", url: "https://github.com" },
        { label: "In-Database Execution Best Practices", url: "https://stackoverflow.com" }
      ]
    };
  };

  return (
    <div className="animate-fade-in relative max-w-[750px] mx-auto w-full pb-16 space-y-8 px-1 sm:px-4 font-sans" id="day-detail-reading-layout">
      {/* Sticky top reading progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-theme-border/15 z-50 pointer-events-none">
        <div 
          className="h-full bg-theme-accent-primary transition-all duration-300"
          style={{ width: `${activeDayProgressPercent}%` }}
        />
      </div>
      
      {/* breadcrumb bar */}
      <nav 
        id="day-detail-breadcrumb"
        className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] font-mono text-theme-muted whitespace-nowrap bg-theme-card/30 px-3.5 py-2.5 rounded-xl border border-theme-border/60"
      >
        <button onClick={onNavigateHome} className="hover:text-theme-accent-primary transition-colors cursor-pointer text-theme-muted">
          Dashboard
        </button>
        <ChevronRight className="w-3 h-3 text-theme-muted shrink-0" />
        <button onClick={onNavigateCurriculum} className="hover:text-theme-accent-primary transition-colors cursor-pointer text-theme-muted">
          Curriculum
        </button>
        <ChevronRight className="w-3 h-3 text-theme-muted shrink-0" />
        <span className="text-theme-accent-secondary font-bold uppercase text-[10px]">Week {day.weekIndex}</span>
        <ChevronRight className="w-3 h-3 text-theme-muted shrink-0" />
        <span className="text-theme-text font-black text-[10px] uppercase truncate">{day.focusTitle}</span>
      </nav>

      {/* 1. Daily Progress Header */}
      <header className="bg-theme-card/30 p-6 sm:p-8 rounded-2xl border border-theme-border flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-mono uppercase bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/20 px-2.5 py-0.5 rounded-md font-semibold font-sans">
              Week {day.weekIndex} • Day {day.id.split("-")[1]?.replace("D", "")}
            </span>
            <span className="text-[10px] font-mono uppercase bg-theme-accent-secondary/10 text-theme-accent-secondary border border-theme-accent-secondary/20 px-2.5 py-0.5 rounded-md font-semibold font-sans">
              🏁 Est: 45 Mins
            </span>
            {completedDays[day.id] && (
              <span className="text-[10px] bg-theme-success/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md font-mono font-bold font-sans">
                ✓ Passed
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-display font-medium text-theme-text tracking-tight uppercase">
            {day.focusTitle}
          </h2>
          <p className="text-xs text-theme-muted max-w-xl font-normal leading-relaxed">
            Syllabus Unit Focus: {day.riddleTitle || "Modern equivalents"}. Transition Informatica mappings into high-performance cloud engines.
          </p>
        </div>

        {/* Minimalist Progress Meter */}
        <div className="bg-theme-card p-4 rounded-xl border border-theme-border w-full md:w-60 shrink-0">
          <div className="flex justify-between items-center text-[10px] font-mono text-theme-muted mb-2">
            <span>DAY MILESTONES:</span>
            <span className="font-bold text-theme-text">{completedTodosCount} / {totalTodos} Checked</span>
          </div>
          <div className="w-full h-1 bg-theme-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-theme-accent-primary transition-all duration-500"
              style={{ width: `${activeDayProgressPercent}%` }}
            />
          </div>
          
          <div className="border-t border-theme-border/50 pt-2.5 mt-2.5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-theme-muted">Module clear rate:</span>
            <span className="text-theme-accent-primary font-bold">{completedWeekDays} / {currentWeekDays.length} Done</span>
          </div>
        </div>
      </header>

      {/* Up Next Action banner */}
      <section className="bg-theme-card border border-theme-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm animate-fade-in text-xs font-sans">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/15 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-theme-accent-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-theme-accent-primary uppercase tracking-wider">
                Up Next Action Goal
              </span>
              <span className="w-1 h-1 rounded-full bg-theme-accent-primary animate-ping" />
            </div>
            <h4 className="font-sans font-medium text-theme-text text-xs tracking-tight leading-snug">
              {nextAction.title}
            </h4>
            <p className="text-theme-muted text-[11px] font-normal leading-relaxed">
              {nextAction.description}
            </p>
          </div>
        </div>
        
        {nextAction.type === "todo" ? (
          <button
            onClick={handleActionClick}
            className="px-4 py-2 bg-theme-accent-primary hover:opacity-90 text-[11px] font-semibold tracking-wider transition rounded-lg cursor-pointer shrink-0 text-slate-950 uppercase font-mono"
          >
            Go to Task
          </button>
        ) : onGoToNextDay ? (
          <button
            onClick={onGoToNextDay}
            className="px-4 py-2 bg-theme-accent-primary hover:opacity-90 text-[11px] font-semibold tracking-wider transition rounded-lg cursor-pointer shrink-0 text-slate-950 uppercase font-mono"
          >
            Next Day ➔
          </button>
        ) : null}
      </section>

      {/* 3. Interactive Tasks Checklist */}
      <section className="space-y-4 font-sans text-xs">
        <h3 className="font-sans font-medium text-theme-text text-sm tracking-tight flex items-center gap-2 border-b border-theme-border/60 pb-2 uppercase font-black">
          <CheckCircle2 className="w-4 h-4 text-theme-accent-primary" />
          Task milestones Checklist
        </h3>

        <div className="grid grid-cols-1 gap-3.5">
          {day.todos.map((todo, idx) => {
            const isChecked = !!progress.todos[idx];
            const meta = getTodoMeta(idx, todo);
            const isExpanded = expandedTodoIdx === idx;
            const content = getTodoContent(idx, todo);

            return (
              <div 
                key={idx}
                ref={el => todoRefs.current[idx] = el}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded 
                    ? "bg-theme-card border-theme-accent-primary/60 shadow-md" 
                    : isChecked
                      ? "bg-theme-card/25 border-theme-border/40 text-theme-muted"
                      : "bg-theme-card/45 border-theme-border/80 hover:bg-theme-hover text-theme-text"
                }`}
              >
                {/* Accordion Row Header */}
                <div 
                  onClick={() => setExpandedTodoIdx(isExpanded ? null : idx)}
                  className="p-4 flex items-center justify-between gap-4 select-none cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTodo(idx);
                      }}
                      className="shrink-0 p-0.5 rounded hover:bg-theme-hover transition"
                      title={isChecked ? "Uncheck milestone" : "Check milestone"}
                    >
                      {isChecked ? (
                        <CheckCircle className="w-4 h-4 text-theme-accent-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-theme-muted" />
                      )}
                    </button>
                    
                    <span className={`font-sans text-xs font-bold truncate leading-relaxed ${isChecked ? "line-through opacity-60" : ""}`}>
                      {todo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 font-mono text-[9px] uppercase">
                    <span className="text-theme-muted">{meta.duration}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      meta.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {meta.difficulty}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-theme-muted" />}
                  </div>
                </div>

                {/* Micro checklist study assets disclosure details */}
                {isExpanded && (
                  <div className="p-4.5 border-t border-theme-border bg-theme-bg/15 space-y-4 animate-fade-in text-xs font-sans">
                    <div className="space-y-1.5 max-w-2.5xl">
                      <h5 className="font-mono text-[10px] text-theme-accent-primary uppercase font-bold">
                        Study Reference Concept Note
                      </h5>
                      <p className="text-xs text-theme-muted leading-relaxed font-sans font-normal">
                        {content.conceptExplanation}
                      </p>
                    </div>

                    <div className="space-y-2 border border-theme-border/50 p-4 rounded-xl bg-theme-bg/30">
                      <h5 className="text-[10px] font-mono text-amber-500 uppercase font-black flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-amber-500" /> Informatica Port Visual Mapping Link
                      </h5>
                      <pre className="text-[11px] font-mono text-code-text bg-code-bg p-3 rounded-lg overflow-x-auto whitespace-pre-wrap border border-code-border">
                        <code>{content.informaticaMapping}</code>
                      </pre>
                    </div>

                    <div className="space-y-2">
                       <h5 className="text-[10px] font-mono text-theme-accent-primary uppercase font-black flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-theme-accent-primary" /> Production Code Implementation (Standard)
                      </h5>
                      <div className="p-4 bg-code-bg border border-code-border rounded-xl overflow-x-auto">
                        <pre className="text-[11px] font-mono text-code-text font-semibold leading-relaxed">
                          <code>{content.codeEquivalent}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Interview notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-theme-border/50 max-w-2xl text-xs font-sans">
                      <div className="space-y-1.5">
                        <h6 className="text-[9px] font-mono uppercase text-theme-accent-secondary font-black flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> Career Expert Q&A
                        </h6>
                        <p className="text-[11px] text-theme-muted leading-relaxed font-sans">
                          {content.interviewNotes}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">
                          Industry Manual Check
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {content.resources.map((res, rIdx) => (
                            <a 
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] font-sans text-theme-accent-primary bg-theme-card border border-theme-border px-2.5 py-1 rounded hover:bg-theme-hover flex items-center gap-1.5 font-bold"
                            >
                              <span>{res.label}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Daily Coding Challenge Module */}
      <section className="bg-gradient-to-br from-theme-card to-theme-bg border border-theme-border rounded-2xl overflow-hidden shadow-md">
        <div 
          onClick={() => setIsChallengeOpen(!isChallengeOpen)}
          className="bg-theme-card/60 p-4.5 border-b border-theme-border flex items-center justify-between cursor-pointer select-none text-xs"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border shrink-0 ${
              progress.savedApproved 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
            }`}>
              <Award className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider font-semibold text-theme-accent-secondary uppercase">
                  Logical Sandbox assignment
                </span>
                {progress.challengeStatus ? (
                  <span className={`text-[8px] font-mono border px-1.5 rounded uppercase font-bold ${
                    progress.challengeStatus === "Completed" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-indigo-500/15 text-indigo-400 border-indigo-500/20"
                  }`}>
                    {progress.challengeStatus}
                  </span>
                ) : progress.savedApproved === true ? (
                  <span className="text-[8px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 rounded uppercase font-bold">
                    Completed
                  </span>
                ) : (
                  <span className="text-[8px] font-mono bg-theme-bg border border-theme-border text-theme-muted px-1.5 rounded uppercase font-medium">
                    Not Started
                  </span>
                )}
              </div>
              <h3 className="font-display font-black text-theme-text text-[13px] leading-tight mt-0.5 uppercase">
                Practice Lab: {day.riddleTitle}
              </h3>
            </div>
          </div>

          <button className="p-1 px-3 bg-theme-bg hover:bg-theme-hover rounded-lg border border-theme-border text-theme-muted text-[10px] font-mono flex items-center gap-1.5 cursor-pointer">
            <span>{isChallengeOpen ? "Collapse Editor" : "Attempt Sandbox"}</span>
            {isChallengeOpen ? <ChevronUp className="w-3.5 h-3.5 text-theme-accent-secondary" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* playground sandbox editor */}
        {isChallengeOpen && (
          <div className="p-5 bg-theme-bg/30 space-y-4 animate-fade-in text-xs font-sans" id="interactive-playground">
            
            {/* Decoupled Challenge status override segment control selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-theme-bg border border-theme-border rounded-xl">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black text-theme-accent-secondary uppercase">Sandbox challenge status:</span>
                <p className="text-[10px] text-theme-muted">Self-declare status independently from checklists.</p>
              </div>
              <div className="flex bg-theme-card p-1 border border-theme-border rounded-xl text-[10px] font-mono select-none">
                {(["Not Started", "In Progress", "Completed", "Skipped"] as const).map((status) => {
                  const activeStatus = progress.challengeStatus || (progress.savedApproved ? "Completed" : "Not Started");
                  const isSel = activeStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onUpdateChallengeStatus) {
                          onUpdateChallengeStatus(day.id, status);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                        isSel 
                          ? "bg-theme-accent-secondary text-slate-950 font-black shadow"
                          : "text-theme-muted hover:text-theme-text"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            <InteractiveCodeLab 
              day={day}
              savedCode={progress.savedCode}
              onSaveCode={onSaveCodeDay}
              onSubmitFinish={onSubmitCodeResultDay}
              savedReview={progress.savedReview}
              savedApproved={progress.savedApproved}
            />
          </div>
        )}
      </section>

      {/* 5. Collapsible core textbook theories */}
      <section className="bg-theme-card/30 border border-theme-border/60 rounded-xl overflow-hidden shadow-sm font-sans text-xs">
        <button
          onClick={() => setIsTheoryOpen(!isTheoryOpen)}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer focus:outline-none hover:bg-theme-card/50 transition"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-theme-accent-primary" />
            <span className="font-display font-bold text-theme-text text-xs uppercase tracking-wide">
              📚 Collapsible Core Concept Study Notes
            </span>
          </div>
          {isTheoryOpen ? <ChevronUp className="w-4 h-4 text-theme-accent-primary" /> : <ChevronDown className="w-4 h-4 text-theme-muted" />}
        </button>

        {isTheoryOpen && (
          <div className="p-5 border-t border-theme-border/60 bg-theme-bg/10 text-theme-muted leading-relaxed space-y-4 animate-fade-in font-normal select-text">
            <p>
              This day's study centers on compiling highly structured logic statements. In legacy drag-and-drop workflow topologies, engineers map structural pipelines by establishing explicit connection attributes inside visual windows. While intuitive at low scales, visual mappers abstract compiling states behind high-overhead runtime containers.
            </p>
            <p>
              In extreme enterprise scaling, these visual nodes operate as physical drag points. To scale computations on massive multi-petabyte analytics, modern cloud-native systems completely bypass graphical translation layers. Code algorithms (executed as SQL or vectorized Python Pandas arrays) are compile-mapped right at source level, leveraging deep database indexing hierarchies and vectorized hardware instructions.
            </p>
            <div className="bg-theme-accent-primary/5 p-3.5 rounded-xl border border-theme-accent-primary/10 text-[11px] font-sans italic text-theme-text font-medium">
              "As an Elite career advisor, I encourage you to see writing code as simply drawing a pipeline logic visually on paper, then writing individual words to make the database construct it automatically. Your visual mapping logic is your hidden power, champion!"
            </div>
          </div>
        )}
      </section>

      {/* 6. Collapsible Informatica -> Modern Engineering Mapping Cards */}
      <section className="space-y-3 font-sans text-xs">
        <div className="flex items-center justify-between border-b border-theme-border/60 pb-2">
          <h4 className="font-display font-bold text-theme-text text-[10px] tracking-widest uppercase">
            🌉 Informatica-to-Code Reference Guides
          </h4>
          <span className="text-[9px] font-mono text-theme-muted italic">Click headers to expand</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Concept */}
          <div className="bg-theme-card/30 border border-theme-border rounded-xl overflow-hidden">
            <button 
              onClick={() => toggleBridgeCard("concept")}
              className="w-full p-3 flex items-center justify-between text-left focus:outline-none hover:bg-theme-card/50"
            >
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono uppercase text-theme-accent-secondary font-black block">Phase #1</span>
                <span className="font-sans font-bold text-theme-text">Visual Node Port</span>
              </div>
              {expandedBridgeCards.concept ? <ChevronUp className="w-3.5 h-3.5 text-theme-accent-secondary" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            {expandedBridgeCards.concept && (
              <div className="p-3.5 border-t border-theme-border bg-theme-bg/40 text-[11px] text-theme-muted leading-relaxed space-y-1.5">
                <p className="text-theme-text font-bold">IDMC Visual Port:</p>
                <code className="text-[10px] bg-code-bg text-code-text p-1 rounded font-mono border border-theme-border inline-block w-full">{day.informaticaConcept}</code>
                <p className="pt-1">Columns are mapped through explicit visual ports. Conditional filters are declared as static metadata dialog boxes.</p>
              </div>
            )}
          </div>

          {/* Card 2: SQL Equivalent */}
          <div className="bg-theme-card/30 border border-theme-border rounded-xl overflow-hidden">
            <button 
              onClick={() => toggleBridgeCard("sql")}
              className="w-full p-3 flex items-center justify-between text-left focus:outline-none hover:bg-theme-card/50"
            >
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono uppercase text-theme-accent-primary font-black block">Phase #2</span>
                <span className="font-sans font-bold text-theme-text">Modern Code Bridge</span>
              </div>
              {expandedBridgeCards.sql ? <ChevronUp className="w-3.5 h-3.5 text-theme-accent-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-theme-muted" />}
            </button>
            {expandedBridgeCards.sql && (
              <div className="p-3.5 border-t border-theme-border bg-theme-bg/40 text-[11px] text-theme-muted leading-relaxed space-y-1.5">
                <p className="text-theme-text font-bold">Code Construct:</p>
                <code className="text-[10px] bg-code-bg text-theme-accent-primary p-1 rounded font-mono border border-theme-border inline-block w-full">{day.modernEquivalent}</code>
                <p className="pt-1">Translates properties dialog expression immediately to database instructions. No memory visualizer nodes required.</p>
              </div>
            )}
          </div>

          {/* Card 3: Real World Usage */}
          <div className="bg-theme-card/30 border border-theme-border rounded-xl overflow-hidden">
            <button 
              onClick={() => toggleBridgeCard("usage")}
              className="w-full p-3 flex items-center justify-between text-left focus:outline-none hover:bg-theme-card/50"
            >
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono uppercase text-amber-500 font-yellow block">Phase #3</span>
                <span className="font-sans font-bold text-theme-text">Industry Usage</span>
              </div>
              {expandedBridgeCards.usage ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-theme-muted" />}
            </button>
            {expandedBridgeCards.usage && (
              <div className="p-3.5 border-t border-theme-border bg-theme-bg/40 text-[11px] text-theme-muted leading-relaxed">
                <p className="text-theme-text font-bold">Production Orchestration:</p>
                <p className="pt-1">{day.bridgeDetails || "Utilized directly within automated cron files or Airflow Directed Acyclic Graphs (DAGs) to filter and route billions of daily streaming system transactions."}</p>
              </div>
            )}
          </div>

          {/* Card 4: Performance */}
          <div className="bg-theme-card/30 border border-theme-border rounded-xl overflow-hidden">
            <button 
              onClick={() => toggleBridgeCard("performance")}
              className="w-full p-3 flex items-center justify-between text-left focus:outline-none hover:bg-theme-card/50"
            >
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono uppercase text-purple-400 font-black block">Phase #4</span>
                <span className="font-sans font-bold text-theme-text">Latency Delta</span>
              </div>
              {expandedBridgeCards.performance ? <ChevronUp className="w-3.5 h-3.5 text-purple-400" /> : <ChevronDown className="w-3.5 h-3.5 text-theme-muted" />}
            </button>
            {expandedBridgeCards.performance && (
              <div className="p-3.5 border-t border-theme-border bg-theme-bg/40 text-[11px] text-theme-muted leading-relaxed">
                <p className="text-theme-text font-bold">Latency Benchmark Optimization:</p>
                <p className="pt-1">Bypasses row-by-row memory caching. Leverages native database clustering and CPU instruction level vector scaling for 15,000x execution speeds.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Dynamic Knowledge Assessment Checks */}
      <section className="pt-2">
        <KnowledgeCheckPortal 
          dayId={day.id}
          focusTitle={day.focusTitle}
        />
      </section>

    </div>
  );
}
