import { CURRICULUM_DATA, CurriculumWeek, CurriculumDay } from "../../data/curriculum";
import { DATA_ASSESSMENTS, AssessmentQuestion } from "../../data/assessments";

const CURRICULUM_STORAGE_KEY = "de_coach_dynamic_curriculum";
const USER_ASSESSMENTS_STORAGE_KEY = "de_coach_user_assessments";
const QUESTION_BANK_STORAGE_KEY = "de_coach_question_bank_v2";

export interface CustomAssessment {
  id: string;
  title: string;
  category: "SQL" | "Python" | "Informatica Concepts" | "Data Engineering";
  difficulty: "Easy" | "Intermediate" | "Hard";
  questionCount: number;
  questions: AssessmentQuestion[];
  isTimed: boolean;
  timeLimit?: number; // in minutes
}

// Initial Question Bank seeding
const seedQuestionBank = () => {
  const bank: { [category: string]: AssessmentQuestion[] } = {
    "SQL": [
      {
        id: "SQL-1",
        question: "Does a column alias created in SELECT work inside a WHERE clause?",
        options: [
          "Yes, standard SQL compiles and resolves aliases first.",
          "No, because the WHERE clause executes before the SELECT list compiles.",
          "Only if the database is running in a legacy ANSI strict compatibility mode.",
          "Yes, but you have to prefix the column with a colon or a hash symbol."
        ],
        correctIndex: 1,
        explanation: "No. SQL evaluates queries in the logical execution order of FROM -> WHERE -> GROUP BY -> HAVING -> SELECT."
      },
      {
        id: "SQL-2",
        question: "What is the logical evaluation sequence in modern relational database engines?",
        options: [
          "SELECT -> WHERE -> FROM",
          "FROM -> WHERE -> SELECT",
          "WHERE -> FROM -> SELECT",
          "SELECT -> FROM -> WHERE"
        ],
        correctIndex: 1,
        explanation: "Relational query engines process tables and find subsets early: FROM identifies the tables, WHERE filters rows, and SELECT projects columns."
      }
    ],
    "Python": [
      {
        id: "PY-1",
        question: "Which of the following is used to handle runtime errors in Python?",
        options: [
          "try...except",
          "catch...throw",
          "handle...raise",
          "error...rescue"
        ],
        correctIndex: 0,
        explanation: "Python uses 'try...except' blocks for exception capturing and clean fault tolerance."
      }
    ],
    "Informatica Concepts": [
      {
        id: "INF-1",
        question: "How do you filter records programmatically in Informatica without using a Filter Transformation?",
        options: [
          "Write a filter condition inside the Source Qualifier's SQL Query attribute.",
          "Define an router condition with no output ports.",
          "Check the Reject Limit property in Workflow Manager.",
          "Using connected unconnected lookups recursively."
        ],
        correctIndex: 0,
        explanation: "You can write a query filter directly in the Source Qualifier SQL overrides, filtering rows at-source before they travel through IDMC session memory."
      }
    ],
    "Data Engineering": [
      {
        id: "DE-1",
        question: "What is the primary architectural benefit of an Upsert (MERGE or ON CONFLICT UPDATE) instead of simple Delete-and-Insert?",
        options: [
          "Minimizes structural database lock-times, reduces network I/O, and is highly optimized with indexes.",
          "Avoids the need for primary keys on backend tables.",
          "Automatically recompiles stored procedures into Spark jobs.",
          "Guarantees that no concurrent readers can execute on target schemas."
        ],
        correctIndex: 0,
        explanation: "Upserts operate as atomic operations, updating matches and appending new records while minimizing transaction logs and locking footprints."
      }
    ]
  };
  return bank;
};

export function getCurriculumData(): CurriculumWeek[] {
  try {
    const raw = localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read curriculum data", e);
  }
  // Fallback to seeded data
  saveCurriculumData(CURRICULUM_DATA);
  return CURRICULUM_DATA;
}

export function saveCurriculumData(data: CurriculumWeek[]): void {
  try {
    localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save curriculum data", e);
  }
}

