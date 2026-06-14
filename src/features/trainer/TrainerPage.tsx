import React, { useState, useEffect, useMemo } from "react";
import { 
  KeyRound, Users, FolderKanban, Calendar, PlusCircle, Trash2, Edit3, 
  CheckCircle2, Activity, PlayCircle, BarChart3, GraduationCap, ArrowRight,
  Sparkles, Save, ShieldCheck, Database, CalendarRange, Clock, AlertTriangle, FileSpreadsheet
} from "lucide-react";
import { CurriculumDay, CurriculumWeek } from "../../data/curriculum";
import { AssessmentAttempt } from "../assessments/AssessmentCenterPage";
import { 
  CustomAssessment, getCustomAssessments, saveCustomAssessments, 
  getQuestionBank, saveQuestionBank 
} from "../../shared/utils/curriculumDb";

interface TrainerPageProps {
  curriculum: CurriculumWeek[];
  completedDays: { [dayId: string]: boolean };
  dayDetails: { [dayId: string]: any };
  activityLog: any[];
  overallProgressPercent: number;
  challengeProgressPercent: number;
  readinessScore: number;
  completedUnitsCount: number;
  
  // Trainer actions
  onAddTopic: (weekNum: number, day: CurriculumDay) => void;
  onEditDay: (dayId: string, updatedFields: Partial<CurriculumDay>) => void;
  onDeleteTopic: (dayId: string) => void;
  onRescheduleDay: (dayId: string, newDateString: string, targetWeekNum?: number) => void;
  
  onClose: () => void;
}

