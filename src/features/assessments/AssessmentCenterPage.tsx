import React, { useState, useEffect, useMemo } from "react";
import { 
  Award, Clock, CheckCircle2, ChevronRight, RotateCcw, AlertTriangle, 
  TrendingUp, Compass, ArrowRight, BrainCircuit, FileSpreadsheet, 
  Database, Code2, AlertCircle, BarChart3, GraduationCap, X, ChevronLeft
} from "lucide-react";
import { CurriculumDay, CurriculumWeek } from "../../data/curriculum";
import { CustomAssessment, getCustomAssessments, saveCustomAssessments } from "../../shared/utils/curriculumDb";

interface AssessmentCenterProps {
  curriculum: CurriculumWeek[];
  onSelectDay: (dayId: string) => void;
  setRoute: (route: { mainView: string; selectedDayId: string; subView: { type: string } }) => void;
  menteeName: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  category: string;
  score: number; // e.g., 75 for 75%
  correctQuestions: number;
  totalQuestions: number;
  completionDate: string;
  timeSpentSecs: number;
  weakAreas: string[];
  strongAreas: string[];
}

export function AssessmentCenterPage({ curriculum, onSelectDay, setRoute, menteeName }: AssessmentCenterProps) {
  const [assessments, setAssessments] = useState<CustomAssessment[]>([]);
  const [activeTab, setActiveTab] = useState<"assessments" | "performance" | "recommendations">("assessments");
  
  // Player state
  const [activePlayingAssessment, setActivePlayingAssessment] = useState<CustomAssessment | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [assessmentStartTime, setAssessmentStartTime] = useState<number>(0);
  
  // Score summary modal / state after finishing
  const [recentAttemptResult, setRecentAttemptResult] = useState<AssessmentAttempt | null>(null);

  // Past Attempts persistence
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);

  // Load Assessments and Attempts from localStorage
  useEffect(() => {
    // Custom assessments
    const list = getCustomAssessments();
    setAssessments(list);

    // Attempts
    const storedAttempts = localStorage.getItem("de_coach_assessment_attempts");
    if (storedAttempts) {
      setAttempts(JSON.parse(storedAttempts));
    } else {
      // Seed initial dummy attempts for analytics richness
      const seedAttempts: AssessmentAttempt[] = [
        {
          id: "att-seed-1",
          assessmentId: "mock-sql-1",
          assessmentTitle: "SQL Diagnostic Assessment",
          category: "SQL",
          score: 50,
          correctQuestions: 2,
          totalQuestions: 4,
          completionDate: "June 14, 2026",
          timeSpentSecs: 340,
          weakAreas: ["Relational Sequence of SQL Clauses", "CASE Condition Null Handler"],
          strongAreas: ["早-Filter early with WHERE"]
        }
      ];
      setAttempts(seedAttempts);
      localStorage.setItem("de_coach_assessment_attempts", JSON.stringify(seedAttempts));
    }
  }, []);

  // Save attempts helper
  const saveAttempt = (newAttempt: AssessmentAttempt) => {
    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    localStorage.setItem("de_coach_assessment_attempts", JSON.stringify(updated));
  };

  const handleClearAttempts = () => {
    setAttempts([]);
    localStorage.removeItem("de_coach_assessment_attempts");
  };

  // Timer logic
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      // Auto submit when time runs out
      handleSubmitAssessment();
    }
  }, [timeRemaining]);

  // Start Assessment
  const handleLaunchAssessment = (assessment: CustomAssessment) => {
    setActivePlayingAssessment(assessment);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setRecentAttemptResult(null);
    setAssessmentStartTime(Date.now());
    
    if (assessment.isTimed && assessment.timeLimit) {
      setTimeRemaining(assessment.timeLimit * 60);
    } else {
      setTimeRemaining(null);
    }
  };

  // Question option clicked
  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: optionIndex
    }));
  };

  // Submit assessment evaluation
  const handleSubmitAssessment = () => {
    if (!activePlayingAssessment) return;

    let correctCount = 0;
    const weakList: string[] = [];
    const strongList: string[] = [];

    activePlayingAssessment.questions.forEach((q, idx) => {
      const userAns = selectedAnswers[idx];
      const isCorrect = userAns === q.correctIndex;
      
      if (isCorrect) {
        correctCount++;
        if (q.id.startsWith("MQ")) {
          strongList.push(idx === 0 ? "Column Aliases Scope" : idx === 1 ? "Relational Evaluation Sequence" : idx === 2 ? "HAVING early filtration" : "CASE statements");
        } else if (q.id.startsWith("PQ")) {
          strongList.push(idx === 0 ? "Exception catching try-except" : "Hashing sets performance");
        } else {
          strongList.push(activePlayingAssessment.category);
        }
      } else {
        if (q.id.startsWith("MQ")) {
          weakList.push(idx === 0 ? "Column Aliases Scope" : idx === 1 ? "Relational Evaluation Sequence" : idx === 2 ? "HAVING early filtration" : "CASE statements");
        } else if (q.id.startsWith("PQ")) {
          weakList.push(idx === 0 ? "Exception catching try-except" : "Hashing sets performance");
        } else {
          weakList.push(activePlayingAssessment.category);
        }
      }
    });

    // Deduplicate categories
    const finalWeak = Array.from(new Set(weakList)).slice(0, 3);
    const finalStrong = Array.from(new Set(strongList)).slice(0, 3);

    const scorePct = Math.round((correctCount / activePlayingAssessment.questions.length) * 100);
    const timeSpent = Math.round((Date.now() - assessmentStartTime) / 1000);

    const attempt: AssessmentAttempt = {
      id: "att-" + Math.random().toString(36).substring(2, 9),
      assessmentId: activePlayingAssessment.id,
      assessmentTitle: activePlayingAssessment.title,
      category: activePlayingAssessment.category,
      score: scorePct,
      correctQuestions: correctCount,
      totalQuestions: activePlayingAssessment.questions.length,
      completionDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timeSpentSecs: timeSpent,
      weakAreas: finalWeak.length > 0 ? finalWeak : ["None detected"],
      strongAreas: finalStrong.length > 0 ? finalStrong : ["General baseline metrics"]
    };

    saveAttempt(attempt);
    setRecentAttemptResult(attempt);
    setActivePlayingAssessment(null);
  };

  // Recommendations mapping
  const recommendationsList = useMemo(() => {
    // Evaluate weak areas and link to week index / day
    const allWeaks = attempts.flatMap(att => (att.score < 75 ? att.weakAreas : [])) as string[];
    const uniqueWeaks = Array.from(new Set(allWeaks)).filter(w => w !== "None detected");

    // Map specific strings to related day id
    const mapper: { [topic: string]: { dayId: string; title: string; desc: string } } = {
      "Column Aliases Scope": {
        dayId: "W1-D1",
        title: "Filter & Source Overrides",
        desc: "Revise SQL execution priority where WHERE operates before SELECT compilation."
      },
      "Relational Evaluation Sequence": {
        dayId: "W1-D1",
        title: "Filter & Source Overrides",
        desc: "Learn under-the-hood relational database optimizer scan paths."
      },
      "HAVING early filtration": {
        dayId: "W1-D3",
        title: "Aggregator Transformation",
        desc: "Master GROUP BY syntax optimizations, which compile earlier than projection formatting."
      },
      "CASE statements": {
        dayId: "W1-D2",
        title: "Router Transformation",
        desc: "Explore conditional CASE structures which map directly to Informatica routers."
      },
      "Exception catching try-except": {
        dayId: "W3-D5",
        title: "Try-Except Blocks",
        desc: "Reinforce fault handling pipelines inside code blocks, bridging to session reject outputs."
      },
      "Hashing sets performance": {
        dayId: "W3-D1",
        title: "Dictionaries & Sets",
        desc: "Explore O(1) hashing structures to accelerate lookup executions."
      }
    };

    const results: { dayId: string; title: string; reason: string; desc: string }[] = [];
    uniqueWeaks.forEach(weak => {
      const match = mapper[weak];
      if (match) {
        results.push({
          dayId: match.dayId,
          title: match.title,
          reason: `Weak score evaluated in Assessment: "${weak}"`,
          desc: match.desc
        });
      }
    });

    // Fallback default helpful tips if score is pristine
    if (results.length === 0) {
      results.push({
        dayId: "W1-D1",
        title: "Filter & Source Qualifier",
        desc: "Review query pushdowns (PDO) inside relational targets to save database processor memory.",
        reason: "Active routine syllabus revision recommendation."
      });
      results.push({
        dayId: "W1-D5",
        title: "Joiner Master Keys",
        desc: "Verify sorted key joins to optimize hash merge caches inside large data pipelines.",
        reason: "Suggested high-performance practice module."
      });
    }

    return results;
  }, [attempts]);

  // Analytics scoring averages
  const overallAvgScore = useMemo(() => {
    if (attempts.length === 0) return 0;
    const sum = attempts.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / attempts.length);
  }, [attempts]);

  const categoryAverages = useMemo(() => {
    const scores: { [category: string]: { sum: number; count: number } } = {};
    attempts.forEach(att => {
      if (!scores[att.category]) scores[att.category] = { sum: 0, count: 0 };
      scores[att.category].sum += att.score;
      scores[att.category].count += 1;
    });

    return Object.keys(scores).map(cat => ({
      name: cat,
      avg: Math.round(scores[cat].sum / scores[cat].count),
      count: scores[cat].count
    }));
  }, [attempts]);

  // Helper formatting minutes
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in" id="assessment-center-view">
      
      {/* 2. Page Header */}
      {!activePlayingAssessment && (
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-theme-border/60 pb-5 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] uppercase font-mono font-bold tracking-wider">
                Interactive drills
              </span>
              <span className="text-theme-muted text-[11px] font-mono font-medium">
                Mentee: {menteeName}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-theme-text flex items-center gap-2.5">
              <GraduationCap className="w-8 h-8 text-theme-accent-primary" />
              Assessment Center Portal
            </h1>
            <p className="text-xs text-theme-muted max-w-xl">
              Validate your structural comprehension, diagnostic coding trends, and mock benchmarks. Secure elite transition indicators.
            </p>
          </div>

          {/* Quick tab switchers */}
          <div className="flex bg-theme-bg border border-theme-border rounded-xl p-1 shrink-0 self-end md:self-auto font-mono text-[11px]">
            <button
              onClick={() => { setActiveTab("assessments"); setRecentAttemptResult(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "assessments" ? "bg-theme-card text-theme-accent-primary shadow-sm" : "text-theme-muted hover:text-theme-text"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Explore Drills
            </button>
            <button
              onClick={() => { setActiveTab("performance"); setRecentAttemptResult(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "performance" ? "bg-theme-card text-theme-accent-primary shadow-sm" : "text-theme-muted hover:text-theme-text"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Diagnostics Dashboard
            </button>
            <button
              onClick={() => { setActiveTab("recommendations"); setRecentAttemptResult(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "recommendations" ? "bg-theme-card text-theme-accent-primary shadow-sm" : "text-theme-muted hover:text-theme-text"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              Recommendations
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Player View (Active taking test) */}
      {activePlayingAssessment && (
        <div className="bg-theme-card border border-theme-border rounded-2xl p-5 md:p-8 space-y-6 md:space-y-8 animate-fade-in shadow-xl">
          <div className="flex justify-between items-center border-b border-theme-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-0.5 px-2 bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/20 rounded text-[9px] uppercase font-mono font-bold">
                  {activePlayingAssessment.category}
                </span>
                <span className="text-[10px] font-mono text-theme-muted">
                  Difficulty: {activePlayingAssessment.difficulty}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-display font-black text-theme-text">
                {activePlayingAssessment.title}
              </h2>
            </div>

            <div className="flex items-center gap-2.5 bg-theme-bg border border-theme-border p-2 px-3 rounded-xl font-mono text-xs">
              {timeRemaining !== null ? (
                <>
                  <Clock className="w-4 h-4 text-theme-accent-secondary animate-pulse" />
                  <span className={`${timeRemaining < 60 ? "text-red-500 font-bold" : "text-theme-text"}`}>
                    Timer: {formatTime(timeRemaining)}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-theme-muted">Untimed Drill</span>
                </>
              )}
            </div>
          </div>

          {/* Question Segment */}
          <div className="space-y-5">
            <div className="flex justify-between items-center text-[11px] font-mono text-theme-muted">
              <span>QUESTION {currentQuestionIdx + 1} OF {activePlayingAssessment.questions.length}</span>
              <span>COMPLETION: {Math.round((Object.keys(selectedAnswers).length / activePlayingAssessment.questions.length) * 100)}%</span>
            </div>

            {/* Progress dots bar */}
            <div className="flex gap-1.5 h-1.5 w-full bg-theme-bg border border-theme-border rounded-full overflow-hidden">
              {activePlayingAssessment.questions.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-full flex-1 transition-all rounded-full ${
                    idx === currentQuestionIdx 
                      ? "bg-theme-accent-primary" 
                      : selectedAnswers[idx] !== undefined 
                      ? "bg-theme-accent-secondary/65" 
                      : "bg-theme-bg"
                  }`}
                />
              ))}
            </div>

            {/* Question Text */}
            <div className="bg-theme-bg border border-theme-border rounded-xl p-5 md:p-6 shadow-inner">
              <p className="text-sm md:text-md font-sans font-medium text-theme-text leading-relaxed">
                {activePlayingAssessment.questions[currentQuestionIdx].question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {activePlayingAssessment.questions[currentQuestionIdx].options.map((option, oIdx) => {
                const letter = ["A", "B", "C", "D"][oIdx];
                const isSelected = selectedAnswers[currentQuestionIdx] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-4.5 rounded-xl border font-sans text-xs flex gap-3 transition-all duration-150 cursor-pointer ${
                      isSelected 
                        ? "bg-theme-accent-primary/10 border-theme-accent-primary text-theme-text shadow" 
                        : "bg-theme-bg border-theme-border/70 hover:border-theme-muted/60 text-theme-muted hover:text-theme-text"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold border transition-colors shrink-0 ${
                      isSelected ? "bg-theme-accent-primary text-slate-950 border-theme-accent-primary" : "bg-theme-bg border-theme-border text-theme-muted"
                    }`}>
                      {letter}
                    </span>
                    <span className="leading-relaxed leading-normal">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-theme-border pt-5">
            <button
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
              className="p-2 px-4 rounded-xl bg-theme-bg border border-theme-border font-sans text-xs text-theme-muted hover:text-theme-text hover:bg-theme-hover font-bold transition-all disabled:opacity-35 cursor-pointer disabled:pointer-events-none flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Link
            </button>

            <button
              onClick={() => {
                setActivePlayingAssessment(null);
                setTimeRemaining(null);
              }}
              className="px-4 py-2 bg-transparent text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-mono font-bold uppercase cursor-pointer"
            >
              Cancel Drill
            </button>

            {currentQuestionIdx < activePlayingAssessment.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                className="p-2 px-5 rounded-xl bg-theme-bg border border-theme-border font-sans text-xs text-theme-text hover:text-theme-accent-primary font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Next Question
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={Object.keys(selectedAnswers).length < activePlayingAssessment.questions.length}
                onClick={handleSubmitAssessment}
                className="p-2.5 px-6 rounded-xl bg-theme-accent-primary text-slate-950 font-sans text-xs hover:bg-theme-accent-primary/80 font-black transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 shadow"
              >
                Submit Assessment
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Score diagnostics block popup */}
      {recentAttemptResult && (
        <div className="bg-theme-card border border-amber-500/30 rounded-2xl p-5 md:p-6 mb-6 space-y-4 animate-fade-in shadow-2xl relative glow-amber">
          <button 
            onClick={() => setRecentAttemptResult(null)}
            className="absolute top-4 right-4 p-1 rounded-md text-theme-muted hover:text-theme-text text-xs"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-3 border-b border-theme-border/60 pb-3">
            <Award className="w-7 h-7 text-amber-500 animate-bounce" />
            <div>
              <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                Drill Assessment Completed!
              </h3>
              <p className="text-[10px] font-mono text-teal-400">
                Evaluation results synchronized client-side
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            {/* Score circle */}
            <div className="bg-theme-bg border border-theme-border/60 rounded-xl p-4 text-center">
              <div className="text-[9px] font-mono text-theme-muted uppercase">OBTAINED SCORE:</div>
              <div className={`text-3xl font-display font-black ${recentAttemptResult.score >= 75 ? "text-emerald-500" : "text-amber-500"}`}>
                {recentAttemptResult.score}%
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-1">
                {recentAttemptResult.correctQuestions} / {recentAttemptResult.totalQuestions} Correct Options
              </div>
            </div>

            {/* Analysis card */}
            <div className="md:col-span-3 space-y-2 text-xs">
              <div>
                <span className="font-mono font-bold text-[9px] uppercase tracking-wider text-theme-accent-secondary block">
                  Category: {recentAttemptResult.assessmentTitle}
                </span>
                <p className="text-theme-muted leading-relaxed font-sans mt-0.5">
                  Based on your click patterns, the analytical engine mapped your skills. Revise recommendations are populated dynamically!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> STRONG AREAS DETECTED:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recentAttemptResult.strongAreas.map((tg, i) => (
                      <span key={i} className="p-0.5 px-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded font-mono text-[9px] uppercase">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> REVISE CANDIDATE TAGS:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recentAttemptResult.weakAreas.map((tg, i) => (
                      <span key={i} className="p-0.5 px-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded font-mono text-[9px] uppercase">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-2 border-t border-theme-border/60 flex justify-end gap-3">
            <button
              onClick={() => {
                const orig = assessments.find(a => a.id === recentAttemptResult.assessmentId);
                if (orig) handleLaunchAssessment(orig);
              }}
              className="px-3.5 py-1.5 bg-theme-bg border border-theme-border rounded-lg text-theme-muted hover:text-theme-text text-[10px] font-mono font-bold uppercase transition"
            >
              Re-Attempt Drill
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className="px-4 py-1.5 bg-theme-accent-primary text-slate-950 font-black rounded-lg text-[10px] font-mono uppercase hover:bg-theme-accent-primary/80 transition"
            >
              Examine revision recommendations
            </button>
          </div>
        </div>
      )}

      {/* 5. EXPLORE DRILLS TAB */}
      {activeTab === "assessments" && !activePlayingAssessment && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {assessments.map((item) => {
              const previousAttempts = attempts.filter(a => a.assessmentId === item.id);
              const bestScore = previousAttempts.length > 0 ? Math.max(...previousAttempts.map(a => a.score)) : null;

              return (
                <div 
                  key={item.id} 
                  className="bg-theme-card border border-theme-border rounded-2xl p-5 hover:border-theme-accent-primary/50 transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="p-0.5 px-2 bg-theme-bg border border-theme-border/80 rounded font-mono text-[9px] uppercase text-theme-accent-secondary">
                        {item.category}
                      </span>
                      {bestScore !== null && (
                        <span className={`p-0.5 px-2 border rounded font-mono text-[9px] uppercase font-bold ${
                          bestScore >= 75 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          Best Score: {bestScore}%
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-xs text-theme-muted leading-relaxed font-sans">
                      Includes {item.questionCount} diagnostic multiple-choice questions to test query compilation sequences, optimizations, and syntax scopes.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-theme-border/40 flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.isTimed && item.timeLimit ? `${item.timeLimit} minutes` : "Self-paced"}
                    </span>

                    <button
                      onClick={() => handleLaunchAssessment(item)}
                      className="px-3.5 py-1.5 bg-theme-bg text-theme-accent-primary border border-theme-accent-primary/20 hover:border-theme-accent-primary hover:bg-theme-accent-primary/10 transition rounded-lg font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      Start Assessment
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Practice Code Block Indicators */}
          <div className="bg-theme-bg border border-theme-border rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-theme-accent-primary" />
              <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                Specialized SQL & Python Sandboxes
              </h3>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed font-sans">
              Looking for practical code execution challenges? Move to any learning unit inside the **Syllabus Map**. Each contains an integrated visual compiler simulator evaluating performance rules on real source patterns!
            </p>
            <div className="flex justify-start">
              <button
                onClick={() => setRoute({ mainView: "curriculum", selectedDayId: "W1-D1", subView: { type: "challenge" } })}
                className="px-4 py-2 bg-theme-accent-primary text-slate-950 font-sans text-xs rounded-xl font-bold hover:bg-theme-accent-primary/80 transition flex items-center gap-1 cursor-pointer"
              >
                Go to Week 1 Day 1 Sandbox Challenge
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PERFORMANCE DASHBOARD TAB */}
      {activeTab === "performance" && !activePlayingAssessment && (
        <div className="space-y-6 animate-fade-in font-sans">
          
          {/* Top general statistics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-theme-card border border-theme-border rounded-2xl p-4 text-center space-y-1">
              <div className="font-mono text-[9px] text-theme-muted uppercase">TOTAL COMPLETED DRILLS:</div>
              <div className="text-2xl font-display font-black text-theme-accent-primary">{attempts.length}</div>
              <div className="text-[9px] text-slate-500 font-mono">Attempt Logs Stored</div>
            </div>

            <div className="bg-theme-card border border-theme-border rounded-2xl p-4 text-center space-y-1">
              <div className="font-mono text-[9px] text-theme-muted uppercase">AVERAGE MOCK SCORE:</div>
              <div className={`text-2xl font-display font-black ${overallAvgScore >= 75 ? "text-emerald-400" : "text-amber-500"}`}>{overallAvgScore}%</div>
              <div className="text-[9px] text-slate-500 font-mono">Pass threshold is 75%</div>
            </div>

            <div className="bg-theme-card border border-theme-border rounded-2xl p-4 text-center space-y-1">
              <div className="font-mono text-[9px] text-theme-muted uppercase">DIAGNOSTIC STATUS:</div>
              <div className="text-sm font-display font-bold uppercase text-teal-400 pt-1.5">
                {attempts.length === 0 ? "Pending assessments" : overallAvgScore >= 75 ? "Ready (Accelerating)" : "Needs Revision"}
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-1">Updated in real-time</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 text-xs">
            
            {/* Visual SVG Score Trend */}
            <div className="bg-theme-card border border-theme-border rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                Mock Drill Score Growth Trend
              </h3>
              
              <div className="h-44 bg-theme-bg border border-theme-border rounded-xl p-3 flex flex-col justify-between">
                {attempts.length === 0 ? (
                  <div className="h-full flex items-center justify-center font-mono text-[10px] text-slate-500">
                    No attempts registered yet to draw performance charts.
                  </div>
                ) : (
                  <div className="h-full w-full relative flex items-end">
                    
                    {/* SVG Chart visualization */}
                    <svg className="absolute inset-0 w-full h-full" overflow="visible">
                      {/* Grid lines */}
                      <line x1="0" y1="20%" x2="100%" y2="20%" stroke="var(--color-theme-border)" strokeWidth="0.5" strokeDasharray="4" />
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--color-theme-border)" strokeWidth="0.5" strokeDasharray="4" />
                      <line x1="0" y1="80%" x2="100%" y2="80%" stroke="var(--color-theme-border)" strokeWidth="0.5" strokeDasharray="4" />
                      
                      {/* Linear Path drawing attempts */}
                      {attempts.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="var(--color-theme-accent-primary)"
                          strokeWidth="2"
                          points={attempts.slice().reverse().map((att, idx) => {
                            // Map attempts to width percentage
                            const xPct = (idx / (attempts.length - 1)) * 100;
                            // Map score index range 0-100 to y percentage (invert)
                            const yPct = 100 - att.score;
                            return `${xPct}%,${yPct}%`;
                          }).join(" ")}
                        />
                      )}
                      
                      {/* Individual dots */}
                      {attempts.slice().reverse().map((att, idx) => {
                        const xPct = attempts.length > 1 ? `${(idx / (attempts.length - 1)) * 100}%` : "50%";
                        const yPct = `${100 - att.score}%`;
                        return (
                          <circle
                            key={idx}
                            cx={xPct}
                            cy={yPct}
                            r="4.5"
                            className="fill-theme-accent-secondary stroke-theme-card stroke-2"
                          />
                        );
                      })}
                    </svg>

                    {/* Labels under charting */}
                    <div className="absolute bottom-1 w-full flex justify-between font-mono text-[9px] text-slate-500 px-1">
                      <span>Early Atts</span>
                      <span>Target Date</span>
                      <span>Latest Att</span>
                    </div>

                  </div>
                )}
              </div>

              <div className="bg-theme-bg/60 border border-theme-border/60 p-3 rounded-xl leading-relaxed text-theme-muted font-mono text-[10px]">
                🚀 Linear score lines highlight your target trajectory. Always aim for consistent scores &gt; 75%.
              </div>
            </div>

            {/* Past attempts list details */}
            <div className="bg-theme-card border border-theme-border rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                  Recent Drill Activity History
                </h3>
                {attempts.length > 0 && (
                  <button 
                    onClick={handleClearAttempts}
                    className="p-1 px-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 text-[9px] font-mono rounded select-none cursor-pointer"
                  >
                    Reset Logs
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto scrollbar-thin">
                {attempts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 italic font-mono text-[10px]">
                    No past diagnostic transcripts on record. Start an assessment to populate details!
                  </div>
                ) : (
                  attempts.map((att) => (
                    <div key={att.id} className="bg-theme-bg border border-theme-border/60 p-3 rounded-xl flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1.5">
                          {att.category}
                        </span>
                        <span className="font-sans font-bold text-theme-text">{att.assessmentTitle}</span>
                        <div className="text-[9px] text-slate-500 font-mono pt-1">
                          Completed: {att.completionDate} • Duration: {Math.floor(att.timeSpentSecs / 60)}m {att.timeSpentSecs % 60}s
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-sm font-display font-black ${att.score >= 75 ? "text-emerald-500" : "text-amber-500"}`}>
                          {att.score}%
                        </div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase font-semibold">
                          {att.score >= 75 ? "合格 Passed" : "Revision recommendation"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. RECOMMENDATION ENGINE TAB */}
      {activeTab === "recommendations" && !activePlayingAssessment && (
        <div className="space-y-5 animate-fade-in text-xs font-sans">
          
          <div className="bg-theme-card border border-theme-border p-4 md:p-5 rounded-2xl flex items-start gap-3.5">
            <div className="p-3 bg-theme-accent-primary/10 border border-theme-accent-primary/30 rounded-xl text-theme-accent-primary mt-1 shrink-0">
              <BrainCircuit className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                Analytics-Driven Syllabus revision recommendations
              </h3>
              <p className="text-xs text-theme-muted leading-relaxed">
                The career compiler evaluates incorrect answers from past assessments and flags specific conceptual gaps. Revision candidates link directly back to syllabus days!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recommendationsList.map((rec, idx) => (
              <div 
                key={idx}
                className="bg-theme-card border border-theme-border hover:border-theme-accent-secondary/50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="p-0.5 px-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-mono font-bold uppercase rounded">
                      {rec.reason}
                    </span>
                    <span className="text-theme-muted font-mono text-[10px]">
                      Revision Day Target: {rec.dayId}
                    </span>
                  </div>

                  <h4 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-theme-muted max-w-xl font-sans leading-relaxed">
                    {rec.desc || "Review the structured code examples and Informatica comparisons to master aggregation logic and query optimization."}
                  </p>
                </div>

                <button
                  onClick={() => {
                    // Navigate directly to the Day's lesson page!
                    onSelectDay(rec.dayId);
                    setRoute({
                      mainView: "curriculum",
                      selectedDayId: rec.dayId,
                      subView: { type: "list" }
                    });
                  }}
                  className="px-4 py-2 bg-theme-bg hover:bg-theme-accent-secondary/10 text-theme-accent-secondary border border-theme-accent-secondary/30 hover:border-theme-accent-secondary rounded-xl text-[10px] uppercase font-mono font-bold font-black shrink-0 transition flex items-center gap-1 cursor-pointer"
                >
                  Examine Lesson
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
