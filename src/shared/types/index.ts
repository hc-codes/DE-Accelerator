export type MainViewType = "dashboard" | "curriculum" | "calendar" | "timeline" | "trainer" | "assessments";

export interface DBTodo {
  id: string; // e.g. "W1-D1-T1"
  title: string;
  duration: string; // e.g. "15 mins"
  difficulty: "Easy" | "Medium" | "Hard";
  learningType: "Concept" | "Practice" | "Informatica-Bridge" | "Performance";
}

export type ChallengeStatusType = "Not Started" | "In Progress" | "Completed" | "Skipped";

export interface DayProgress {
  savedCode: string;
  savedReview: string;
  savedApproved: boolean | null;
  todos: { [todoIndex: number]: boolean };
  challengeStatus?: ChallengeStatusType;
}

export type SubViewType = 
  | { type: "list" } 
  | { type: "todo"; todoIndex: number; todoTitle: string } 
  | { type: "challenge" };

export interface ActiveRoute {
  mainView: MainViewType;
  selectedDayId: string;
  subView: SubViewType;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: "todo_completed" | "todo_uncompleted" | "challenge_solved" | "day_completed" | "name_changed";
  title: string;
  detail: string;
}