export function TrainerPage({
  curriculum,
  completedDays,
  dayDetails,
  activityLog,
  overallProgressPercent,
  challengeProgressPercent,
  readinessScore,
  completedUnitsCount,
  onAddTopic,
  onEditDay,
  onDeleteTopic,
  onRescheduleDay,
  onClose
}: TrainerPageProps) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Portal tab states
  const [activeTab, setActiveTab] = useState<"learner" | "curriculum" | "reschedule" | "questions">("learner");

  // Assessment Attempts tracker
  const [assessmentAttempts, setAssessmentAttempts] = useState<AssessmentAttempt[]>([]);

  // Assessment Custom Tests
  const [assessments, setAssessments] = useState<CustomAssessment[]>([]);

  // Editing modal state
  const [editingDay, setEditingDay] = useState<CurriculumDay | null>(null);
  
  // Add Day form states
  const [addWeekNum, setAddWeekNum] = useState<number>(1);
  const [addDayId, setAddDayId] = useState("");
  const [addFocusTitle, setAddFocusTitle] = useState("");
  const [addDateStr, setAddDateStr] = useState("June 15");
  const [addObjective, setAddObjective] = useState("");
  const [addRiddleTitle, setAddRiddleTitle] = useState("");
  const [addRiddleText, setAddRiddleText] = useState("");
  const [addRiddlePlaceholder, setAddRiddlePlaceholder] = useState("");
  const [addRiddleLanguage, setAddRiddleLanguage] = useState<"sql" | "python" | "text">("sql");
  const [addTodosInput, setAddTodosInput] = useState("Review basic code\nComplete sandbox logic\nExamine performance metrics");

  // Rescheduling state for a day
  const [reschedulingDayId, setReschedulingDayId] = useState<string | null>(null);
  const [rescheduleDateInput, setRescheduleDateInput] = useState("");
  const [rescheduleWeekInput, setRescheduleWeekInput] = useState<number>(1);

  // Question bank creator form
  const [newQuestionCategory, setNewQuestionCategory] = useState<"SQL" | "Python" | "Informatica Concepts" | "Data Engineering">("SQL");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Verify auth session
  useEffect(() => {
    const isAuth = sessionStorage.getItem("de_coach_trainer_auth_v2") === "true";
    if (isAuth) {
      setIsAuthenticated(true);
    }

    // Load past attempts
    const storedAttempts = localStorage.getItem("de_coach_assessment_attempts");
    if (storedAttempts) {
      setAssessmentAttempts(JSON.parse(storedAttempts));
    }

    // Load custom assessment tests
    setAssessments(getCustomAssessments());
  }, []);

  // Handle simple login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === "hariprasad" && password === "trainer_password") {
      setIsAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem("de_coach_trainer_auth_v2", "true");
    } else {
      setAuthError("Invalid credentials. Try hariprasad / trainer_password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("de_coach_trainer_auth_v2");
  };

  // Submit adding of a day topic
  const submitAddDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFocusTitle || !addDayId) {
      alert("Please provide a Title and Day ID (e.g. W1-D6-Custom)");
      return;
    }

    const cleanTodos = addTodosInput.split("\n").map(t => t.trim()).filter(Boolean);

    const newDayObj: CurriculumDay = {
      id: addDayId,
      date: addDateStr,
      dayOfWeek: "Mon", // default fallback or calculated
      weekIndex: addWeekNum,
      focusTitle: addFocusTitle,
      bridgeTitle: addRiddleTitle || "Code Syntax Integration",
      informaticaConcept: "Custom Module",
      modernEquivalent: addRiddleLanguage === "sql" ? "Relational Query" : "Python Script",
      conceptExploration: [addObjective || "Custom learning session established by Trainer Hariprasad."],
      riddleTitle: addRiddleTitle || "Custom Logic Drill",
      riddleText: addRiddleText || "Analyze the schema and provide your execution script.",
      riddlePlaceholder: addRiddlePlaceholder || "-- Write your custom query here\n",
      riddleLanguage: addRiddleLanguage,
      links: [],
      todos: cleanTodos.length > 0 ? cleanTodos : ["Review the concept block"]
    };

    onAddTopic(addWeekNum, newDayObj);
    
    // Reset add form
    setAddDayId("");
    setAddFocusTitle("");
    setAddObjective("");
    setAddRiddleTitle("");
    setAddRiddleText("");
    setAddRiddlePlaceholder("");
    setSuccessMsg("Topic added successfully to week " + addWeekNum);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Save edits onto a day
  const handleSaveDayEdit = () => {
    if (!editingDay) return;
    onEditDay(editingDay.id, editingDay);
    setEditingDay(null);
    setSuccessMsg("Changes saved successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Submit rescheduling helper
  const submitReschedule = (dayId: string) => {
    onRescheduleDay(dayId, rescheduleDateInput, rescheduleWeekInput);
    setReschedulingDayId(null);
    setSuccessMsg("Syllabus Day " + dayId + " Rescheduled!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Create customized Assessment MCQ question
  const submitNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText) {
      alert("Please enter the question text.");
      return;
    }

    const emptyOpts = newOptions.some(o => !o.trim());
    if (emptyOpts) {
      alert("Please fill all 4 options.");
      return;
    }

    // Load question bank, modify, save
    const bank = getQuestionBank();
    const cleanQuestionObj = {
      id: "Q-" + Math.random().toString(36).substring(2, 7),
      question: newQuestionText,
      options: [...newOptions],
      correctIndex: newCorrectIdx,
      explanation: newExplanation || "No additional explanation provided."
    };

    if (!bank[newQuestionCategory]) {
      bank[newQuestionCategory] = [];
    }
    bank[newQuestionCategory].push(cleanQuestionObj);
    saveQuestionBank(bank);

    // Also inject into the active user assessment matching that category to enlarge it!
    const activeAssessments = getCustomAssessments();
    const targetedTest = activeAssessments.find(a => a.category === newQuestionCategory);
    if (targetedTest) {
      targetedTest.questions.push(cleanQuestionObj);
      targetedTest.questionCount += 1;
      saveCustomAssessments(activeAssessments);
      setAssessments(activeAssessments);
    }

    // Reset Form
    setNewQuestionText("");
    setNewOptions(["", "", "", ""]);
    setNewExplanation("");
    setSuccessMsg("New MCQ Question added onto Question Bank & " + newQuestionCategory + " Assessment!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4" id="trainer-login-gate">
        <div className="bg-theme-card border border-theme-border/80 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-500 flex items-center justify-center text-slate-100">
              <KeyRound className="w-6 h-6 text-teal-300" />
            </div>
            <h2 className="text-xl font-display font-black text-theme-text uppercase tracking-wide">
              Trainer Control Center
            </h2>
            <p className="text-xs text-theme-muted">
              Authenticate using single trainer profile credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-theme-muted font-bold block">
                Trainer Username:
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="hariprasad"
                className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text font-sans focus:outline-none focus:border-theme-accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-theme-muted font-bold block">
                Security Password:
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text font-sans focus:outline-none focus:border-theme-accent-primary"
              />
            </div>

            {authError && (
              <p className="text-[10px] font-mono font-bold text-red-500 italic">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-theme-accent-primary text-slate-950 rounded-xl font-sans text-xs font-black shadow transition cursor-pointer hover:bg-theme-accent-primary/80 flex items-center justify-center gap-2"
            >
              Access Control Gates
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="bg-theme-bg/60 border border-theme-border p-3.5 rounded-xl text-[10px] text-theme-muted leading-relaxed font-mono">
            💡 Default Security: **hariprasad** / **trainer_password**
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans" id="trainer-portal-dashboard">
      
      {/* Success Notification Alert banner */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-theme-accent-primary border-l-4 border-slate-950 text-slate-950 text-xs font-mono font-bold p-3.5 rounded-lg shadow-2xl animate-fade-in">
          🎉 {successMsg}
        </div>
      )}

      {/* Main Headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-theme-border/60 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] uppercase font-mono font-bold tracking-wider">
              AUTHORIZED PORTAL
            </span>
            <span className="text-emerald-500 text-[10px] uppercase font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE SESSION
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-theme-text flex items-center gap-2">
            Trainer Hub: Hariprasad
          </h1>
          <p className="text-xs text-theme-muted">
            Customize Athila's syllabus path, reschedule learning timelines, design mock questions, and inspect detailed score diagnostics.
          </p>
        </div>

        <div className="flex bg-theme-bg border border-theme-border rounded-xl p-1 shrink-0 self-end md:self-auto font-mono text-[11px]">
          <button
            onClick={() => setActiveTab("learner")}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === "learner" ? "bg-theme-card text-theme-accent-primary shadow-sm" : "text-theme-muted hover:text-theme-text"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Learner Progress
          </button>
          <button
            onClick={() => setActiveTab("curriculum")}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === "curriculum" ? "bg-theme-card text-theme-accent-primary shadow-sm" : "text-theme-muted hover:text-theme-text"
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Curriculum Editor
          </button>
          <button
            onClick={() => setActiveTab("reschedule")}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === "reschedule" ? "bg-theme-card text-theme-accent-primary shadow-sm" : "text-theme-muted hover:text-theme-text"
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            Rescheduling Engine
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === "questions" ? "bg-theme-card text-theme-accent-primary shadow-sm" : "text-theme-muted hover:text-theme-text"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Assessments Editor
          </button>
          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-500/15 cursor-pointer font-bold shrink-0 text-[10px]"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 8. TAB 1: LEARNER DIAGNOSTICS */}
      {activeTab === "learner" && (
        <div className="space-y-6 animate-fade-in text-xs">
          
          {/* Progress Analytics Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-theme-card border border-theme-border rounded-2xl p-4 text-center">
              <div className="font-mono text-[9px] text-theme-muted uppercase">LEARNER TARGET:</div>
              <div className="text-sm font-display font-black text-theme-text pt-2 whitespace-nowrap overflow-hidden text-ellipsis">Athila V P</div>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">Informatica Modernization</p>
            </div>

            <div className="bg-theme-card border border-theme-border rounded-2xl p-4 text-center">
              <div className="font-mono text-[9px] text-theme-muted uppercase">CHECKLIST MILESTONES:</div>
              <div className="text-xl font-display font-black text-theme-accent-primary">{overallProgressPercent}%</div>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">{completedUnitsCount} learning days done</p>
            </div>

            <div className="bg-theme-card border border-theme-border rounded-2xl p-4 text-center">
              <div className="font-mono text-[9px] text-theme-muted uppercase">CHALLENGE GOLD CODE:</div>
              <div className="text-xl font-display font-black text-theme-accent-secondary">{challengeProgressPercent}%</div>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">Custom sandbox completed</p>
            </div>

            <div className="bg-theme-card border border-theme-border rounded-2xl p-4 text-center">
              <div className="font-mono text-[9px] text-theme-muted uppercase">ACCELERATED COHORT SCORE:</div>
              <div className="text-xl font-display font-black text-emerald-400">{readinessScore}%</div>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">Composite transition readiness</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            
            {/* Student Assessment Performance Logs view */}
            <div className="bg-theme-card border border-theme-border rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-theme-border pb-3.5">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-theme-accent-primary animate-pulse" />
                  <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                    Cohort Mock Assessment Logs
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-theme-muted bg-theme-bg px-2 py-0.5 rounded border border-theme-border">
                  {assessmentAttempts.length} Total Attempts
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                {assessmentAttempts.length === 0 ? (
                  <p className="text-slate-500 italic py-6 text-center">
                    Athila hasn't attempted any multiple-choice mock drills yet today.
                  </p>
                ) : (
                  assessmentAttempts.map((att) => (
                    <div key={att.id} className="bg-theme-bg border border-theme-border/60 p-3.5 rounded-xl flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-theme-accent-secondary/15 text-theme-accent-secondary text-[8px] font-mono p-0.5 px-1.5 rounded border border-theme-accent-secondary/20 uppercase font-bold">
                            {att.category}
                          </span>
                          <span className="font-sans font-bold text-theme-text text-xs">{att.assessmentTitle}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          Completed: {att.completionDate} • Time Spent: {Math.floor(att.timeSpentSecs / 60)}m {att.timeSpentSecs % 60}s
                        </div>
                        
                        <div className="flex gap-1.5 items-center pt-2">
                          <span className="text-[8px] font-mono font-bold text-amber-500">WEAKS:</span>
                          <p className="text-[9px] text-theme-muted overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                            {att.weakAreas.join(", ")}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-md font-display font-black ${att.score >= 75 ? "text-emerald-500" : "text-amber-500"}`}>
                          {att.score}%
                        </div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase">
                          {att.score >= 75 ? "PASSED (READY)" : "NEEDS PRACTICE"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Student Live Activity Stream Feed log */}
            <div className="bg-theme-card border border-theme-border rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-theme-border pb-3.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                    Live Mentee Activity Logs
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-teal-400 uppercase font-bold">● Listening Live</span>
              </div>

              <div className="space-y-3.5 max-h-64 overflow-y-auto scrollbar-thin">
                {activityLog.length === 0 ? (
                  <p className="text-slate-500 italic py-6 text-center">
                    No learning events captured in current compiler session.
                  </p>
                ) : (
                  activityLog.map((log) => (
                    <div key={log.id} className="border-b border-theme-border/40 pb-2.5 last:border-none last:pb-0 font-mono text-[10px]">
                      <div className="flex justify-between text-slate-500 mb-0.5">
                        <span className="font-bold text-teal-400 font-sans uppercase text-[9px] bg-teal-400/5 px-2 py-0.5 rounded border border-teal-500/20">{log.title}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-theme-muted">{log.detail}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 9. TAB 2: CURRICULUM EDITOR */}
      {activeTab === "curriculum" && (
        <div className="space-y-8 animate-fade-in text-xs font-sans">
          
          {/* Form to insert quick topic */}
          <form onSubmit={submitAddDay} className="bg-theme-card border border-theme-border rounded-2xl p-5 md:p-6 space-y-4 shadow">
            <div className="flex items-center gap-1.5 border-b border-theme-border/60 pb-3">
              <PlusCircle className="w-5 h-5 text-theme-accent-primary" />
              <h3 className="font-display font-black text-theme-text text-normal uppercase tracking-wide">
                Introduce a new Syllabus Topic unit
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">Target Curriculum Week:</label>
                <select
                  value={addWeekNum}
                  onChange={(e) => setAddWeekNum(Number(e.target.value))}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5 font-sans"
                >
                  <option value={1}>Week 1 - Core SQL Transformations</option>
                  <option value={2}>Week 2 - Informatica Advanced overrides</option>
                  <option value={3}>Week 3 - Foundational Python scripting</option>
                  <option value={4}>Week 4 - Custom code workflows</option>
                  <option value={5}>Week 5 - Data modeling paradigms</option>
                  <option value={6}>Week 6 - Final Capstone drills</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">Unique Day ID:</label>
                <input
                  type="text"
                  required
                  value={addDayId}
                  onChange={(e) => setAddDayId(e.target.value)}
                  placeholder="W1-D6-Custom"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">Calendar Date Description:</label>
                <input
                  type="text"
                  required
                  value={addDateStr}
                  onChange={(e) => setAddDateStr(e.target.value)}
                  placeholder="June 20"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">Study Topic Focus Name:</label>
                <input
                  type="text"
                  required
                  value={addFocusTitle}
                  onChange={(e) => setAddFocusTitle(e.target.value)}
                  placeholder="Advanced SQL Window Aggregates"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">Core Objective Explanation:</label>
              <textarea
                value={addObjective}
                onChange={(e) => setAddObjective(e.target.value)}
                placeholder="Examine how we would recreate Informatica aggregate ranges using SQL OVER partitions..."
                className="w-full h-16 bg-theme-bg border border-theme-border rounded-xl p-2.5"
              />
            </div>

            <div className="border border-theme-border p-4.5 rounded-xl space-y-4 bg-theme-bg/35">
              <span className="text-[9px] font-mono text-theme-accent-secondary uppercase block font-black">Optional Sandbox Coding Challenge Detail:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">Sandbox Title:</label>
                  <input
                    type="text"
                    value={addRiddleTitle}
                    onChange={(e) => setAddRiddleTitle(e.target.value)}
                    placeholder="Window aggregate range"
                    className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">Sandbox Language:</label>
                  <select
                    value={addRiddleLanguage}
                    onChange={(e) => setAddRiddleLanguage(e.target.value as any)}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5"
                  >
                    <option value="sql">SQL Query</option>
                    <option value="python">Python Pandas / Code</option>
                    <option value="text">Logical Text Answer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">riddle text description:</label>
                  <input
                    type="text"
                    value={addRiddleText}
                    onChange={(e) => setAddRiddleText(e.target.value)}
                    placeholder="Compare partitioned salaries inside active records..."
                    className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">riddle code initial placeholder:</label>
                  <textarea
                    value={addRiddlePlaceholder}
                    onChange={(e) => setAddRiddlePlaceholder(e.target.value)}
                    placeholder="-- Write query here..."
                    className="w-full h-16 bg-theme-bg border border-theme-border rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-theme-muted block font-black">Syllabus Day Tasks Checklist (Each row represents a checkbox task):</label>
                  <textarea
                    value={addTodosInput}
                    onChange={(e) => setAddTodosInput(e.target.value)}
                    placeholder="Review basic code..."
                    className="w-full h-16 bg-theme-bg border border-theme-border rounded-xl p-2.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-theme-accent-primary text-slate-950 font-black rounded-xl text-xs hover:bg-theme-accent-primary/80 transition flex items-center gap-1.5 shadow cursor-pointer"
              >
                Inject Topic Unit
                <PlusCircle className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </form>

          {/* List of active curriculum modules */}
          <div className="space-y-4">
            <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
              Active Syllabus Structure Overview
            </h3>

            <div className="space-y-6">
              {curriculum.map((week) => (
                <div key={week.weekNum} className="bg-theme-card border border-theme-border rounded-2xl p-5 space-y-3.5">
                  <div className="flex justify-between items-center border-b border-theme-border/60 pb-2.5">
                    <span className="font-display font-black text-theme-text text-sm tracking-wide">
                      WEEK {week.weekNum}: {week.title}
                    </span>
                    <span className="font-mono text-[9px] text-theme-accent-secondary uppercase font-bold">
                      {week.days.length} Connected Units
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {week.days.map((day) => (
                      <div key={day.id} className="bg-theme-bg/60 border border-theme-border/80 rounded-xl p-3.5 hover:bg-theme-bg transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-[9px] text-theme-accent-primary">
                              {day.id} ({day.date})
                            </span>
                            <span className="text-[10px] bg-theme-card text-theme-muted p-0.5 px-1.5 rounded uppercase font-mono text-[8px]">
                              {day.informaticaConcept} ➔ {day.modernEquivalent}
                            </span>
                          </div>
                          <h4 className="font-sans font-bold text-theme-text text-xs">{day.focusTitle}</h4>
                          <p className="text-[10px] text-slate-500 font-sans max-w-xl">
                            {day.conceptExploration[0]?.slice(0, 110)}...
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <button
                            onClick={() => setEditingDay(day)}
                            className="p-1 px-2.5 bg-theme-bg border border-theme-border text-xs text-theme-muted hover:text-theme-text rounded font-semibold cursor-pointer flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => onDeleteTopic(day.id)}
                            className="p-1 px-2 border border-red-500/20 text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded font-semibold cursor-pointer flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick inline day editor modal */}
          {editingDay && (
            <div className="fixed inset-0 z-50 bg-theme-bg/85 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-theme-card border border-theme-border rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center border-b border-theme-border/60 pb-3">
                  <span className="font-display font-black text-theme-text text-sm uppercase">Edit study unit: {editingDay.id}</span>
                  <button onClick={() => setEditingDay(null)} className="text-theme-muted hover:text-theme-text">✕</button>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-theme-muted font-bold">Focus Title:</label>
                    <input
                      type="text"
                      value={editingDay.focusTitle}
                      onChange={(e) => setEditingDay({ ...editingDay, focusTitle: e.target.value })}
                      className="w-full bg-theme-bg border border-theme-border p-2 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-theme-muted font-bold">Informatica Concept:</label>
                      <input
                        type="text"
                        value={editingDay.informaticaConcept}
                        onChange={(e) => setEditingDay({ ...editingDay, informaticaConcept: e.target.value })}
                        className="w-full bg-theme-bg border border-theme-border p-2 rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-theme-muted font-bold">Modern Equivalent:</label>
                      <input
                        type="text"
                        value={editingDay.modernEquivalent}
                        onChange={(e) => setEditingDay({ ...editingDay, modernEquivalent: e.target.value })}
                        className="w-full bg-theme-bg border border-theme-border p-2 rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-theme-muted font-bold">Concept Detail Paragraph:</label>
                    <textarea
                      value={editingDay.conceptExploration[0] || ""}
                      onChange={(e) => setEditingDay({ ...editingDay, conceptExploration: [e.target.value] })}
                      className="w-full h-20 bg-theme-bg border border-theme-border p-2 rounded"
                    />
                  </div>

                  <div className="space-y-1 border border-theme-border/60 p-3 rounded-xl bg-theme-bg/10">
                    <span className="text-[9px] font-mono uppercase text-theme-accent-secondary font-bold block mb-1">Sandbox Configuration:</span>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <input
                        type="text"
                        placeholder="Riddle Title"
                        value={editingDay.riddleTitle}
                        onChange={(e) => setEditingDay({ ...editingDay, riddleTitle: e.target.value })}
                        className="bg-theme-bg border border-theme-border p-2 rounded"
                      />
                      <select
                        value={editingDay.riddleLanguage}
                        onChange={(e) => setEditingDay({ ...editingDay, riddleLanguage: e.target.value as any })}
                        className="bg-theme-bg border border-theme-border p-2 rounded"
                      >
                        <option value="sql">SQL Query</option>
                        <option value="python">Python</option>
                        <option value="text">Logical Text</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Initial code placeholder template"
                      value={editingDay.riddlePlaceholder}
                      onChange={(e) => setEditingDay({ ...editingDay, riddlePlaceholder: e.target.value })}
                      className="w-full bg-theme-bg border border-theme-border p-2 rounded font-mono text-[10px] h-16"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-theme-border/60 flex justify-end gap-2.5">
                  <button
                    onClick={() => setEditingDay(null)}
                    className="px-3 py-1.5 bg-theme-bg text-theme-muted border border-theme-border rounded text-xs cursor-pointer font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDayEdit}
                    className="px-4 py-1.5 bg-theme-accent-primary text-slate-950 font-black rounded text-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 10. TAB 3: RESCHEDULING ENGINE */}
      {activeTab === "reschedule" && (
        <div className="space-y-8 animate-fade-in text-xs font-sans">
          
          <div className="bg-theme-card border border-theme-border p-4 rounded-2xl flex items-start gap-3">
            <CalendarRange className="w-5 h-5 text-theme-accent-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                Interactive Rescheduling Engine
              </h3>
              <p className="text-xs text-theme-muted leading-relaxed">
                Click on any study day to reschedule its date metadata or drag topics into different week offsets. The student's calendar updates dynamically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {curriculum.map((week) => (
              <div key={week.weekNum} className="bg-theme-card border border-theme-border rounded-xl p-4.5 space-y-3">
                <span className="font-mono font-bold text-[10px] text-teal-400 block border-b border-theme-border pb-1.5 uppercase">
                  WEEK {week.weekNum}: {week.title}
                </span>

                <div className="space-y-2">
                  {week.days.map((day) => (
                    <div 
                      key={day.id} 
                      className={`p-3 rounded-lg border transition duration-150 flex justify-between items-center ${
                        reschedulingDayId === day.id ? "bg-theme-accent-primary/10 border-theme-accent-primary" : "bg-theme-bg border-theme-border/60"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="p-0.5 px-1 bg-theme-card border border-theme-border rounded text-[9px] font-mono text-slate-500 uppercase font-semibold">
                            {day.id}
                          </span>
                          <span className="font-mono text-emerald-400 text-[10px] font-bold">
                            📅 {day.date} ({day.dayOfWeek})
                          </span>
                        </div>
                        <p className="font-sans font-bold text-theme-text">{day.focusTitle}</p>
                      </div>

                      <div className="shrink-0">
                        {reschedulingDayId === day.id ? (
                          <div className="flex gap-2.5 items-center">
                            <input
                              type="text"
                              value={rescheduleDateInput}
                              onChange={(e) => setRescheduleDateInput(e.target.value)}
                              placeholder="June 20"
                              className="bg-theme-bg border border-theme-border text-theme-text rounded p-1 w-20 text-[11px]"
                            />
                            
                            <select
                              value={rescheduleWeekInput}
                              onChange={(e) => setRescheduleWeekInput(Number(e.target.value))}
                              className="bg-theme-bg border border-theme-border text-theme-text rounded p-1 text-[11px]"
                            >
                              <option value={1}>Week 1</option>
                              <option value={2}>Week 2</option>
                              <option value={3}>Week 3</option>
                              <option value={4}>Week 4</option>
                              <option value={5}>Week 5</option>
                              <option value={6}>Week 6</option>
                            </select>

                            <button 
                              onClick={() => submitReschedule(day.id)}
                              className="bg-theme-accent-primary text-slate-950 p-1 px-2.5 rounded font-bold cursor-pointer text-[10px]"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setReschedulingDayId(null)}
                              className="text-theme-muted p-1 hover:text-theme-text cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReschedulingDayId(day.id);
                              setRescheduleDateInput(day.date);
                              setRescheduleWeekInput(day.weekIndex);
                            }}
                            className="p-1 px-3.5 bg-theme-bg border border-theme-border hover:border-theme-accent-primary rounded font-semibold text-[10px] cursor-pointer"
                          >
                            Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 11. TAB 4: DIAGNOSTIC QUESTIONS BANK */}
      {activeTab === "questions" && (
        <div className="space-y-6 animate-fade-in text-xs font-sans">
          
          <form onSubmit={submitNewQuestion} className="bg-theme-card border border-theme-border rounded-2xl p-5 md:p-6 space-y-4 shadow">
            
            <div className="flex items-center gap-1.5 border-b border-theme-border/60 pb-3">
              <PlusCircle className="w-5 h-5 text-theme-accent-primary" />
              <h3 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                Add an MCQ question into Question Bank
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-theme-muted block font-bold">Category Selection:</label>
                <select
                  value={newQuestionCategory}
                  onChange={(e) => setNewQuestionCategory(e.target.value as any)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5"
                >
                  <option value="SQL">SQL - Relational Query Drills</option>
                  <option value="Python">Python - Scripting & Automation</option>
                  <option value="Informatica Concepts">Informatica Concepts - Architecture</option>
                  <option value="Data Engineering">Data Engineering - Infrastructure & Scaling</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-theme-muted block font-bold">Correct Options Index Answer (A=0, B=1, C=2, D=3):</label>
                <select
                  value={newCorrectIdx}
                  onChange={(e) => setNewCorrectIdx(Number(e.target.value))}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono uppercase text-theme-muted block font-bold">Mcq Question Text Prompt:</label>
              <input
                type="text"
                required
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="What is the average hash collision overhead inside standard Joins?"
                className="w-full bg-theme-bg border border-theme-border rounded-xl p-3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {newOptions.map((opt, oIdx) => (
                <div key={oIdx} className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-teal-400 block font-bold">Option {["A", "B", "C", "D"][oIdx]}:</label>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const copy = [...newOptions];
                      copy[oIdx] = e.target.value;
                      setNewOptions(copy);
                    }}
                    placeholder={`Enter answer option ${["A", "B", "C", "D"][oIdx]}`}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[9px] font-mono uppercase text-theme-muted block font-bold">Structured explanation explanation (Correct diagnosis reason):</label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Hashing structures utilize index collisions over O(1)... Describe standard optimization details for the student."
                className="w-full h-20 bg-theme-bg border border-theme-border rounded-xl p-2.5"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-theme-accent-primary text-slate-950 font-black rounded-xl text-xs hover:bg-theme-accent-primary/80 transition flex items-center gap-1 shadow cursor-pointer"
              >
                Assemble MCQ Question
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}