export function getCustomAssessments(): CustomAssessment[] {
  try {
    const raw = localStorage.getItem(USER_ASSESSMENTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read assessments", e);
  }
  const initialAssessments: CustomAssessment[] = [
    {
      id: "mock-sql-1",
      title: "SQL Diagnostic Assessment",
      category: "SQL",
      difficulty: "Intermediate",
      questionCount: 4,
      isTimed: true,
      timeLimit: 15,
      questions: [
        {
          id: "MQ1",
          question: "Does a column alias created in SELECT work inside a WHERE clause?",
          options: [
            "Yes, standard SQL compiles and resolves aliases first.",
            "No, because the WHERE clause executes before the SELECT list compiles.",
            "Only if the database is running in a legacy ANSI strict compatibility mode.",
            "Yes, but you have to prefix the column with a colon or a hash symbol."
          ],
          correctIndex: 1,
          explanation: "No. SQL evaluates queries in the logical execution order of FROM -> WHERE -> GROUP BY -> HAVING -> SELECT. Because WHERE is evaluated before SELECT, the column aliases defined in SELECT do not exist yet!"
        },
        {
          id: "MQ2",
          question: "What is the logical evaluation sequence in modern relational database engines?",
          options: [
            "SELECT -> WHERE -> FROM",
            "FROM -> WHERE -> SELECT",
            "WHERE -> FROM -> SELECT",
            "SELECT -> FROM -> WHERE"
          ],
          correctIndex: 1,
          explanation: "Relational query engines process tables and find subsets early. The FROM statement identifies data source, WHERE filters row states, and SELECT trims specific columns for output projection."
        },
        {
          id: "MQ3",
          question: "Why should we prefer to filter row states early rather than using HAVING later?",
          options: [
            "To prevent aggregating rows that are ultimately discarded, saving aggregate engine RAM.",
            "Because HAVING is syntactically invalid unless backed by connected group-by ports.",
            "To enforce database isolation write-locks before transactions complete.",
            "There is no difference; query planners compile the instructions identically."
          ],
          correctIndex: 0,
          explanation: "Filtering early via WHERE reduces the volume of rows that must be processed, grouped in memory, or sorted, lowering aggregate memory overhead significantly."
        },
        {
          id: "MQ4",
          question: "What happens if none of the CASE conditions are met and there is no ELSE clause specified?",
          options: [
            "The compilation will crash with a Syntax Exception.",
            "It defaults to the first condition's output.",
            "It returns NULL.",
            "It loops recursively until an adjacent match is found."
          ],
          correctIndex: 2,
          explanation: "If no conditions match and ELSE is omitted, SQL defaults to returning NULL. It is a best practice to always provide an explicit ELSE fallback."
        }
      ]
    },
    {
      id: "mock-py-1",
      title: "Core Python Quick Drill",
      category: "Python",
      difficulty: "Easy",
      questionCount: 2,
      isTimed: false,
      questions: [
        {
          id: "PQ1",
          question: "Which of the following correct forms of 'Try-Except' captures zero divisions in Python?",
          options: [
            "try ... except ZeroDivisionError:",
            "try ... catch DecimalError:",
            "evaluate ... except ZeroError:",
            "try ... rescue ZeroDivision:"
          ],
          correctIndex: 0,
          explanation: "Python uses ZeroDivisionError exception explicitly in Try-Except structures to protect script pipelines from unexpected numerical crashes."
        },
        {
          id: "PQ2",
          question: "Which collection type handles unique un-duplicated primary keys with fastest lookup speeds in Python?",
          options: [
            "List",
            "Set",
            "Tuple",
            "Dictionary values list"
          ],
          correctIndex: 1,
          explanation: "Sets utilize hashing under the hood, guaranteeing unique entries and reaching O(1) average-time complexity on lookups."
        }
      ]
    }
  ];
  localStorage.setItem(USER_ASSESSMENTS_STORAGE_KEY, JSON.stringify(initialAssessments));
  return initialAssessments;
}

export function saveCustomAssessments(assessments: CustomAssessment[]): void {
  try {
    localStorage.setItem(USER_ASSESSMENTS_STORAGE_KEY, JSON.stringify(assessments));
  } catch (e) {
    console.error("Failed to save assessments", e);
  }
}

export function getQuestionBank(): { [category: string]: AssessmentQuestion[] } {
  try {
    const raw = localStorage.getItem(QUESTION_BANK_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read question bank", e);
  }
  const bank = seedQuestionBank();
  localStorage.setItem(QUESTION_BANK_STORAGE_KEY, JSON.stringify(bank));
  return bank;
}

export function saveQuestionBank(bank: { [category: string]: AssessmentQuestion[] }): void {
  try {
    localStorage.setItem(QUESTION_BANK_STORAGE_KEY, JSON.stringify(bank));
  } catch (e) {
    console.error("Failed to save question bank", e);
  }
}
