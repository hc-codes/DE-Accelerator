import { useState, useEffect, useMemo } from "react";
import { CurriculumDay, CurriculumWeek } from "../../data/curriculum";
import { DayProgress, ActivityLogEntry, ChallengeStatusType } from "../types";
import { getCurriculumData, saveCurriculumData } from "../utils/curriculumDb";

export function useProgress() {
  const [curriculum, setCurriculumState] = useState<CurriculumWeek[]>([]);
  const [completedDays, setCompletedDays] = useState<{ [dayId: string]: boolean }>({});
  const [dayDetails, setDayDetails] = useState<{ [dayId: string]: DayProgress }>({});
  const [menteeName, setMenteeName] = useState("Athila V P");
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  // Initialize and load from local storage
  useEffect(() => {
    try {
      // Load Dynamic Curriculum
      const dynamicCurr = getCurriculumData();
      setCurriculumState(dynamicCurr);

      const storedCompleted = localStorage.getItem("de_coach_completed_redesign");
      if (storedCompleted) setCompletedDays(JSON.parse(storedCompleted));

      const storedDetails = localStorage.getItem("de_coach_details_redesign");
      if (storedDetails) {
        setDayDetails(JSON.parse(storedDetails));
      } else {
        // Build initial empty details if needed
        setDayDetails({});
      }

      const storedName = localStorage.getItem("de_coach_mentee_name_redesign");
      if (storedName) setMenteeName(storedName);

      const storedActivity = localStorage.getItem("de_coach_activity_redesign");
      if (storedActivity) {
        setActivityLog(JSON.parse(storedActivity));
      } else {
        // Seed default log
        const initialLog: ActivityLogEntry[] = [
          {
            id: "init-feed",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: "name_changed",
            title: "Career Campaign Commenced",
            detail: "Athila V P configured transition targets to August 2026."
          }
        ];
        setActivityLog(initialLog);
        localStorage.setItem("de_coach_activity_redesign", JSON.stringify(initialLog));
      }
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }
  }, []);

  // Sync helpers
  const saveCompletedDays = (newCompleted: { [dayId: string]: boolean }) => {
    setCompletedDays(newCompleted);
    localStorage.setItem("de_coach_completed_redesign", JSON.stringify(newCompleted));
  };

  const saveDayDetails = (newDetails: { [dayId: string]: DayProgress }) => {
    setDayDetails(newDetails);
    localStorage.setItem("de_coach_details_redesign", JSON.stringify(newDetails));
  };

  const saveCurriculum = (newCurriculum: CurriculumWeek[]) => {
    setCurriculumState(newCurriculum);
    saveCurriculumData(newCurriculum);
  };

  const pushActivity = (type: ActivityLogEntry["type"], title: string, detail: string) => {
    const newEntry: ActivityLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type,
      title,
      detail
    };
    setActivityLog(prev => {
      const updated = [newEntry, ...prev].slice(0, 30); // keep recent 30
      localStorage.setItem("de_coach_activity_redesign", JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle single todo
  const handleToggleTodo = (day: CurriculumDay, todoIdx: number) => {
    const currentProgress = dayDetails[day.id] || {
      savedCode: day.riddlePlaceholder,
      savedReview: "",
      savedApproved: null,
      todos: {},
      challengeStatus: "Not Started"
    };

    const isCheckedNow = !currentProgress.todos[todoIdx];
    const updatedTodos = {
      ...currentProgress.todos,
      [todoIdx]: isCheckedNow
    };

    const updatedDetails = {
      ...dayDetails,
      [day.id]: {
        ...currentProgress,
        todos: updatedTodos
      }
    };
    saveDayDetails(updatedDetails);

    // Push activity feed log
    pushActivity(
      isCheckedNow ? "todo_completed" : "todo_uncompleted",
      isCheckedNow ? "Task Completed" : "Task Re-opened",
      `${isCheckedNow ? "Completed" : "Re-opened"} task #${todoIdx + 1} on ${day.focusTitle}`
    );

    // Automatically check off the entire Day if all todos are accomplished!
    const requiredCount = day.todos.length;
    let checkedCount = 0;
    for (let i = 0; i < requiredCount; i++) {
      if (updatedTodos[i]) checkedCount++;
    }

    if (checkedCount === requiredCount) {
      const newCompleted = { ...completedDays, [day.id]: true };
      saveCompletedDays(newCompleted);
      pushActivity("day_completed", "Day Unit Completed", `All milestones accomplished on ${day.focusTitle}!`);
    } else {
      // If it was checked but now not complete, uncheck completed day
      if (completedDays[day.id]) {
        const newCompleted = { ...completedDays, [day.id]: false };
        saveCompletedDays(newCompleted);
      }
    }
  };

  // Submit sandbox code
  const handleSubmitCodeResult = (day: CurriculumDay, approved: boolean, review: string) => {
    const currentProgress = dayDetails[day.id] || {
      savedCode: day.riddlePlaceholder,
      savedReview: "",
      savedApproved: null,
      todos: {},
      challengeStatus: "Not Started"
    };

    const updatedDetails = {
      ...dayDetails,
      [day.id]: {
        ...currentProgress,
        savedApproved: approved,
        savedReview: review,
        challengeStatus: (approved ? "Completed" : "In Progress") as ChallengeStatusType
      }
    };
    saveDayDetails(updatedDetails);

    if (approved) {
      pushActivity("challenge_solved", "Coding Challenge Gold", `Defeated the ${day.riddleTitle} custom challenge sandbox!`);
    }
  };

  // Skip or modify challenge status directly helper (Athila)
  const handleUpdateChallengeStatus = (dayId: string, status: ChallengeStatusType) => {
    const storedDay = curriculum.flatMap(w => w.days).find(d => d.id === dayId);
    const placeholder = storedDay ? storedDay.riddlePlaceholder : "";
    
    const currentProgress = dayDetails[dayId] || {
      savedCode: placeholder,
      savedReview: "",
      savedApproved: null,
      todos: {},
      challengeStatus: "Not Started"
    };

    const updatedDetails = {
      ...dayDetails,
      [dayId]: {
        ...currentProgress,
        challengeStatus: status,
        savedApproved: status === "Completed" ? true : currentProgress.savedApproved
      }
    };
    saveDayDetails(updatedDetails);

    pushActivity("challenge_solved", "Challenge Updated", `Challenge state for ${storedDay?.focusTitle || dayId} adjusted to: ${status}`);
  };

  // Save interim code
  const handleUpdateSavedCode = (day: CurriculumDay, code: string) => {
    const currentProgress = dayDetails[day.id] || {
      savedCode: day.riddlePlaceholder,
      savedReview: "",
      savedApproved: null,
      todos: {},
      challengeStatus: "Not Started"
    };

    const updatedDetails = {
      ...dayDetails,
      [day.id]: {
        ...currentProgress,
        savedCode: code,
        challengeStatus: (currentProgress.challengeStatus === "Not Started" ? "In Progress" : currentProgress.challengeStatus) as ChallengeStatusType
      }
    };
    saveDayDetails(updatedDetails);
  };

  // Edit User Name
  const handleUpdateName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed) {
      setMenteeName(trimmed);
      localStorage.setItem("de_coach_mentee_name_redesign", trimmed);
      pushActivity("name_changed", "Name Updated", `Mentee profile adjusted to ${trimmed}.`);
    }
  };

  // TRAINER OPERATIONS
  
  // Add dynamic topic
  const handleAddTopic = (weekNum: number, day: CurriculumDay) => {
    let curriculumCopy = [...curriculum];
    let weekObj = curriculumCopy.find(w => w.weekNum === weekNum);
    
    if (!weekObj) {
      // Create new week if not exists
      weekObj = {
        weekNum,
        title: `Week ${weekNum} Custom Track`,
        days: []
      };
      curriculumCopy.push(weekObj);
    }

    // Ensure day has a unique ID if not defined
    const dId = day.id || `W${weekNum}-D${weekObj.days.length + 1}`;
    const cleanDayObj: CurriculumDay = {
      ...day,
      id: dId,
      weekIndex: weekNum
    };

    weekObj.days.push(cleanDayObj);
    saveCurriculum(curriculumCopy);
    pushActivity("name_changed", "Curriculum Topic Added", `Trainer added custom study unit "${day.focusTitle}" to Week ${weekNum}.`);
  };

  // Edit curriculum day
  const handleEditDay = (dayId: string, updatedFields: Partial<CurriculumDay>) => {
    const curriculumCopy = curriculum.map(week => {
      const daysCopy = week.days.map(day => {
        if (day.id === dayId) {
          return { ...day, ...updatedFields } as CurriculumDay;
        }
        return day;
      });
      return { ...week, days: daysCopy };
    });

    saveCurriculum(curriculumCopy);
    pushActivity("name_changed", "Curriculum Day Edited", `Day ${dayId} was modified by Trainer Hariprasad.`);
  };

  // Delete dynamic topic
  const handleDeleteTopic = (dayId: string) => {
    const curriculumCopy = curriculum.map(week => {
      const daysCopy = week.days.filter(day => day.id !== dayId);
      return { ...week, days: daysCopy };
    }).filter(week => week.days.length > 0); // remove empty weeks if they collapse

    saveCurriculum(curriculumCopy);
    pushActivity("name_changed", "Curriculum Topic Removed", `Trainer deleted curriculum topic ${dayId}.`);
  };

  // Rescheduing engine
  const handleRescheduleDay = (dayId: string, newDateString: string, targetWeekNum?: number) => {
    let dayToMove: CurriculumDay | undefined;
    
    // Find active day
    for (const week of curriculum) {
      const found = week.days.find(d => d.id === dayId);
      if (found) {
        dayToMove = found;
        break;
      }
    }

    if (!dayToMove) return;

    // Define day of week abbreviation based on date if possible
    const dateParsed = new Date(`${newDateString}, 2026`);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeekStr = isNaN(dateParsed.getTime()) ? "Mon" : weekdays[dateParsed.getDay()];

    const updatedFields: Partial<CurriculumDay> = {
      date: newDateString,
      dayOfWeek: dayOfWeekStr
    };

    if (targetWeekNum && targetWeekNum !== dayToMove.weekIndex) {
      updatedFields.weekIndex = targetWeekNum;
      
      // Remove from current week and append to target week
      let curriculumCopy = [...curriculum];
      
      // Filter out of old week
      curriculumCopy = curriculumCopy.map(week => {
        return {
          ...week,
          days: week.days.filter(d => d.id !== dayId)
        };
      });

      // Find or create new week
      let targetWeek = curriculumCopy.find(w => w.weekNum === targetWeekNum);
      if (!targetWeek) {
        targetWeek = {
          weekNum: targetWeekNum,
          title: `Week ${targetWeekNum} Custom Track`,
          days: []
        };
        curriculumCopy.push(targetWeek);
      }

      const movedDay: CurriculumDay = {
        ...dayToMove,
        ...updatedFields,
        weekIndex: targetWeekNum
      };

      targetWeek.days.push(movedDay);
      // Sort days of the week sequentially if needed
      saveCurriculum(curriculumCopy);
    } else {
      // Just simple date update
      handleEditDay(dayId, updatedFields);
    }

    pushActivity("name_changed", "Topic Rescheduled", `Moved Day "${dayToMove.focusTitle}" study plan to ${newDateString}.`);
  };

  // CALCULATIONS (DATA-DRIVEN)
  const totalDaysList = useMemo(() => {
    return curriculum.flatMap(w => w.days);
  }, [curriculum]);

  const totalDaysCount = useMemo(() => {
    return totalDaysList.length || 36;
  }, [totalDaysList]);

  // Overall checklist (learning completion) progress metrics
  const learningProgressPercent = useMemo(() => {
    if (totalDaysCount === 0) return 0;
    const completedCount = totalDaysList.filter(d => completedDays[d.id] === true).length;
    return Math.round((completedCount / totalDaysCount) * 100);
  }, [completedDays, totalDaysList, totalDaysCount]);

  // Challenge completion metrics
  const challengeProgressPercent = useMemo(() => {
    if (totalDaysCount === 0) return 0;
    const completedCount = totalDaysList.filter(d => {
      const details = dayDetails[d.id];
      return details?.challengeStatus === "Completed" || details?.savedApproved === true;
    }).length;
    return Math.round((completedCount / totalDaysCount) * 100);
  }, [dayDetails, totalDaysList, totalDaysCount]);

  const completedUnitsCount = useMemo(() => {
    return totalDaysList.filter(d => completedDays[d.id] === true).length;
  }, [completedDays, totalDaysList]);

  const streakDays = useMemo(() => {
    const completedCount = completedUnitsCount;
    return Math.min(completedCount + 2, 7); // active streak simulator
  }, [completedUnitsCount]);

  const readinessScore = useMemo(() => {
    // 30% baseline + structured proportional weights: 60% for checklist + 40% for challenges
    const checklistWeight = (learningProgressPercent / 100) * 40;
    const challengeWeight = (challengeProgressPercent / 100) * 28;
    return Math.min(30 + Math.round(checklistWeight + challengeWeight), 98);
  }, [learningProgressPercent, challengeProgressPercent]);

  return {
    curriculum,
    completedDays,
    dayDetails,
    menteeName,
    activityLog,
    overallProgressPercent: learningProgressPercent, // map to learning checklist percent as primary progress bar
    learningProgressPercent,
    challengeProgressPercent,
    completedUnitsCount,
    streakDays,
    readinessScore,
    handleToggleTodo,
    handleSubmitCodeResult,
    handleUpdateSavedCode,
    handleUpdateName,
    handleUpdateChallengeStatus,
    pushActivity,
    
    // Trainer Actions
    handleAddTopic,
    handleEditDay,
    handleDeleteTopic,
    handleRescheduleDay
  };
}
