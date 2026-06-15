import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  ChevronRight, ArrowLeft, CheckCircle2, Square, Clock, 
  HelpCircle, Calendar, Sparkles, BookOpen, AlertTriangle, 
  Cpu, Award, Play, ExternalLink, ShieldCheck, Dumbbell, Terminal,
  ChevronDown, ChevronUp, Zap, Check, CheckCircle, Notebook, Save, Trash, FileText,
  Eye, EyeOff
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
  lessonFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  onNavigateToChallengeDay?: (dayId: string) => void;
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
  onUpdateChallengeStatus,
  lessonFocusMode = false,
  onToggleFocusMode,
  onNavigateToChallengeDay
}: DayDetailPageProps) {
  // Local Notes State
  const [noteText, setNoteText] = useState("");
  const [notesSavedStatus, setNotesSavedStatus] = useState<string | null>(null);

  // Lesson selection state when the user is inside a todo lesson
  const currentTodoIdx = subView.type === "todo" ? subView.todoIndex : 0;
  const currentTodoTitle = subView.type === "todo" ? subView.todoTitle : "";

  // Load notes on lesson index change
  useEffect(() => {
    if (subView.type === "todo") {
      const saved = localStorage.getItem(`de_coach_notes_lesson_${day.id}_${subView.todoIndex}`);
      setNoteText(saved || "");
      setNotesSavedStatus(null);
    }
  }, [day.id, subView]);

  const handleSaveNotes = () => {
    if (subView.type === "todo") {
      localStorage.setItem(`de_coach_notes_lesson_${day.id}_${subView.todoIndex}`, noteText);
      setNotesSavedStatus("Notes saved successfully");
      setTimeout(() => setNotesSavedStatus(null), 3000);
    }
  };

  const handleDeleteNotes = () => {
    if (subView.type === "todo" && window.confirm("Are you sure you want to clear your current notes for this unit?")) {
      localStorage.removeItem(`de_coach_notes_lesson_${day.id}_${subView.todoIndex}`);
      setNoteText("");
      setNotesSavedStatus("Notes cleared");
      setTimeout(() => setNotesSavedStatus(null), 3000);
    }
  };

  // State variables for general panels on list (hub) page
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [expandedBridgeCards, setExpandedBridgeCards] = useState<{ [key: string]: boolean }>({
    concept: false,
    sql: false,
    usage: false,
    performance: false
  });

  const totalTodos = day.todos.length;
  const completedTodosCount = useMemo(() => {
    return Object.values(progress.todos).filter(Boolean).length;
  }, [progress.todos]);

  const activeDayProgressPercent = Math.round((completedTodosCount / totalTodos) * 100);

  // Challenge navigation helpers
  const flattenedDays = useMemo(() => {
    const days: CurriculumDay[] = [];
    curriculum.forEach(week => {
      week.days.forEach(d => {
        days.push(d);
      });
    });
    return days;
  }, [curriculum]);

  const currentDayIdx = useMemo(() => {
    return flattenedDays.findIndex(d => d.id === day.id);
  }, [flattenedDays, day.id]);

  const prevChallengeDay = currentDayIdx > 0 ? flattenedDays[currentDayIdx - 1] : null;
  const nextChallengeDay = currentDayIdx < flattenedDays.length - 1 ? flattenedDays[currentDayIdx + 1] : null;

  const handleGoToPrevChallenge = () => {
    if (prevChallengeDay && onNavigateToChallengeDay) {
      onNavigateToChallengeDay(prevChallengeDay.id);
    }
  };

  const handleGoToNextChallenge = () => {
    if (nextChallengeDay && onNavigateToChallengeDay) {
      onNavigateToChallengeDay(nextChallengeDay.id);
    }
  };

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

  const toggleBridgeCard = (card: string) => {
    setExpandedBridgeCards(prev => ({
      ...prev,
      [card]: !prev[card]
    }));
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
      objective: `Master the complete physical, visual, and analytical performance characteristics of '${day.focusTitle}' operations within high-throughput business data engineering pipelines.`,
      conceptExplanation: `In high-volume streaming, '${day.focusTitle}' represents critical stage gate operations. While traditional mappings require local cache buffers to execute, modern cloud warehouses translate this operational pipeline logic directly into set-oriented, vectorized instructions (reducing memory caching and eliminating serialization penalties from source databases to middle ETL servers).`,
      informaticaMapping: `Visual Pipeline mapping: '${day.informaticaConcept}'\nPort Links: Incoming attributes map onto setup criteria -> conditional expression evaluated -> metadata piped forward.\n\nCode equivalent: The visual property dialog is represented natively by '${day.modernEquivalent}' queries executed in-database with minimal latency.`,
      codeEquivalent: `${day.riddleLanguage === "sql" ? 
`-- Raw SQL Translation: Set-Based Pushdown Execution
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
`# Vectorized Pandas Dataframe Equivalency
import pandas as pd

# Load structural dataset
df = pd.read_csv("employees.csv")

# Analytical early slice gate
target_mask = (df["salary"] > 120000) & (df["hire_date"] < "2026-01-01")
filtered_df = df[target_mask]

print(filtered_df.head(10))`}`,
      performanceNotes: `1. Enable strict dynamic Pushdown Optimization (PDO) to force visual schemas to compile directly as database execution streams.\n2. Position filter criteria immediately at Source Qualifiers to avoid loading scrap rows into local memory buffers.\n3. Minimize casing arrays and nested conditional segments; keep code flat to achieve hardware parallelization.`,
      interviewNotes: `Q: Explain the structural and architectural delta of performing filters on databases vs visual ETL engines?\nA: Visual engines require dragging records through memory arrays. SQL execution engines filter rows natively at storage layer using indices, eliminating database-to-ETL server serialization times completely.`,
      summary: `Transitioning visually nested mappings to flat code equivalent models unlocks clear source control branching, implements automated unit-testing pipelines, and resolves traditional high-overhead data engineering latency issues.`,
      resources: [
        { label: "Modern Pipeline Design Guides", url: "https://github.com" },
        { label: "In-Database Execution Best Practices", url: "https://stackoverflow.com" }
      ]
    };
  };

  // ==========================================
  // VIEW RENDER 1: INDIVIDUAL LESSON PAGE
  // ==========================================
  if (subView.type === "todo") {
    const todoIndex = subView.todoIndex;
    const todoTitle = subView.todoTitle;
    const content = getTodoContent(todoIndex, todoTitle);
    const meta = getTodoMeta(todoIndex, todoTitle);
    const isChecked = !!progress.todos[todoIndex];

    return (
      <div 
        className={`animate-fade-in w-full mx-auto px-4 py-6 font-sans select-text transition-all duration-300 ${
          lessonFocusMode ? "max-w-[800px]" : "max-w-[1240px]"
        }`} 
        id="dedicated-lesson-page"
      >
        {/* Floating Focus mode active top indicator banner */}
        {lessonFocusMode && (
          <div className="flex justify-between items-center bg-theme-card/85 backdrop-blur-sm border border-theme-border rounded-xl px-4 py-3 text-xs mb-6 select-none animate-fade-in shadow-md">
            <span className="font-mono text-theme-accent-primary animate-pulse flex items-center gap-2 font-bold uppercase text-[10px]">
              <Eye className="w-4 h-4 text-theme-accent-primary" /> Immersive Focus Mode Active
            </span>
            <button
              onClick={onToggleFocusMode}
              className="px-3 py-1.5 bg-theme-bg text-theme-text border border-theme-border hover:bg-theme-hover hover:text-theme-accent-primary rounded-lg text-[10px] font-bold font-mono uppercase cursor-pointer transition"
            >
              ⚡ Exit Focus Mode
            </button>
          </div>
        )}

        {/* Breadcrumb Navigation bar */}
        <nav className="flex items-center gap-1.5 text-[10px] font-mono text-theme-muted whitespace-nowrap bg-theme-card/30 px-4 py-2.5 rounded-xl border border-theme-border/60 mb-6">
          <button onClick={onNavigateHome} className="hover:text-theme-accent-primary cursor-pointer text-theme-muted">Dashboard</button>
          <ChevronRight className="w-3 h-3 text-theme-muted" />
          <button onClick={onNavigateCurriculum} className="hover:text-theme-accent-primary cursor-pointer text-theme-muted">Curriculum</button>
          <ChevronRight className="w-3 h-3 text-theme-muted" />
          <button 
            onClick={() => onNavigateToSubView({ type: "list" })} 
            className="hover:text-theme-accent-primary cursor-pointer text-theme-accent-secondary font-bold uppercase"
          >
            {day.id} View Hub
          </button>
          <ChevronRight className="w-3 h-3 text-theme-muted" />
          <span className="text-theme-text font-black uppercase text-[9px] truncate">Lesson {todoIndex + 1} of {totalTodos}</span>
        </nav>

        {/* Top return and focus mode triggers bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button 
            onClick={() => onNavigateToSubView({ type: "list" })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme-border rounded-xl text-xs font-bold uppercase tracking-wider text-theme-text hover:text-theme-accent-primary transition cursor-pointer shadow-sm font-sans"
          >
            <ArrowLeft className="w-4 h-4 text-theme-accent-primary" />
            <span>Back to Syllabus Hub</span>
          </button>

          {!lessonFocusMode && (
            <button
              onClick={onToggleFocusMode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme-border/85 text-theme-muted hover:text-theme-accent-primary hover:border-theme-accent-primary/40 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm font-sans transition-colors"
              title="Toggle Kindle-like focus mode for zero distraction"
            >
              <Eye className="w-4 h-4 text-theme-accent-secondary" />
              <span>Enter Focus Mode</span>
            </button>
          )}
        </div>

        {/* Main Double-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Main Reading Area (column-width: max-w 720px-800px) */}
          <article className={`space-y-8 w-full ${lessonFocusMode ? "xl:col-span-12 max-w-[760px] mx-auto" : "xl:col-span-8 max-w-[800px] mx-auto"}`}>
            
            {/* Header metadata segment */}
            <header className="space-y-4 pb-6 border-b border-theme-border/60">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-mono uppercase bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/20 px-2.5 py-1 rounded-md font-bold font-sans">
                  Syllabus Unit Focus: {day.id}
                </span>
                <span className="text-[10px] font-mono uppercase bg-theme-card border border-theme-border text-theme-muted px-2.5 py-1 rounded-md font-sans">
                  ⏱️ {meta.duration} Session
                </span>
                <span className="text-[10px] font-mono uppercase bg-theme-accent-secondary/10 text-theme-accent-secondary border border-theme-accent-secondary/20 px-2.5 py-1 rounded-md font-bold font-sans">
                  Complexity: {meta.difficulty}
                </span>
              </div>

              <h1 className="text-2xl md:text-3.5xl font-display font-black text-theme-text uppercase tracking-tight leading-tight mt-1">
                {todoTitle}
              </h1>

              <p className="text-sm text-theme-muted leading-relaxed font-sans max-w-2xl font-light">
                {content.objective}
              </p>
            </header>

            {/* Academic Content Block inside Reading Panel (styled clean with high line-height) */}
            <div className="reading-content space-y-6 text-theme-text font-sans">
              
              <section className="space-y-3">
                <h3 className="text-base font-bold text-theme-text font-display uppercase tracking-wide flex items-center gap-2 border-b border-theme-border/40 pb-1.5">
                  <BookOpen className="w-4.5 h-4.5 text-theme-accent-primary" />
                  1. Under-The-Hood Conceptual Mechanics
                </h3>
                <p className="text-xs leading-relaxed text-theme-muted text-justify">
                  {content.conceptExplanation}
                </p>
              </section>

              <section className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-theme-text font-display uppercase tracking-wide flex items-center gap-2 border-b border-theme-border/40 pb-1.5">
                  <Cpu className="w-4.5 h-4.5 text-theme-accent-secondary" />
                  2. Informatica-to-Code Pipeline Translation
                </h3>
                <p className="text-xs leading-relaxed text-theme-muted mb-3">
                  This task bridges the visual mapping properties with relational software equivalents:
                </p>
                <div className="p-4 bg-theme-card border border-theme-border rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-4 font-mono text-[10px] border-b border-theme-border/60 pb-3">
                    <div>
                      <span className="text-theme-muted font-bold block mb-1">INFORMATICA COMPONENT</span>
                      <span className="text-red-400 font-bold bg-red-400/10 border border-red-400/20 px-2 py-1 rounded block">{day.informaticaConcept}</span>
                    </div>
                    <div>
                      <span className="text-theme-muted font-bold block mb-1">MODERN CODE PATTERN</span>
                      <span className="text-theme-accent-primary font-bold bg-theme-accent-primary/10 border border-theme-accent-primary/20 px-2 py-1 rounded block">{day.modernEquivalent}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[11px] text-theme-muted font-mono leading-relaxed whitespace-pre-wrap">{content.informaticaMapping}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-theme-text font-display uppercase tracking-wide flex items-center gap-2 border-b border-theme-border/40 pb-1.5">
                  <Terminal className="w-4.5 h-4.5 text-amber-500" />
                  3. Production Code Implementations
                </h3>
                <div className="rounded-xl border border-code-border overflow-hidden bg-code-bg">
                  <div className="bg-theme-card px-4 py-2 border-b border-code-border flex justify-between items-center text-[9px] font-mono text-theme-muted">
                    <span className="uppercase text-theme-accent-primary font-bold">REPRESENTATIVE SYNTAX UNIT</span>
                    <span>Language: {day.riddleLanguage === "sql" ? "SQL Serverless Query" : "Python Dataframe Handler"}</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-[11px] font-mono text-code-text font-medium leading-relaxed leading-6 selection:bg-theme-accent-primary/25">
                      <code>{content.codeEquivalent}</code>
                    </pre>
                  </div>
                </div>
              </section>

              <section className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-theme-text font-display uppercase tracking-wide flex items-center gap-2 border-b border-theme-border/40 pb-1.5">
                  <Zap className="w-4.5 h-4.5 text-theme-success" />
                  4. Latency Delta & Tuning Best Practices
                </h3>
                <div className="p-4 bg-theme-card/30 border border-theme-border rounded-xl">
                  <p className="text-[11.5px] text-theme-muted leading-relaxed whitespace-pre-line">{content.performanceNotes}</p>
                </div>
              </section>

              <section className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-theme-text font-display uppercase tracking-wide flex items-center gap-2 border-b border-theme-border/40 pb-1.5">
                  <Award className="w-4.5 h-4.5 text-purple-400" />
                  5. Active Career Interview Q&A
                </h3>
                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                  <p className="text-[11.5px] italic text-theme-text leading-relaxed whitespace-pre-line font-sans font-medium">{content.interviewNotes}</p>
                </div>
              </section>

            </div>

            {/* Checkoff Segment Control */}
            <div className="p-6 bg-theme-hover border border-theme-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 shadow-sm">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-xs font-bold text-theme-text uppercase">Acknowledge Lesson Completion</h4>
                <p className="text-[11px] text-theme-muted">Toggling this checkbox validates learning and advances metrics.</p>
              </div>
              <button
                onClick={() => onToggleTodo(todoIndex)}
                className={`py-2 px-6 rounded-xl text-xs uppercase tracking-wider transition-all duration-150 border font-mono font-bold flex items-center gap-2 cursor-pointer ${
                  isChecked
                    ? "bg-theme-success/15 border-theme-success/20 text-theme-success"
                    : "bg-theme-card border-theme-border text-theme-muted hover:text-theme-text"
                }`}
              >
                {isChecked ? <CheckCircle className="w-4 h-4 text-theme-success" /> : <Square className="w-4 h-4 text-theme-muted" />}
                <span>{isChecked ? "Lesson Completed" : "Mark as Complete"}</span>
              </button>
            </div>

            {/* Footer Navigation flow indicators */}
            <footer className="pt-8 border-t border-theme-border/60 flex items-center justify-between gap-4">
              
              {/* Previous Button link */}
              {todoIndex > 0 ? (
                <button
                  onClick={() => onNavigateToSubView({ type: "todo", todoIndex: todoIndex - 1, todoTitle: day.todos[todoIndex - 1] })}
                  className="px-4.5 py-3 border border-theme-border rounded-xl bg-theme-card hover:bg-theme-hover transition font-mono text-[10px] font-bold text-theme-muted hover:text-theme-text uppercase flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Prev Lesson</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigateToSubView({ type: "list" })}
                  className="px-4.5 py-3 border border-theme-border rounded-xl bg-theme-card hover:bg-theme-hover transition font-mono text-[10px] font-bold text-theme-muted hover:text-theme-text uppercase flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Syllabus Hub</span>
                </button>
              )}

              {/* Lesson status tag */}
              <span className="text-[10px] font-mono text-theme-muted font-bold hidden sm:inline">
                LESSON {todoIndex + 1} OF {totalTodos}
              </span>

              {/* Next Button link */}
              {todoIndex < totalTodos - 1 ? (
                <button
                  onClick={() => onNavigateToSubView({ type: "todo", todoIndex: todoIndex + 1, todoTitle: day.todos[todoIndex + 1] })}
                  className="px-4.5 py-3 border border-theme-accent-primary/20 rounded-xl bg-theme-accent-primary text-theme-inverse hover:opacity-90 transition font-mono text-[10px] font-bold uppercase flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigateToSubView({ type: "challenge" })}
                  className="px-4.5 py-3 border border-theme-accent-secondary/20 rounded-xl bg-theme-accent-secondary text-theme-inverse hover:opacity-90 transition font-mono text-[10px] font-bold uppercase flex items-center gap-2 cursor-pointer"
                >
                  <span>Go to Challenge Sandbox</span>
                  <Zap className="w-4 h-4 text-theme-inverse" />
                </button>
              )}

            </footer>

          </article>

          {/* Sidebar Area: Personal study notes (Right panel on desktop, stacked on mobile) - Hidden in Focus Mode */}
          {!lessonFocusMode && (
            <aside className="xl:col-span-4 space-y-6">
              <div className="bg-theme-card border border-theme-border p-5 rounded-2xl space-y-4 sticky top-6 shadow-sm" id="lesson-notes-panel">
                <div className="flex items-center justify-between border-b border-theme-border/60 pb-2">
                  <h3 className="font-display font-black text-theme-text text-xs uppercase tracking-wide flex items-center gap-2">
                    <Notebook className="w-4 h-4 text-theme-accent-primary" />
                    My Personal notes
                  </h3>
                  <span className="text-[9px] font-mono bg-theme-bg border border-theme-border px-1.5 py-0.5 rounded text-theme-muted uppercase font-bold tracking-wider">LOCALLY SECURED</span>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  <p className="text-[10px] text-theme-muted font-normal">
                    Write analytical insights, custom snippets, or draft mapping translations. Content is cached locally under lesson context.
                  </p>

                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Record optimal Pushdown parameters, CTE templates, or memory limits examined during this module..."
                    rows={14}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-[11px] font-mono text-theme-text focus:outline-none focus:border-theme-accent-primary font-normal leading-relaxed placeholder:text-theme-muted/50 resize-y"
                  />

                  {notesSavedStatus && (
                    <div className="p-2 border border-theme-success/10 bg-theme-success/5 text-theme-success rounded-lg font-mono text-[9px] font-bold text-center animate-fade-in uppercase">
                      {notesSavedStatus}
                    </div>
                  )}

                  <div className="flex gap-2 text-xs font-mono">
                    <button
                      onClick={handleSaveNotes}
                      className="flex-1 py-1.5 px-3 bg-theme-accent-primary hover:opacity-90 border border-theme-accent-primary/15 rounded-xl font-bold uppercase text-theme-inverse transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer text-[10px]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </button>
                    <button
                      onClick={handleDeleteNotes}
                      disabled={!noteText}
                      className={`p-1.5 border rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer ${
                        noteText 
                          ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" 
                          : "bg-theme-bg border-theme-border text-theme-muted/40 cursor-not-allowed"
                      }`}
                      title="Clear current note"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}

        </div>

        {/* Focus Mode Inline Notes container: Rendered elegantly inline below content so user doesn't lose notes-taking functionality */}
        {lessonFocusMode && (
          <div className="mt-16 pt-12 border-t border-theme-border/60 max-w-[760px] mx-auto space-y-6">
            <div className="bg-theme-card border border-theme-border p-6 rounded-2xl space-y-4 shadow-sm" id="lesson-focus-notes-panel">
              <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
                <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide flex items-center gap-2">
                  <Notebook className="w-4.5 h-4.5 text-theme-accent-primary animate-pulse" />
                  Immersive Notebook
                </h3>
                <span className="text-[9px] font-mono bg-theme-bg border border-theme-border px-2.5 py-0.5 rounded text-theme-muted uppercase font-bold tracking-wider">SECURE STUDY CONTEXT</span>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-theme-muted font-normal leading-relaxed">
                  Record analytical insights, pushdown parameter configs, or custom SQL statements. Saved directly to localized study state.
                </p>

                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Draft your query insights or pushdown parameters here in distraction-free mode..."
                  rows={6}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-3.5 text-xs font-mono text-theme-text focus:outline-none focus:border-theme-accent-primary font-normal leading-relaxed placeholder:text-theme-muted/50"
                />

                {notesSavedStatus && (
                  <div className="p-2.5 border border-theme-success/10 bg-theme-success/5 text-theme-success rounded-xl font-mono text-[10px] font-bold text-center animate-fade-in uppercase">
                    {notesSavedStatus}
                  </div>
                )}

                <div className="flex gap-2.5 text-xs font-mono">
                  <button
                    onClick={handleSaveNotes}
                    className="flex-1 py-2.5 px-4 bg-theme-accent-primary hover:opacity-95 border border-theme-accent-primary/10 rounded-xl font-black uppercase text-theme-inverse transition shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save My Lesson Note</span>
                  </button>
                  <button
                    onClick={handleDeleteNotes}
                    disabled={!noteText}
                    className={`p-2.5 border rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer ${
                      noteText 
                        ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" 
                        : "bg-theme-bg border-theme-border text-theme-muted/40 cursor-not-allowed"
                    }`}
                    title="Clear current note"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // VIEW RENDER 2: CODING PLAYGROUND sandbox PAGE
  // ==========================================
  if (subView.type === "challenge") {
    const totalTodos = day.todos.length;
    return (
      <div className="animate-fade-in w-full max-w-[1440px] mx-auto px-2 md:px-4 py-4 font-sans select-text" id="dedicated-sandbox-page">
        {/* Breadcrumb Navigation bar */}
        <nav className="flex items-center gap-1 text-[10px] font-mono text-theme-muted whitespace-nowrap bg-theme-card/30 px-4 py-2 rounded-xl border border-theme-border/60 mb-4 select-none">
          <button onClick={onNavigateHome} className="hover:text-theme-accent-primary cursor-pointer text-theme-muted">Dashboard</button>
          <ChevronRight className="w-3.5 h-3.5 text-theme-muted" />
          <button onClick={onNavigateCurriculum} className="hover:text-theme-accent-primary cursor-pointer text-theme-muted">Curriculum</button>
          <ChevronRight className="w-3.5 h-3.5 text-theme-muted" />
          <button 
            onClick={() => onNavigateToSubView({ type: "list" })} 
            className="hover:text-theme-accent-primary cursor-pointer text-theme-accent-secondary font-bold uppercase animate-pulse"
          >
            {day.id} View Hub
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-theme-muted" />
          <span className="text-theme-text font-black uppercase text-[9px] truncate">Coding Sandbox</span>
        </nav>

        {/* Top returns arrows layout */}
        <div className="mb-4 flex flex-wrap gap-2 select-none">
          <button 
            onClick={() => onNavigateToSubView({ type: "list" })}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-theme-card border border-theme-border rounded-xl text-[10px] font-bold uppercase tracking-wider text-theme-text hover:text-theme-accent-primary hover:border-theme-accent-primary/20 transition cursor-pointer shadow-sm font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-theme-accent-primary" />
            <span>Syllabus Hub</span>
          </button>
          <button 
            onClick={() => onNavigateToSubView({ type: "todo", todoIndex: totalTodos - 1, todoTitle: day.todos[totalTodos - 1] })}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-theme-card border border-theme-border rounded-xl text-[10px] font-bold uppercase tracking-wider text-theme-text hover:text-theme-accent-primary hover:border-theme-accent-primary/20 transition cursor-pointer shadow-sm font-sans"
          >
            <Notebook className="w-3.5 h-3.5 text-theme-accent-secondary" />
            <span>Review Last Lesson</span>
          </button>
        </div>

        {/* Embedded Interactive sandboxed editor workspace */}
        <div className="w-full">
          <InteractiveCodeLab 
            day={day}
            savedCode={progress.savedCode}
            onSaveCode={onSaveCodeDay}
            onSubmitFinish={onSubmitCodeResultDay}
            savedReview={progress.savedReview}
            savedApproved={progress.savedApproved}
            onUpdateChallengeStatus={onUpdateChallengeStatus}
            currentStatus={progress.challengeStatus}
            onGoToNextChallenge={handleGoToNextChallenge}
            onGoToPrevChallenge={handleGoToPrevChallenge}
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW RENDER 3: COHESIVE DAY HUB PAGE (LIST)
  // ==========================================
  return (
    <div className="animate-fade-in relative max-w-[800px] mx-auto w-full pb-16 space-y-8 px-4 font-sans select-text" id="day-detail-reading-layout">
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
        className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] font-mono text-theme-muted whitespace-nowrap bg-theme-card/30 px-3.5 py-2.5 rounded-xl border border-theme-border/60 mb-4"
      >
        <button onClick={onNavigateHome} className="hover:text-theme-accent-primary transition-colors cursor-pointer text-theme-muted">
          Dashboard
        </button>
        <ChevronRight className="w-3 h-3 text-theme-muted shrink-0" />
        <button onClick={onNavigateCurriculum} className="hover:text-theme-accent-primary transition-colors cursor-pointer text-theme-muted">
          Curriculum
        </button>
        <ChevronRight className="w-3 h-3 text-theme-muted shrink-0" />
        <span className="text-theme-accent-secondary font-bold uppercase text-[9px]">Week {day.weekIndex}</span>
        <ChevronRight className="w-3 h-3 text-theme-muted shrink-0" />
        <span className="text-theme-text font-black text-[9px] uppercase truncate">{day.focusTitle} View Hub</span>
      </nav>

      {/* 1. Daily Progress Header */}
      <header className="bg-theme-card/30 p-6 sm:p-8 rounded-2xl border border-theme-border flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap gap-2 items-center font-sans text-xs">
            <span className="text-[10px] font-mono uppercase bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/20 px-2.5 py-1 rounded-md font-bold font-sans">
              Week {day.weekIndex} • Day {day.id.split("-")[1]?.replace("D", "")}
            </span>
            <span className="text-[10px] font-mono uppercase bg-theme-accent-secondary/10 text-theme-accent-secondary border border-theme-accent-secondary/20 px-2.5 py-1 rounded-md font-bold font-sans">
              🏁 Est: 45 Mins
            </span>
            {completedDays[day.id] && (
              <span className="text-[10px] bg-theme-success/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-mono font-black font-sans">
                ✓ Passed Unit
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2.5xl font-display font-black text-theme-text tracking-tight uppercase leading-none">
            {day.focusTitle}
          </h2>
          <p className="text-xs text-theme-muted max-w-xl font-normal leading-relaxed font-sans mt-1">
            Data Engineering Bridge: {day.informaticaConcept} ➔ {day.modernEquivalent}. Tap on any task to enter the dedicated lesson.
          </p>
        </div>

        {/* Minimalist Progress Meter */}
        <div className="bg-theme-card p-4 rounded-xl border border-theme-border w-full md:w-60 shrink-0">
          <div className="flex justify-between items-center text-[10px] font-mono text-theme-muted mb-2">
            <span>DAY MILESTONES:</span>
            <span className="font-bold text-theme-text">{completedTodosCount} / {totalTodos} Checked</span>
          </div>
          <div className="w-full h-1.5 bg-theme-bg rounded-full overflow-hidden">
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
            <h4 className="font-sans font-bold text-theme-text text-xs tracking-tight leading-snug">
              Curriculum Map Core Tasks
            </h4>
            <p className="text-theme-muted text-[11px] font-normal leading-relaxed">
              Explore under-the-hood parameters, relational Equivalents, and code sandboxes.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onNavigateToSubView({ type: "todo", todoIndex: 0, todoTitle: day.todos[0] })}
          className="px-5 py-2.5 bg-theme-accent-primary hover:opacity-90 text-[10px] font-bold tracking-wider transition rounded-xl cursor-pointer shrink-0 text-theme-inverse uppercase font-mono border border-theme-accent-primary/20"
        >
          Begin Unit Lesson 1
        </button>
      </section>

      {/* 3. Interactive Tasks Checklist as dedicated lesson list pointers */}
      <section className="space-y-4 font-sans text-xs">
        <h3 className="font-sans font-bold text-theme-text text-sm tracking-tight flex items-center gap-2 border-b border-theme-border/60 pb-2 uppercase text-xs">
          <CheckCircle2 className="w-4.5 h-4.5 text-theme-accent-primary" />
          Day Syllabus Core Pointers (Lessons)
        </h3>

        <div className="grid grid-cols-1 gap-3.5">
          {day.todos.map((todo, idx) => {
            const isChecked = !!progress.todos[idx];
            const meta = getTodoMeta(idx, todo);

            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all duration-150 overflow-hidden cursor-pointer ${
                  isChecked
                    ? "bg-theme-card/30 border-theme-border/40 text-theme-muted"
                    : "bg-theme-card border-theme-border hover:border-theme-border/80 hover:bg-theme-hover text-theme-text shadow-sm"
                }`}
                onClick={() => onNavigateToSubView({ type: "todo", todoIndex: idx, todoTitle: todo })}
              >
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTodo(idx);
                      }}
                      className="shrink-0 p-1 rounded hover:bg-theme-hover transition"
                      title={isChecked ? "Uncheck milestone" : "Check milestone"}
                    >
                      {isChecked ? (
                        <CheckCircle className="w-5 h-5 text-theme-success" />
                      ) : (
                        <Square className="w-5 h-5 text-theme-muted" />
                      )}
                    </button>
                    
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-theme-muted font-bold block mb-0.5">LESSON #{idx + 1}</p>
                      <span className={`font-sans text-sm font-bold truncate leading-relaxed ${isChecked ? "line-through opacity-60" : "text-theme-text"}`}>
                        {todo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-[9px] uppercase">
                    <span className="text-theme-muted hidden sm:inline">{meta.duration} Class</span>
                    <span className={`px-2.5 py-0.5 border rounded-full font-bold ${
                      meta.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                      {meta.difficulty}
                    </span>
                    <ChevronRight className="w-4.5 h-4.5 text-theme-muted hover:text-theme-accent-primary" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Interactive Challenge Launcher as pointer */}
          <div 
            className={`rounded-2xl border transition-all duration-150 overflow-hidden cursor-pointer bg-gradient-to-r from-theme-card/60 to-theme-hover border-theme-accent-secondary/30 hover:border-theme-accent-secondary/80 focus:outline-none`}
            onClick={() => onNavigateToSubView({ type: "challenge" })}
          >
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-2.5 rounded-xl bg-theme-accent-secondary/10 border border-theme-accent-secondary/20 text-theme-accent-secondary shrink-0">
                  <Award className="w-5 h-5 text-theme-accent-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-theme-accent-secondary font-black block mb-0.5">PRACTICE LAB TASK SANDBOX</p>
                  <span className="font-sans text-sm font-bold text-theme-text truncate leading-relaxed">
                     Interactive Riddle: {day.riddleTitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 font-mono text-[9px] uppercase">
                <span className="bg-theme-accent-secondary/15 text-theme-accent-secondary border border-theme-accent-secondary/30 px-2.5 py-0.5 rounded-full font-black">SOLVE</span>
                <ChevronRight className="w-4.5 h-4.5 text-theme-accent-secondary" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Collapsible core textbook theories */}
      <section className="bg-theme-card/30 border border-theme-border/60 rounded-2xl overflow-hidden shadow-sm font-sans text-xs">
        <button
          onClick={() => setIsTheoryOpen(!isTheoryOpen)}
          className="w-full p-4.5 flex items-center justify-between text-left cursor-pointer focus:outline-none hover:bg-theme-card/50 transition"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4.5 h-4.5 text-theme-accent-primary" />
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
