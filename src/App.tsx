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
import { QuickPrepPage } from "./features/prep/QuickPrepPage";

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
  const [editingName, setEditingName] = useState(menteeName);

  // Sidebar and Focus Mode State Redesign
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("de_sidebar_collapsed");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const [lessonFocusMode, setLessonFocusMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("de_lesson_focus_mode");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("de_sidebar_collapsed", String(next));
      return next;
    });
  };

  const toggleLessonFocusMode = () => {
    setLessonFocusMode(prev => {
      const next = !prev;
      localStorage.setItem("de_lesson_focus_mode", String(next));
      return next;
    });
  };

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

  const isCurrentlyInLesson = route.mainView === "curriculum" && !!route.selectedDayId && route.subView?.type === "todo";
  const isFocusActive = lessonFocusMode && isCurrentlyInLesson;

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg text-theme-text font-sans selection:bg-teal-500 selection:text-slate-950 transition-colors duration-300">
      
      {/* 1. Global Prep Launch alert banner */}
      {!isFocusActive && (
        <div className="bg-gradient-to-r from-theme-bg via-theme-accent-secondary/10 to-theme-bg px-4 py-2 text-center text-xs relative overflow-hidden flex items-center justify-center gap-2 border-b border-theme-border/30">
          <Sparkles className="w-3.5 h-3.5 text-theme-accent-primary shrink-0 animate-bounce" />
          <span className="font-mono text-theme-text/90 text-[10.5px]">
            <strong>Transition Active:</strong> Translating Athila's 4-year Informatica IDMC expert base into a code-heavy modern DE portfolio.
          </span>
        </div>
      )}

      {/* 2. Global Professional Header Bar */}
      {!isFocusActive && (
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
      )}

      {/* Grid layout container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full mx-auto">
        
        {/* Left sidebar: Hidden on mobile, collapsible on desktop */}
        {!isFocusActive && (
          <aside 
            className={`hidden lg:flex flex-col bg-theme-card/30 border-r border-theme-border shrink-0 transition-all duration-300 overflow-hidden ${
              sidebarCollapsed ? "w-16" : "w-80"
            }`}
          >
            {/* Top Area: Sidebar Toggle Control */}
            <div className={`p-4 border-b border-theme-border flex items-center justify-between ${sidebarCollapsed ? "flex-col gap-4 px-2" : "flex-row"}`}>
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2 select-none">
                  <div className="p-1.5 bg-gradient-to-br from-theme-accent-secondary to-theme-accent-primary text-slate-950 rounded-lg flex items-center justify-center font-bold">
                    <Zap className="w-3.5 h-3.5 text-slate-950" />
                  </div>
                  <div>
                    <span className="font-display font-black text-theme-text text-[11px] tracking-wide uppercase block">DE ACCELERATOR</span>
                    <span className="text-[9px] text-theme-accent-primary font-mono select-none">PRO-TRACK</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg border border-theme-border bg-theme-bg hover:bg-theme-hover text-theme-muted hover:text-theme-text cursor-pointer transition-colors"
                title={sidebarCollapsed ? "Expand Navigation Panel" : "Collapse Navigation Panel"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-theme-accent-primary" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5 text-theme-accent-primary" />
                )}
              </button>
            </div>

            {/* Main Menu Navigation Links */}
            <div className="p-3 space-y-1.5 border-b border-theme-border select-none">
              {!sidebarCollapsed && (
                <span className="text-[9px] font-mono uppercase bg-theme-bg/60 text-theme-muted border border-theme-border px-2 py-0.5 rounded font-bold block w-fit mb-2">
                  Navigation
                </span>
              )}

              {/* Dashboard */}
              <button
                onClick={() => setRoute({ mainView: "dashboard", selectedDayId: route.selectedDayId, subView: route.subView })}
                className={`w-full py-2.5 rounded-xl font-sans text-xs font-bold flex items-center transition-all cursor-pointer border ${
                  route.mainView === "dashboard"
                    ? "bg-theme-bg text-theme-accent-primary border-theme-border shadow-sm font-black scale-[0.98]"
                    : "hover:bg-theme-card text-theme-muted hover:text-theme-text border-transparent"
                } ${sidebarCollapsed ? "justify-center px-1" : "px-3.5 gap-2.5 text-left"}`}
                title="Executive Dashboard"
              >
                <Home className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Executive Dashboard</span>}
              </button>

              {/* Curriculum */}
              <button
                onClick={() => setRoute({ mainView: "curriculum", selectedDayId: route.selectedDayId || "W1-D1", subView: route.subView })}
                className={`w-full py-2.5 rounded-xl font-sans text-xs font-bold flex items-center justify-between transition-all cursor-pointer border ${
                  route.mainView === "curriculum"
                    ? "bg-theme-bg text-theme-accent-primary border-theme-border shadow-sm font-black scale-[0.98]"
                    : "hover:bg-theme-card text-theme-muted hover:text-theme-text border-transparent"
                } ${sidebarCollapsed ? "justify-center px-1" : "px-3.5 text-left"}`}
                title="Syllabus Curriculum"
              >
                <div className={`flex items-center ${sidebarCollapsed ? "gap-0" : "gap-2.5"}`}>
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Syllabus Curriculum</span>}
                </div>
                {!sidebarCollapsed && route.selectedDayId && (
                  <span className="bg-theme-bg text-theme-accent-secondary px-1.5 py-0.5 rounded text-[8px] border border-theme-border/50 font-bold font-mono">
                    {route.selectedDayId}
                  </span>
                )}
              </button>

              {/* Calendar */}
              <button
                onClick={() => setRoute({ mainView: "calendar", selectedDayId: route.selectedDayId, subView: route.subView })}
                className={`w-full py-2.5 rounded-xl font-sans text-xs font-bold flex items-center transition-all cursor-pointer border ${
                  route.mainView === "calendar"
                    ? "bg-theme-bg text-theme-accent-primary border-theme-border shadow-sm font-black scale-[0.98]"
                    : "hover:bg-theme-card text-theme-muted hover:text-theme-text border-transparent"
                } ${sidebarCollapsed ? "justify-center px-1" : "px-3.5 gap-2.5 text-left"}`}
                title="Sprint Calendar"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Sprint Calendar</span>}
              </button>

              {/* Assessments */}
              <button
                onClick={() => setRoute({ mainView: "assessments", selectedDayId: route.selectedDayId, subView: route.subView })}
                className={`w-full py-2.5 rounded-xl font-sans text-xs font-bold flex items-center transition-all cursor-pointer border ${
                  route.mainView === "assessments"
                    ? "bg-theme-bg text-theme-accent-primary border-theme-border shadow-sm font-black scale-[0.98]"
                    : "hover:bg-theme-card text-theme-muted hover:text-theme-text border-transparent"
                } ${sidebarCollapsed ? "justify-center px-1" : "px-3.5 gap-2.5 text-left"}`}
                title="Assessment Center"
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Assessment Center</span>}
              </button>

              {/* Trainer Portal */}
              <button
                onClick={() => setRoute({ mainView: "trainer", selectedDayId: route.selectedDayId, subView: route.subView })}
                className={`w-full py-2.5 rounded-xl font-sans text-xs font-bold flex items-center transition-all cursor-pointer border ${
                  route.mainView === "trainer"
                    ? "bg-theme-bg text-theme-accent-primary border-theme-border shadow-sm font-black scale-[0.98]"
                    : "hover:bg-theme-card text-theme-muted hover:text-theme-text border-transparent"
                } ${sidebarCollapsed ? "justify-center px-1" : "px-3.5 gap-2.5 text-left"}`}
                title="Trainer Control Hub"
              >
                <ClipboardCheck className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Trainer Control Hub</span>}
              </button>

              {/* Quick Interview Prep */}
              <button
                onClick={() => setRoute({ mainView: "prep", selectedDayId: route.selectedDayId, subView: route.subView })}
                className={`w-full py-2.5 rounded-xl font-sans text-xs font-bold flex items-center transition-all cursor-pointer border hover:bg-theme-card text-theme-muted hover:text-theme-text border-transparent ${
                  sidebarCollapsed ? "justify-center px-1" : "px-3.5 gap-2.5 text-left"
                }`}
                title="Quick Interview Prep"
              >
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span>Quick Interview Prep</span>}
              </button>

              {/* Settings (Modal opener) */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`w-full py-2.5 rounded-xl font-sans text-xs font-bold flex items-center transition-all cursor-pointer border hover:bg-theme-card text-theme-muted hover:text-theme-text border-transparent ${
                  sidebarCollapsed ? "justify-center px-1" : "px-3.5 gap-2.5 text-left"
                }`}
                title="Profile Settings"
              >
                <User className="w-4 h-4 text-theme-accent-secondary shrink-0" />
                {!sidebarCollapsed && <span>Profile Settings</span>}
              </button>
            </div>

            {/* Active syllabus roadmap items: Hidden when nav is collapsed to focus views */}
            {!sidebarCollapsed && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <SidebarRoadmap 
                  curriculum={curriculum}
                  activeDayId={route.selectedDayId}
                  onSelectDay={handleSelectDay}
                  completedDays={completedDays}
                />
              </div>
            )}
          </aside>
        )}

        {/* Central main viewport */}
        <main className={`flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 pb-24 lg:pb-8 bg-theme-bg text-theme-text transition-all duration-300 ${
          isFocusActive 
            ? "lg:h-screen lg:max-w-[960px] mx-auto py-12 px-6" 
            : "lg:h-[calc(100vh-80px)]"
        }`}>
          
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
                onNavigateCurriculum={() => setRoute({ mainView: "curriculum", selectedDayId: "", subView: { type: "list" } })}
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
                lessonFocusMode={lessonFocusMode}
                onToggleFocusMode={toggleLessonFocusMode}
                onNavigateToChallengeDay={(dayId) => setRoute({
                  mainView: "curriculum",
                  selectedDayId: dayId,
                  subView: { type: "challenge" }
                })}
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

          {route.mainView === "prep" && (
            <QuickPrepPage />
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
      {!isFocusActive && (
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
            onClick={() => setRoute({ mainView: "curriculum", selectedDayId: "", subView: { type: "list" } })}
            className={`flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
              route.mainView === "curriculum" && !route.selectedDayId ? "text-theme-accent-primary font-bold" : "hover:text-theme-text"
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
            onClick={() => setRoute({ mainView: "prep", selectedDayId: "", subView: { type: "list" } })}
            className={`flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
              route.mainView === "prep" ? "text-emerald-400 font-bold" : "hover:text-theme-text"
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[9px] font-mono uppercase font-bold">Prep</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center gap-1 flex-1 py-1 cursor-pointer transition-colors hover:text-theme-text"
          >
            <UserCheck className="w-4 h-4 text-theme-accent-primary" />
            <span className="text-[9px] font-mono uppercase font-bold text-theme-accent-primary">Profile</span>
          </button>
        </nav>
      )}

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
