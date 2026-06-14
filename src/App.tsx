import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar, Award, Zap, Sparkles, Clock, CheckSquare, Square, 
  BookOpen, Briefcase, UserCheck, CheckCircle2, ChevronRight, 
  HelpCircle, Lightbulb, Edit, Save, MessageSquare, Home, ListTodo, Activity, LogOut, ChevronLeft,
  X, Laptop, User, ShieldAlert, BadgeInfo, GraduationCap, ClipboardCheck
} from "lucide-react";
import { SidebarRoadmap } from "./components/SidebarRoadmap";
import { InteractiveCoachChat, ChatMessage } from "./components/InteractiveCoachChat";
import { CurriculumWeek, CurriculumDay } from "./data/curriculum";

// Redesigned structured imports
import { useProgress } from "./shared/hooks/useProgress";
import { MainViewType, SubViewType, ActiveRoute } from "./shared/types";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { CurriculumPage } from "./features/curriculum/CurriculumPage";
import { DayDetailPage } from "./features/curriculum/DayDetailPage";
import { CalendarComponent } from "./features/calendar/CalendarComponent";
import { AssessmentCenterPage } from "./features/assessments/AssessmentCenterPage";
import { TrainerPage } from "./features/trainer/TrainerPage";

export default function App() {
  const progressHook = useProgress();
  const {
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
    handleToggleTodo,
    handleSubmitCodeResult,
    handleUpdateSavedCode,
    handleUpdateName,
    pushActivity,
    handleUpdateChallengeStatus
  } = progressHook;

  // Theme State Selection
  const [theme, setTheme] = useState<"focus-light" | "focus-dark" | "deep-reading">("focus-dark");

  // Primary Router State
  const [route, setRoute] = useState<ActiveRoute>({
    mainView: "dashboard",
    selectedDayId: "W1-D1",
    subView: { type: "list" }
  });

  // Chat panel state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Mobile specific modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [editingName, setEditingName] = useState(menteeName);

  // Sync editing name when menteeName changes or on load
  useEffect(() => {
    setEditingName(menteeName);
  }, [menteeName]);

  // Load and apply persistent theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("de_mentor_theme") as "focus-light" | "focus-dark" | "deep-reading";
      if (savedTheme && ["focus-light", "focus-dark", "deep-reading"].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // Apply theme variable selectors to document
    document.documentElement.className = "";
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem("de_mentor_theme", theme);
  }, [theme]);

  // Handle select day
  const handleSelectDay = (dayId: string) => {
    setRoute({
      mainView: "curriculum",
      selectedDayId: dayId,
      subView: { type: "list" }
    });
  };

  // Skip to next day of curriculum helper
  const handleGoToNextDay = () => {
    // Find current index to increment
    const allDays = curriculum.flatMap(w => w.days);
    const currIdx = allDays.findIndex(d => d.id === route.selectedDayId);
    if (currIdx !== -1 && currIdx < allDays.length - 1) {
      const nextDay = allDays[currIdx + 1];
      setRoute({
        mainView: "curriculum",
        selectedDayId: nextDay.id,
        subView: { type: "list" }
      });
    }
  };

  // Load chat messages state from localStorage
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem("de_coach_messages_redesign_v2");
      if (storedMessages) {
        setChatMessages(JSON.parse(storedMessages));
      } else {
        const welcomeMessage: ChatMessage = {
          id: "welcome-init-redesign-v3",
          sender: "coach",
          text: `🚀 Welcome back, Athila VP VP! Welcome to your redesigned Career Transition Learning Operating System.\n\nWith your 4 years of Informatica IDMC command, your ETL database fundamentals are highly solid. Let's translate that background into production-ready modern pipelines.\n\nStudying on the phone? Rotate seamlessly to vertical views, study concepts on-click, and map out daily coding queries! What can I help you map out today, Champion?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([welcomeMessage]);
        localStorage.setItem("de_coach_messages_redesign_v2", JSON.stringify([welcomeMessage]));
      }
    } catch (e) {
      console.error(e);
    }
  }, [menteeName]);

  // Find active day object based on route state
  const activeDay = useMemo(() => {
    for (const week of curriculum) {
      const day = week.days.find(d => d.id === route.selectedDayId);
      if (day) return day;
    }
    return curriculum[0]?.days[0] || {} as any; // fallback
  }, [route.selectedDayId, curriculum]);

  // Read day progress
  const activeDayProgress = useMemo(() => {
    return dayDetails[route.selectedDayId] || {
      savedCode: activeDay.riddlePlaceholder || "",
      savedReview: "",
      savedApproved: null,
      todos: {}
    };
  }, [dayDetails, route.selectedDayId, activeDay]);

  // Chat message submission
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    localStorage.setItem("de_coach_messages_redesign_v2", JSON.stringify(newMsgs));

    setIsChatLoading(true);

    try {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs,
          currentDayContext: activeDay
        })
      });
      const data = await response.json();
      if (data.success) {
        const coachMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: "coach",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const finalMsgs = [...newMsgs, coachMsg];
        setChatMessages(finalMsgs);
        localStorage.setItem("de_coach_messages_redesign_v2", JSON.stringify(finalMsgs));
      }
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "coach",
        text: "⚡ Coach connection pipeline hit a temporary log stream gap. Rest assured, I'm analyzing your progress offline!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...newMsgs, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Do you wish to reset your interactive chat log with your transition mentor?")) {
      setChatMessages([]);
      localStorage.removeItem("de_coach_messages_redesign_v2");
    }
  };

  const saveNameSettings = () => {
    if (editingName.trim()) {
      handleUpdateName(editingName.trim());
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg text-theme-text font-sans selection:bg-teal-500 selection:text-slate-950 transition-colors duration-300">
      
      {/* 1. Global Prep Launch alert banner */}
      <div className="bg-gradient-to-r from-theme-bg via-theme-accent-secondary/10 to-theme-bg px-4 py-2 text-center text-xs relative overflow-hidden flex items-center justify-center gap-2 border-b border-theme-border/30">
        <Sparkles className="w-3.5 h-3.5 text-theme-accent-primary shrink-0 animate-bounce" />
        <span className="font-mono text-theme-text/90 text-[10.5px]">
          <strong>Transition Active:</strong> Translating Athila's 4-year Informatica IDMC expert base into a code-heavy modern DE portfolio.
        </span>
      </div>

      {/* 2. Global Professional Header Bar */}
      <header className="bg-theme-card/85 backdrop-blur-sm border-b border-theme-border px-5 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-theme-accent-secondary to-theme-accent-primary text-slate-950 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Zap className="w-4.5 h-4.5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-theme-text text-sm sm:text-base leading-tight tracking-tight uppercase flex items-center gap-1.5">
              <span>DE Accelerator</span>
              <span className="hidden sm:inline bg-theme-accent-primary/10 text-theme-accent-primary font-mono text-[9px] border border-theme-accent-primary/20 px-1.5 py-0.5 rounded font-black">
                PRO-TRACK v2.5
              </span>
            </h1>
            <p className="text-theme-muted text-[10px] sm:text-[11px] leading-none mt-0.5">
              Weekly Curriculum Hub | Transition mentor for <strong className="text-theme-text font-black">{menteeName}</strong>
            </p>
          </div>
        </div>

        {/* Global theme switcher selector buttons */}
        <div className="flex items-center gap-3.5">
          
          {/* Quick Metrics display (Desktop Only) */}
          <div className="hidden md:flex items-center gap-2.5 bg-theme-bg/60 border border-theme-border/60 px-3.5 py-1.5 rounded-xl text-[11px] font-mono select-none">
            <span className="text-theme-muted">Streak:</span>
            <span className="text-theme-accent-secondary font-black">🔥 {streakDays} days</span>
            <span className="w-px h-3 bg-theme-border" />
            <span className="text-theme-muted">Readiness:</span>
            <span className="text-theme-accent-primary font-black">{readinessScore}%</span>
          </div>

          {/* Theme custom pill triggers */}
          <div className="bg-theme-bg border border-theme-border rounded-xl p-1 flex items-center gap-1">
            <button
              id="theme-trigger-focus-dark"
              onClick={() => setTheme("focus-dark")}
              className={`px-2.5 py-1.2 rounded-lg text-xs leading-none font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                theme === "focus-dark" 
                  ? "bg-theme-card text-theme-accent-primary border border-theme-border shadow-sm font-black text-[9px]" 
                  : "text-theme-muted hover:text-theme-text text-[9px]"
              }`}
            >
              🌑 <span className="hidden xl:inline text-[9px] uppercase font-bold tracking-wider">Focus Dark</span>
            </button>
            <button
              id="theme-trigger-focus-light"
              onClick={() => setTheme("focus-light")}
              className={`px-2.5 py-1.2 rounded-lg text-xs leading-none font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                theme === "focus-light" 
                  ? "bg-theme-card text-theme-accent-primary border border-theme-border shadow-sm font-black text-[9px]" 
                  : "text-theme-muted hover:text-theme-text text-[9px]"
              }`}
            >
              ☀️ <span className="hidden xl:inline text-[9px] uppercase font-bold tracking-wider">Focus Light</span>
            </button>
            <button
              id="theme-trigger-deep-reading"
              onClick={() => setTheme("deep-reading")}
              className={`px-2.5 py-1.2 rounded-lg text-xs leading-none font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                theme === "deep-reading" 
                  ? "bg-theme-card text-theme-accent-primary border border-theme-border shadow-sm font-black text-[9px]" 
                  : "text-theme-muted hover:text-theme-text text-[9px]"
              }`}
            >
              📖 <span className="hidden xl:inline text-[9px] uppercase font-bold tracking-wider">Deep Reading</span>
            </button>
          </div>

        </div>
      </header>

      {/* Grid layout container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full mx-auto">
        
        {/* Left sidebar: Hidden on mobile, visible on desktop */}
        <aside className="hidden lg:flex w-85 bg-theme-card/30 border-r border-theme-border flex-col shrink-0 overflow-hidden">
          
          {/* Executive SaaS View Selectors */}
          <div className="p-4 border-b border-theme-border space-y-1.5 shrink-0">
            <span className="text-[9px] font-mono uppercase bg-theme-bg text-theme-muted border border-theme-border/65 px-2.5 py-1 rounded font-bold block w-fit select-none">
              Navigation Controls
            </span>

            <div className="grid grid-cols-1 gap-1 pt-1">
              <button
                onClick={() => setRoute(prev => ({ ...prev, mainView: "dashboard" }))}
                className={`px-3 py-2 rounded-xl text-left text-xs font-mono font-bold flex items-center gap-2 transition-all outline-none cursor-pointer border ${
                  route.mainView === "dashboard"
                    ? "bg-gradient-to-r from-theme-card to-theme-bg text-theme-accent-primary border-theme-border/80 shadow-sm font-black scale-[0.98]"
                    : "hover:bg-theme-card/40 text-theme-muted hover:text-theme-text border-transparent"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Executive Dashboard</span>
              </button>

              <button
                onClick={() => setRoute(prev => ({ ...prev, mainView: "curriculum", selectedDayId: route.selectedDayId || "W1-D1", subView: { type: "list" } }))}
                className={`px-3 py-2 rounded-xl text-left text-xs font-mono font-bold flex items-center justify-between transition-all border outline-none cursor-pointer ${
                  route.mainView === "curriculum"
                    ? "bg-gradient-to-r from-theme-card to-theme-bg text-theme-accent-primary border-theme-border/80 shadow-sm font-black scale-[0.98]"
                    : "hover:bg-theme-card/40 text-theme-muted hover:text-theme-text border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Syllabus Curriculum</span>
                </div>
                {route.selectedDayId && (
                  <span className="bg-theme-bg text-theme-accent-secondary px-1.5 py-0.5 rounded text-[8px] border border-theme-border/40 font-bold uppercase">
                    {route.selectedDayId}
                  </span>
                )}
              </button>

              <button
                onClick={() => setRoute(prev => ({ ...prev, mainView: "assessments" }))}
                className={`px-3 py-2 rounded-xl text-left text-xs font-mono font-bold flex items-center gap-2 transition-all outline-none cursor-pointer border ${
                  route.mainView === "assessments"
                    ? "bg-gradient-to-r from-theme-card to-theme-bg text-theme-accent-primary border-theme-border/80 shadow-sm font-black scale-[0.98]"
                    : "hover:bg-theme-card/40 text-theme-muted hover:text-theme-text border-transparent"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Assessment Center</span>
              </button>

              <button
                onClick={() => setRoute(prev => ({ ...prev, mainView: "trainer" }))}
                className={`px-3 py-2 rounded-xl text-left text-xs font-mono font-bold flex items-center gap-2 transition-all outline-none cursor-pointer border ${
                  route.mainView === "trainer"
                    ? "bg-gradient-to-r from-theme-card to-theme-bg text-theme-accent-primary border-theme-border/80 shadow-sm font-black scale-[0.98]"
                    : "hover:bg-theme-card/40 text-theme-muted hover:text-theme-text border-transparent"
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Trainer control hub</span>
              </button>
            </div>
          </div>

          {/* Core syllabus navigation list */}
          <div className="flex-1 overflow-hidden">
            <SidebarRoadmap 
              curriculum={curriculum}
              activeDayId={route.selectedDayId}
              onSelectDay={handleSelectDay}
              completedDays={completedDays}
            />
          </div>
        </aside>

        {/* Central main viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 pb-24 lg:pb-8 lg:h-[calc(100vh-80px)] bg-theme-bg text-theme-text transition-colors duration-300">
          
          {route.mainView === "dashboard" && (
            <DashboardPage 
              curriculum={curriculum}
              completedDays={completedDays}
              dayDetails={dayDetails}
              menteeName={menteeName}
              activityLog={activityLog}
              overallProgressPercent={overallProgressPercent}
              challengeProgressPercent={challengeProgressPercent}
              completedUnitsCount={completedUnitsCount}
              streakDays={streakDays}
              readinessScore={readinessScore}
              onChangeName={handleUpdateName}
              onResumeLearning={handleSelectDay}
              onNavigateToView={(view, dayId) => {
                if (dayId) {
                  setRoute({
                    mainView: "curriculum",
                    selectedDayId: dayId,
                    subView: { type: "list" }
                  });
                } else {
                  setRoute(prev => ({ ...prev, mainView: view }));
                }
              }}
              setRoute={setRoute}
            />
          )}

          {route.mainView === "curriculum" && (
            route.selectedDayId ? (
              <DayDetailPage 
                curriculum={curriculum}
                day={activeDay}
                progress={activeDayProgress}
                completedDays={completedDays}
                onToggleTodo={(todoIdx) => handleToggleTodo(activeDay, todoIdx)}
                onNavigateHome={() => setRoute({ mainView: "dashboard", selectedDayId: route.selectedDayId, subView: { type: "list" } })}
                onNavigateCurriculum={() => setRoute({ mainView: "curriculum", selectedDayId: route.selectedDayId, subView: { type: "list" } })}
                onNavigateToSubView={(subView) => setRoute(prev => ({ ...prev, subView }))}
                subView={route.subView}
                onSaveCodeDay={(code) => handleUpdateSavedCode(activeDay, code)}
                onSubmitCodeResultDay={(appr, rev) => handleSubmitCodeResult(activeDay, appr, rev)}
                onGoToNextDay={handleGoToNextDay}
                onUpdateChallengeStatus={(dayId, status) => {
                  if (progressHook.handleUpdateChallengeStatus) {
                    progressHook.handleUpdateChallengeStatus(dayId, status);
                  }
                }}
              />
            ) : (
              <CurriculumPage 
                curriculum={curriculum}
                completedDays={completedDays}
                activeDayId={route.selectedDayId}
                onSelectDay={handleSelectDay}
                dayDetails={dayDetails}
              />
            )
          )}

          {route.mainView === "calendar" && (
            <CalendarComponent 
              curriculum={curriculum}
              completedDays={completedDays}
              activeDayId={route.selectedDayId}
              onSelectDay={handleSelectDay}
            />
          )}

          {route.mainView === "assessments" && (
            <AssessmentCenterPage 
              curriculum={curriculum}
              onSelectDay={handleSelectDay}
              setRoute={setRoute}
              menteeName={menteeName}
            />
          )}

          {route.mainView === "trainer" && (
            <TrainerPage 
              curriculum={curriculum}
              completedDays={completedDays}
              dayDetails={dayDetails}
              activityLog={activityLog}
              overallProgressPercent={overallProgressPercent}
              challengeProgressPercent={challengeProgressPercent}
              readinessScore={readinessScore}
              completedUnitsCount={completedUnitsCount}
              onAddTopic={progressHook.handleAddTopic}
              onEditDay={progressHook.handleEditDay}
              onDeleteTopic={progressHook.handleDeleteTopic}
              onRescheduleDay={progressHook.handleRescheduleDay}
              onClose={() => setRoute({ mainView: "dashboard", selectedDayId: route.selectedDayId || "W1-D1", subView: { type: "list" } })}
            />
          )}
        </main>
      </div>

      {/* 3. Mobile Sticky Bottom Navigation Bar (Visible only on mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-theme-card border-t border-theme-border/90 flex justify-between items-center px-2 py-1.5 text-theme-muted lg:hidden pb-safe font-sans">
        <button
          onClick={() => setRoute({ mainView: "dashboard", selectedDayId: route.selectedDayId, subView: { type: "list" } })}
          className={`flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            route.mainView === "dashboard" ? "text-theme-accent-primary font-bold animate-pulse" : "hover:text-theme-text"
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px] font-mono uppercase font-bold">Home</span>
        </button>

        <button
          onClick={() => setRoute({ mainView: "curriculum", selectedDayId: route.selectedDayId || "W1-D1", subView: { type: "list" } })}
          className={`flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            route.mainView === "curriculum" && route.selectedDayId ? "text-theme-accent-primary font-bold" : "hover:text-theme-text"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[9px] font-mono uppercase font-bold text-center">Study</span>
        </button>

        <button
          onClick={() => {
            setRoute({ mainView: "assessments", selectedDayId: "", subView: { type: "list" } });
          }}
          className={`flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            route.mainView === "assessments" ? "text-theme-accent-secondary font-bold" : "hover:text-theme-text"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span className="text-[9px] font-mono uppercase font-bold">Quiz</span>
        </button>

        <button
          onClick={() => {
            setRoute({ mainView: "trainer", selectedDayId: "", subView: { type: "list" } });
          }}
          className={`flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            route.mainView === "trainer" ? "text-amber-500 font-bold" : "hover:text-theme-text"
          }`}
        >
          <ClipboardCheck className="w-4 h-4 text-amber-500" />
          <span className="text-[9px] font-mono uppercase font-bold">Trainer</span>
        </button>

        <button
          onClick={() => setIsProgressOpen(true)}
          className="flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors hover:text-theme-text"
        >
          <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[9px] font-mono uppercase font-bold text-emerald-500">Stats</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors hover:text-theme-text"
        >
          <UserCheck className="w-4 h-4 text-theme-accent-primary" />
          <span className="text-[9px] font-mono uppercase font-bold text-theme-accent-primary">Profile</span>
        </button>
      </nav>

      {/* 4. Settings slide-over/modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-theme-bg/80 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen">
          <div className="bg-theme-card border border-theme-border rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in p-5 space-y-5">
            <div className="flex justify-between items-center border-b border-theme-border/60 pb-3">
              <div className="flex items-center gap-2 select-none">
                <Laptop className="w-4 h-4 text-theme-accent-primary" />
                <h4 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                  Accelerator Settings
                </h4>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 px-2.5 rounded bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-theme-muted font-bold block select-none">
                  Mentee Account Profile Name:
                </label>
                <input 
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-lg p-2 text-theme-text focus:outline-none focus:border-theme-accent-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-theme-muted font-bold block select-none">
                  Quick Study Themes Switcher:
                </label>
                <div className="grid grid-cols-3 gap-2 text-center select-none">
                  <button 
                    id="modal-theme-focus-dark"
                    onClick={() => setTheme("focus-dark")}
                    className={`p-1.5 py-2.5 border rounded-xl font-mono text-[10px] capitalize cursor-pointer flex flex-col items-center justify-center gap-1 leading-tight ${
                      theme === "focus-dark" ? "bg-theme-hover text-theme-accent-primary border-theme-accent-primary/40 font-bold" : "bg-theme-bg border-theme-border text-theme-muted"
                    }`}
                  >
                    <span>🌑</span>
                    <span>Focus Dark</span>
                  </button>
                  <button 
                    id="modal-theme-focus-light"
                    onClick={() => setTheme("focus-light")}
                    className={`p-1.5 py-2.5 border rounded-xl font-mono text-[10px] capitalize cursor-pointer flex flex-col items-center justify-center gap-1 leading-tight ${
                      theme === "focus-light" ? "bg-theme-hover text-theme-accent-primary border-theme-accent-primary/40 font-bold" : "bg-theme-bg border-theme-border text-theme-muted"
                    }`}
                  >
                    <span>☀️</span>
                    <span>Focus Light</span>
                  </button>
                  <button 
                    id="modal-theme-deep-reading"
                    onClick={() => setTheme("deep-reading")}
                    className={`p-1.5 py-2.5 border rounded-xl font-mono text-[10px] capitalize cursor-pointer flex flex-col items-center justify-center gap-1 leading-tight ${
                      theme === "deep-reading" ? "bg-theme-hover text-theme-accent-secondary border-theme-accent-secondary/40 font-bold" : "bg-theme-bg border-theme-border text-theme-muted"
                    }`}
                  >
                    <span>📖</span>
                    <span>Deep Reading</span>
                  </button>
                </div>
              </div>

              <div className="bg-theme-accent-secondary/5 border border-theme-border rounded-xl p-3 text-[11px] text-theme-muted leading-relaxed space-y-1 select-none">
                <div className="flex items-center gap-1 text-theme-accent-secondary font-mono font-bold uppercase text-[9px]">
                  <BadgeInfo className="w-3.5 h-3.5" /> Program Target Notes
                </div>
                <p>
                  Transition goal is strictly established to help you secure a premier code-heavy Data Engineering offer before **August 2026**. Keep compiling!
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-theme-border/60 flex justify-end gap-2.5 select-none">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-3.5 py-1.5 bg-theme-bg text-theme-muted border border-theme-border rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={saveNameSettings}
                className="px-4 py-1.5 bg-theme-accent-primary text-slate-950 rounded-lg text-xs font-semibold cursor-pointer hover:bg-theme-accent-primary/85"
              >
                Save Profile Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Progress Stats slide-over/modal */}
      {isProgressOpen && (
        <div className="fixed inset-0 z-50 bg-theme-bg/85 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen">
          <div className="bg-theme-card border border-theme-border rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in p-5 space-y-5">
            <div className="flex justify-between items-center border-b border-theme-border/60 pb-3 select-none">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-theme-accent-primary animate-pulse" />
                <h4 className="font-display font-black text-theme-text text-sm uppercase tracking-wide">
                  Milestone Progress Diagnostics
                </h4>
              </div>
              <button 
                onClick={() => setIsProgressOpen(false)}
                className="p-1 px-2.5 rounded bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              
              {/* Score card metrics */}
              <div className="grid grid-cols-2 gap-3 select-none">
                <div className="bg-theme-bg border border-theme-border rounded-xl p-3 text-center space-y-1">
                  <div className="text-[10px] font-mono text-theme-muted uppercase">READINESS STATUS:</div>
                  <div className="text-xl font-display font-black text-theme-accent-primary">{readinessScore}%</div>
                  <div className="text-[9px] text-slate-500 font-mono">Industry Ready</div>
                </div>

                <div className="bg-theme-bg border border-theme-border rounded-xl p-3 text-center space-y-1">
                  <div className="text-[10px] font-mono text-theme-muted uppercase">ACTIVE STREAK:</div>
                  <div className="text-xl font-display font-black text-amber-500">🔥 {streakDays} days</div>
                  <div className="text-[9px] text-slate-500 font-mono font-medium">Daily Drill Commits</div>
                </div>
              </div>

              {/* Global Progress bar */}
              <div className="bg-theme-bg/60 border border-theme-border p-3.5 rounded-xl space-y-1.5 select-none">
                <div className="flex justify-between items-center text-[10px] font-mono text-theme-muted">
                  <span>TOTAL CURRICULUM DRILLS</span>
                  <span className="font-bold text-theme-text">{completedUnitsCount} / {curriculum.flatMap(w=>w.days).length} Completed</span>
                </div>
                <div className="w-full h-2 bg-theme-hover rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-theme-accent-secondary to-theme-accent-primary transition-all duration-300"
                    style={{ width: `${overallProgressPercent}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-500 font-mono text-right pt-0.5">
                  {curriculum.flatMap(w=>w.days).length - completedUnitsCount} drill units remaining
                </div>
              </div>

              {/* Feed logs */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-theme-muted font-bold block select-none">
                  Recent Activities Logs ({activityLog.length}):
                </span>
                <div className="bg-theme-bg border border-theme-border rounded-xl p-3 max-h-40 overflow-y-auto space-y-2.5 font-mono text-[10px] scrollbar-thin">
                  {activityLog.length === 0 ? (
                    <p className="text-slate-500 italic select-none">No activity entries recorded yet today.</p>
                  ) : (
                    activityLog.map((log) => (
                      <div key={log.id} className="border-b border-theme-border/40 pb-2 last:border-none last:pb-0 space-y-0.5">
                        <div className="flex justify-between text-slate-500 select-none">
                          <span className="font-bold text-theme-accent-secondary">{log.title}</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="text-theme-muted">{log.detail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-theme-border/60 flex justify-end select-none">
              <button 
                onClick={() => setIsProgressOpen(false)}
                className="px-4 py-1.5 bg-theme-accent-primary text-slate-950 rounded-lg text-xs font-semibold cursor-pointer hover:bg-theme-accent-primary/85"
              >
                Dismiss Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating dock Coach Chat widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="w-[340px] sm:w-[380px] md:w-[420px] h-[500px] bg-theme-card border border-theme-border rounded-2xl shadow-sm flex flex-col overflow-hidden mb-3.5 animate-fade-in">
            <InteractiveCoachChat 
              currentDay={activeDay}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isChatLoading={isChatLoading}
              onClearChat={handleClearChat}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
        
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-gradient-to-r from-theme-accent-secondary to-theme-accent-primary hover:opacity-90 rounded-full flex items-center justify-center text-theme-inverse shadow-sm select-none relative group transform hover:scale-105 active:scale-95 duration-200 cursor-pointer"
        >
          {isChatOpen ? (
            <span className="text-lg font-bold font-mono">✕</span>
          ) : (
            <div className="relative">
              <MessageSquare className="w-5.5 h-5.5 text-theme-inverse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-theme-success rounded-full border border-theme-card animate-ping overflow-hidden" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-theme-success rounded-full border border-theme-card overflow-hidden" />
            </div>
          )}
          <span className="absolute right-16 bg-theme-card text-theme-text text-[10px] uppercase font-mono px-2 py-1 rounded border border-theme-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block select-none">
            Consult Elite Coach
          </span>
        </button>
      </div>
    </div>
  );
}
