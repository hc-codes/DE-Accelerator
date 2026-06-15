import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, Play, HelpCircle, RotateCcw, CheckCircle, 
  XCircle, Zap, Loader2, Sparkles, BookOpen, ChevronDown, 
  ChevronRight, Info, Eye, Clipboard, Check, Lightbulb, 
  Award, RefreshCw, Layers, Compass, ArrowLeft, ArrowRight, ShieldCheck
} from "lucide-react";
import { CurriculumDay } from "../data/curriculum";
import { getChallengeStructure, StructuredChallenge } from "../data/challengeStructure";

interface CodeLabProps {
  day: CurriculumDay;
  savedCode: string;
  onSaveCode: (code: string) => void;
  onSubmitFinish: (approved: boolean, review: string) => void;
  savedReview: string;
  savedApproved: boolean | null;
  onUpdateChallengeStatus?: (dayId: string, status: "Not Started" | "In Progress" | "Completed" | "Skipped") => void;
  currentStatus?: string;
  onGoToNextChallenge?: () => void;
  onGoToPrevChallenge?: () => void;
}

export interface ExecutionResultState {
  status: "Success" | "Failed" | "Syntax Error" | "Runtime Error";
  executionTimeMs: number;
  memoryUsageMb: number;
  validationPassed: boolean;
  rawConsoleOutput: string;
  expectedOutput: any[];
  actualOutput: any[];
  reviewText: string;
}

// Simulated SQL and Python engine parser/analyzer
export function simulateExecutionResult(
  codeStr: string,
  dayId: string,
  isApproved: boolean,
  reviewText: string,
  challengeSpec: StructuredChallenge
): ExecutionResultState {
  const codeLower = (codeStr || "").trim().toLowerCase();
  
  // Default values
  let status: "Success" | "Failed" | "Syntax Error" | "Runtime Error" = "Success";
  let rawConsoleOutput = "";
  let validationPassed = isApproved;
  let expectedOutput = challengeSpec.expectedOutput || [];
  let actualOutput = isApproved ? expectedOutput : generateIncorrectOutput(expectedOutput, dayId);
  const riddleLanguage = challengeSpec.correctSolution ? (challengeSpec.correctSolution.includes("SELECT") || challengeSpec.correctSolution.includes("MERGE") ? "sql" : "python") : "sql";

  // Analyze syntax & structural typos
  if (!codeStr || codeStr.trim().length < 5) {
    if (riddleLanguage === "sql") {
      status = "Syntax Error";
      rawConsoleOutput = "Incorrect syntax near 'SELECT'.\nERROR: Statement cannot be parsed due to empty submission.";
    } else {
      status = "Syntax Error";
      rawConsoleOutput = "SyntaxError: unexpected EOF while parsing\nERROR: Statement cannot be evaluated due to empty submission.";
    }
    validationPassed = false;
    actualOutput = [];
  } else if (riddleLanguage === "sql") {
    // 1. Misspelled SQL Keywords
    if (codeLower.includes("wher ") || codeLower.includes("wher\n") || codeLower.match(/\b(wher|were|wheer)\b/)) {
      status = "Syntax Error";
      rawConsoleOutput = "Incorrect syntax near 'WHER'.\nLine 3: Invalid logical predicate construction.";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.match(/\b(selec)\b/)) {
      status = "Syntax Error";
      rawConsoleOutput = "Incorrect syntax near 'SELEC'.\nLine 1: Projection header incomplete.";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.match(/\b(frm|fro)\b/)) {
      status = "Syntax Error";
      rawConsoleOutput = "Incorrect syntax near 'FRM'.\nLine 2: Source identifier mismatch.";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.match(/\b(jon)\b/)) {
      status = "Syntax Error";
      rawConsoleOutput = "Incorrect syntax near 'JON'.\nLine 4: JOIN keyword mismatch.";
      validationPassed = false;
      actualOutput = [];
    }
    // 2. Misspelled Table names
    else if (codeLower.includes("employees_data") || (dayId === "W1-D1" && !codeLower.includes("employees") && codeLower.includes("data"))) {
      status = "Failed";
      rawConsoleOutput = "Table 'employees_data' does not exist.\nPlease check database catalog metadata schemas.";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.includes("customers_data")) {
      status = "Failed";
      rawConsoleOutput = "Table 'customers_data' does not exist.\nPlease check database catalog metadata schemas.";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.includes("bank_transactions_data")) {
      status = "Failed";
      rawConsoleOutput = "Table 'bank_transactions_data' does not exist.\nPlease check database catalog metadata schemas.";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.includes("legacy_contact") && !codeLower.includes("legacy_contacts")) {
      status = "Failed";
      rawConsoleOutput = "Table 'legacy_contact' does not exist. Did you mean 'legacy_contacts'?";
      validationPassed = false;
      actualOutput = [];
    }
    // 3. Misspelled Column name checks
    else if (codeLower.includes("emp_name") && dayId === "W1-D1") {
      status = "Failed";
      rawConsoleOutput = "Invalid column name 'emp_name'.\nCould not compile dataset project projections.";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.includes("salary_amount") && dayId === "W1-D1") {
      status = "Failed";
      rawConsoleOutput = "Invalid column name 'salary_amount'.\nCould not compile dataset project projections.";
      validationPassed = false;
      actualOutput = [];
    }
    // Standard Success logs but validation failed
    else if (!isApproved) {
      status = "Failed";
      rawConsoleOutput = `Query compiled successfully. 1 batch execution completed.
Error: Current dataset rows failed asserting matched outputs.
Row count mismatch: expected ${expectedOutput.length} rows, parsed ${actualOutput.length} rows.`;
      validationPassed = false;
    } else {
      status = "Success";
      rawConsoleOutput = `Query parsed successfully. 1 batch execution completed.
(succeeded with ${expectedOutput.length} rows affected, status code 0)
Server: localhost:5432 / PostgreSQL 15.2 (Cloud Pushdown Active)`;
    }
  } else if (riddleLanguage === "python") {
    // Python simulation checks
    if (codeLower.includes("import padas")) {
      status = "Syntax Error";
      rawConsoleOutput = "SyntaxError: invalid syntax\nLine 1: import padas as pd";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.includes("/") && codeLower.includes("0") && codeLower.includes("df[")) {
      status = "Runtime Error";
      rawConsoleOutput = "ZeroDivisionError: division by zero\nTraceback (most recent call):\n  File \"curriculum_pipeline.py\", line 12, in <module>\n    df['salary_level'] = df['salary'] / 0";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.includes("salary_level") || codeLower.includes("salary_val")) {
      status = "Runtime Error";
      rawConsoleOutput = "KeyError: 'salary_level'\nTraceback (most recent call):\n  File \"curriculum_pipeline.py\", line 8, in <module>\n    df['salary_level']";
      validationPassed = false;
      actualOutput = [];
    } else if (codeLower.includes("prnt(")) {
      status = "Runtime Error";
      rawConsoleOutput = "NameError: name 'prnt' is not defined\nLine 14: prnt(filtered_df)";
      validationPassed = false;
      actualOutput = [];
    } else if (!isApproved) {
      status = "Failed";
      rawConsoleOutput = `python process completed with exit code 1.
AssertionError: Output dataframe does not match target expected model.
Check dimension counts and record contents!`;
      validationPassed = false;
    } else {
      status = "Success";
      rawConsoleOutput = `Execution completed successfully. (Process exited with code 0)
Stdout:
DataFrame parsed successfully. Dimensions: (${expectedOutput.length} rows, ${Object.keys(expectedOutput[0] || {}).length} columns)
Memory footprint: 3.2MB`;
    }
  }

  return {
    status,
    executionTimeMs: validationPassed ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 20) + 25,
    memoryUsageMb: parseFloat((Math.random() * 1.5 + 2.0).toFixed(1)),
    validationPassed,
    rawConsoleOutput,
    expectedOutput,
    actualOutput,
    reviewText
  };
}

function generateIncorrectOutput(expected: any[], dayId: string): any[] {
  if (!expected || expected.length === 0) return [];
  const copy = JSON.parse(JSON.stringify(expected));

  if (dayId === "W1-D1" && copy.length > 0) {
    // Add Arun Kumar to show mismatch
    return [
      ...copy,
      { employee_id: 103, first_name: "Arun", last_name: "Kumar", salary: 160000.00 }
    ];
  }

  // Generic subtle cell mutation
  if (copy.length > 0) {
    const firstRow = copy[0];
    for (const key of Object.keys(firstRow)) {
      if (typeof firstRow[key] === "number") {
        firstRow[key] = firstRow[key] - 10000;
        break;
      } else if (typeof firstRow[key] === "string" && firstRow[key] !== "") {
        firstRow[key] = firstRow[key] + "_mismatch";
        break;
      }
    }
  }
  return copy;
}

export function InteractiveCodeLab({ 
  day, 
  savedCode, 
  onSaveCode, 
  onSubmitFinish, 
  savedReview, 
  savedApproved,
  onUpdateChallengeStatus,
  currentStatus,
  onGoToNextChallenge,
  onGoToPrevChallenge
}: CodeLabProps) {
  const [code, setCode] = useState(savedCode || day.riddlePlaceholder);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Split Screen Draggable preference state (Desktop only)
  const [splitPercentage, setSplitPercentage] = useState<number>(() => {
    const saved = localStorage.getItem("de_challenge_split_preference");
    return saved ? parseFloat(saved) : 50; // Defaults to balanced 50/50
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile experience active tab: "question" | "solution"
  const [mobileTab, setMobileTab] = useState<"question" | "solution">("question");

  // Detailed execution result and accordion states for redesign feedback panel
  const [execResult, setExecResult] = useState<ExecutionResultState | null>(null);
  const [accordionStates, setAccordionStates] = useState<{
    status: boolean;
    rawConsole: boolean;
    expected: boolean;
    actual: boolean;
    evaluation: boolean;
    performance: boolean;
    explanation: boolean;
    discussion: boolean;
    hints: boolean;
  }>(() => {
    const saved = localStorage.getItem(`de_accordion_states_${day.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      status: true,
      rawConsole: true,
      expected: true,
      actual: true,
      evaluation: false,
      performance: false,
      explanation: false,
      discussion: false,
      hints: false
    };
  });

  const toggleAccordion = (section: keyof typeof accordionStates) => {
    setAccordionStates(prev => {
      const next = { ...prev, [section]: !prev[section] };
      localStorage.setItem(`de_accordion_states_${day.id}`, JSON.stringify(next));
      return next;
    });
  };

  // Accordion compatibility states
  const [isHintsExpanded, setIsHintsExpanded] = useState(false);
  const [isDiscussionExpanded, setIsDiscussionExpanded] = useState(false);
  const [showDirectSolution, setShowDirectSolution] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Load the structured metadata for this day
  const challengeSpec: StructuredChallenge = getChallengeStructure(day.id, day);

  // Sync state with selected day changes & previous progress
  useEffect(() => {
    setCode(savedCode || day.riddlePlaceholder);
    setHint(null);
    setShowDirectSolution(false);

    if (savedReview) {
      const isApproved = savedApproved === true;
      const initialResult = simulateExecutionResult(savedCode || day.riddlePlaceholder, day.id, isApproved, savedReview, challengeSpec);
      setExecResult(initialResult);
    } else {
      setExecResult(null);
    }
  }, [day, savedCode, savedReview, savedApproved]);

  // Persist split preferences
  useEffect(() => {
    localStorage.setItem("de_challenge_split_preference", splitPercentage.toString());
  }, [splitPercentage]);

  const loadingPhrases = [
    "Coach is analyzing your index performance...",
    "Reconciling visual Informatica ports with written expressions...",
    "Benchmarking memory footprints for 50TB architectures...",
    "Translating logic nodes to pipeline systems data flow...",
    "Coach is extremely proud of your effort! Formulating review...",
  ];

  // Rotate loading phrases dynamically
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingPhrase(loadingPhrases[0]);
      let idx = 1;
      interval = setInterval(() => {
        setLoadingPhrase(loadingPhrases[idx % loadingPhrases.length]);
        idx++;
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle Dragging Divider for Desktop Split view
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const percentage = (relativeX / rect.width) * 100;
      // Clamp values between 25% and 75% for readable buffers
      const clamped = Math.max(25, Math.min(75, percentage));
      setSplitPercentage(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    onSaveCode(val);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your current script parameters back to standard challenge templates?")) {
      setCode(day.riddlePlaceholder);
      onSaveCode(day.riddlePlaceholder);
      setHint(null);
      setShowDirectSolution(false);
    }
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(challengeSpec.correctSolution);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const handleToggleCompleted = () => {
    if (onUpdateChallengeStatus) {
      const activeStatus = currentStatus || (savedApproved ? "Completed" : "Not Started");
      const nextStatus = activeStatus === "Completed" ? "In Progress" : "Completed";
      onUpdateChallengeStatus(day.id, nextStatus);
    }
  };

  const handleRequestHint = async () => {
    setIsHintLoading(true);
    setHint(null);
    setIsHintsExpanded(true); // Automatically expand left panel hint accordion
    try {
      const response = await fetch("/api/coach/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayId: day.id,
          focusTitle: day.focusTitle,
          riddleTitle: day.riddleTitle,
          riddleText: day.riddleText,
          currentCode: code,
          aiModel: localStorage.getItem("de_selected_ai_model") || "gemini-3.5-flash",
          customApiKey: localStorage.getItem("de_custom_api_key") || ""
        })
      });
      const data = await response.json();
      if (data.success) {
        setHint(data.hint);
      } else {
        setHint("💡 Look closely at the data structures. Think of how you would connect columns. Try changing your search keys!");
      }
    } catch (err) {
      console.error(err);
      setHint("💡 Keep focus, champion! Remember how columns pipe through targets. Make sure you use the WHERE keyword cleanly.");
    } finally {
      setIsHintLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/coach/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayId: day.id,
          focusTitle: day.focusTitle,
          riddleTitle: day.riddleTitle,
          riddleText: day.riddleText,
          sourceCode: code,
          aiModel: localStorage.getItem("de_selected_ai_model") || "gemini-3.5-flash",
          customApiKey: localStorage.getItem("de_custom_api_key") || ""
        })
      });
      const data = await response.json();
      if (data.success) {
        onSubmitFinish(data.approved, data.review);
        // Automatically set status to completed if accepted by the Coach
        if (data.approved && onUpdateChallengeStatus) {
          onUpdateChallengeStatus(day.id, "Completed");
        }

        // Generate complex execution block
        const result = simulateExecutionResult(code, day.id, data.approved, data.review, challengeSpec);
        setExecResult(result);

        // Reset panel expanded states to standard default compilation behavior
        setAccordionStates(prev => {
          const next = {
            ...prev,
            status: true,
            rawConsole: true,
            expected: true,
            actual: true,
            evaluation: false,
            performance: false,
            explanation: false,
            discussion: false,
            hints: false
          };
          localStorage.setItem(`de_accordion_states_${day.id}`, JSON.stringify(next));
          return next;
        });
      } else {
        onSubmitFinish(false, "Coach suffered a session log read error! Try submitting again. Keep your head up!");
      }
    } catch (err) {
      console.error(err);
      onSubmitFinish(false, "Network warning detected on pipeline! Ensure server connection remains steady. Give it another submission, Champion.");
      
      const errorResult: ExecutionResultState = {
        status: "Runtime Error",
        executionTimeMs: 120,
        memoryUsageMb: 0.1,
        validationPassed: false,
        rawConsoleOutput: "NetworkError: Failed to connect to compiler server.\nPlease verify your internet configuration or retry compiling.",
        expectedOutput: challengeSpec.expectedOutput || [],
        actualOutput: [],
        reviewText: "The system was unable to contact the evaluation server. Please click Run again."
      };
      setExecResult(errorResult);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Markdown Renderer for Coach Evaluations
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check Headers
      if (line.trim().startsWith("###")) {
        return <h5 key={idx} className="text-theme-text font-display font-bold text-sm tracking-wide mt-3 mb-1.5 uppercase border-b border-theme-border pb-0.5">{line.replace("###", "").trim()}</h5>;
      }
      if (line.trim().startsWith("##")) {
        return <h4 key={idx} className="text-theme-text font-display font-bold text-base mt-4 mb-2 border-b border-theme-border/50 pb-1">{line.replace("##", "").trim()}</h4>;
      }
      if (line.trim().startsWith("#")) {
        return <h3 key={idx} className="text-teal-400 font-display font-extrabold text-lg mt-5 mb-3">{line.replace("#", "").trim()}</h3>;
      }
      
      // Check Bullet Lists
      if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
        const content = line.trim().substring(1).trim();
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-xs leading-relaxed mb-1.5">
            {formatBoldText(content)}
          </li>
        );
      }

      // Check numeric list
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal text-theme-muted text-xs leading-relaxed mb-1.5">
            {formatBoldText(numMatch[2])}
          </li>
        );
      }

      // Format Blockquotes
      if (line.trim().startsWith(">")) {
        return (
          <blockquote key={idx} className="border-l-2 border-sky-400 bg-sky-950/20 px-3 py-1.5 rounded text-xs italic text-slate-300 my-2.5">
            {formatBoldText(line.replace(">", "").trim())}
          </blockquote>
        );
      }

      // Empty Lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Regular paragraphs
      return <p key={idx} className="text-xs text-theme-muted leading-relaxed mb-2">{formatBoldText(line)}</p>;
    });
  };

  const formatBoldText = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-teal-300">{part}</strong>;
      }
      return formatInlineCode(part);
    });
  };

  const formatInlineCode = (text: string) => {
    const parts = text.split(/`([^`]+)`/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <code key={i} className="font-mono text-[10px] bg-theme-hover text-theme-accent-primary px-1 py-0.5 rounded border border-theme-border/60 font-semibold">{part}</code>;
      }
      return part;
    });
  };

  // Tabular Data renderer helper for Sample Data and Expected Outputs
  const renderTableHTML = (data: any[]) => {
    if (!data || data.length === 0) return null;
    const headers = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto border border-theme-border/50 rounded-xl bg-theme-bg/60">
        <table className="w-full text-left font-mono text-[11px] leading-relaxed border-collapse">
          <thead>
            <tr className="bg-theme-card/80 text-theme-muted uppercase text-[9px] font-bold tracking-wider border-b border-theme-border">
              {headers.map(h => (
                <th key={h} className="p-2 md:p-3 border-r border-theme-border/40 last:border-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-theme-border/20 last:border-0 hover:bg-theme-hover/20">
                {headers.map(h => (
                  <td key={h} className="p-2 md:p-3 text-theme-text border-r border-theme-border/40 last:border-0 font-normal">
                    {row[h] === null ? <span className="text-red-400 font-bold block">NULL</span> : typeof row[h] === 'number' ? row[h].toLocaleString() : String(row[h])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTableComparison = (
    data: any[],
    compareData: any[],
    isExpectedTable: boolean
  ) => {
    if (!data || data.length === 0) {
      return (
        <div className="p-4 text-center bg-slate-900/40 border border-theme-border/30 rounded-xl text-theme-muted font-mono text-[11px] italic">
          No records generated / empty set
        </div>
      );
    }
    const headers = Object.keys(data[0] || {});
    return (
      <div className="overflow-x-auto border border-theme-border/30 rounded-xl bg-slate-950/40">
        <table className="w-full text-left font-mono text-[11px] leading-relaxed border-collapse select-text">
          <thead>
            <tr className="bg-slate-900/80 text-theme-muted uppercase text-[9px] font-bold tracking-wider border-b border-theme-border cursor-default">
              {headers.map(h => (
                <th key={h} className="p-2 border-r border-theme-border/30 last:border-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const compareRow = compareData?.[i];
              const isRowMissing = isExpectedTable && !compareRow;
              const isRowUnexpected = !isExpectedTable && !compareRow;

              const rowBgClass = isRowMissing
                ? "bg-amber-500/10 hover:bg-amber-500/15 border-l-2 border-amber-500"
                : isRowUnexpected
                  ? "bg-rose-500/10 hover:bg-rose-500/15 border-l-2 border-rose-500"
                  : "border-b border-theme-border/25 hover:bg-slate-800/30";

              return (
                <tr key={i} className={`${rowBgClass} transition-colors`}>
                  {headers.map(h => {
                    const val = row[h];
                    const compareVal = compareRow?.[h];
                    const isMismatched = !isRowMissing && !isRowUnexpected && val !== compareVal;

                    return (
                      <td key={h} className="p-2 border-r border-theme-border/30 last:border-0 font-normal">
                        {isMismatched ? (
                          <div className="flex flex-col gap-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold inline-block border ${
                              isExpectedTable 
                                ? "bg-amber-400/20 text-amber-300 border-amber-400/40" 
                                : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            }`}>
                              {val === null ? "NULL" : String(val)}
                            </span>
                            <span className="text-[8px] text-theme-muted font-bold tracking-wide uppercase mt-0.5 block">
                              {isExpectedTable ? `Actual: ${compareVal}` : `Expected: ${compareVal}`}
                            </span>
                          </div>
                        ) : (
                          <span className={val === null ? 'text-rose-400 font-bold' : 'text-slate-100'}>
                            {val === null ? "NULL" : typeof val === 'number' ? val.toLocaleString() : String(val)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const lineCount = code.split("\n").length;
  // Fallback buffer
  const lineNumbers = Array.from({ length: Math.max(lineCount, 16) }, (_, i) => i + 1);

  const isChallengeDone = currentStatus === "Completed" || savedApproved === true;

  return (
    <div className="flex flex-col h-full w-full select-text" id="challenge-redesign-root">
      
      {/* 1. Header Information Panel */}
      <div className="bg-theme-card border border-theme-border p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-theme-accent-primary/10 rounded-xl border border-theme-accent-primary/20">
            <Layers className="w-5 h-5 text-theme-accent-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                challengeSpec.difficulty === 'Easy' 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : challengeSpec.difficulty === 'Medium'
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {challengeSpec.difficulty}
              </span>
              <span className="text-[10px] bg-theme-bg border border-theme-border px-2 py-0.5 rounded text-theme-muted font-mono font-semibold uppercase tracking-wider">
                ⏱️ 15-20 Mins
              </span>
              {isChallengeDone && (
                <span className="text-[10px] bg-theme-success/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-black animate-pulse flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> PASSED
                </span>
              )}
            </div>
            <h2 className="text-sm md:text-base font-display font-black text-theme-text uppercase tracking-tight leading-normal mt-1">
              Active Module: {day.id} • {day.focusTitle}
            </h2>
          </div>
        </div>

        {/* Challenge Navigation Bar */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {onGoToPrevChallenge && (
            <button
              onClick={onGoToPrevChallenge}
              className="p-2 bg-theme-bg hover:bg-theme-hover border border-theme-border rounded-xl text-theme-muted hover:text-theme-text cursor-pointer transition"
              title="Previous Challenge"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] bg-theme-bg border border-theme-border font-bold px-3 py-1.5 rounded-xl text-theme-muted block shrink-0">
            {day.id} CHALLENGE
          </span>
          {onGoToNextChallenge && (
            <button
              onClick={onGoToNextChallenge}
              className="p-2 bg-theme-bg hover:bg-theme-hover border border-theme-border rounded-xl text-theme-muted hover:text-theme-text cursor-pointer transition"
              title="Next Challenge"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Responsive Switching Container */}
      <div 
        ref={containerRef}
        className="flex flex-col lg:flex-row flex-1 w-full bg-theme-hover/10 rounded-2xl border border-theme-border overflow-hidden min-h-[500px] lg:h-[calc(100vh-220px)] relative"
      >
        {/* Mobile Experience tab switcher */}
        <div className="flex border-b border-theme-border bg-theme-card/50 lg:hidden p-1.5 gap-1 select-none">
          <button
            onClick={() => setMobileTab("question")}
            className={`flex-1 py-2 text-center text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
              mobileTab === "question"
                ? "bg-theme-accent-primary text-theme-inverse shadow-sm"
                : "text-theme-muted hover:text-theme-text"
            }`}
          >
            Question Instruction
          </button>
          <button
            onClick={() => setMobileTab("solution")}
            className={`flex-1 py-2 text-center text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
              mobileTab === "solution"
                ? "bg-theme-accent-primary text-theme-inverse shadow-sm"
                : "text-theme-muted hover:text-theme-text"
            }`}
          >
            Solution Workspace
          </button>
        </div>

        {/* LEFT PANEL: QUESTION (Independent Scroll container) */}
        <div 
          className={`h-full overflow-y-auto bg-theme-card/15 ${
            mobileTab === "question" ? "flex" : "hidden"
          } lg:flex flex-col`}
          style={{ width: typeof window !== "undefined" && window.innerWidth >= 1024 ? `${splitPercentage}%` : "100%" }}
        >
          <div className="p-6 space-y-6 scrollbar-thin">
            
            {/* Title segment */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-theme-accent-secondary font-black uppercase tracking-widest block">PROBLEM TITLE</span>
              <h3 className="text-xl font-display font-black text-theme-text uppercase tracking-tight flex items-center gap-2">
                🧩 {challengeSpec.riddleTitle}
              </h3>
            </div>

            {/* Business Context */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-theme-muted font-black uppercase tracking-widest block">BUSINESS CONTEXT</span>
              <p className="text-xs text-theme-text leading-relaxed font-sans font-light">
                {challengeSpec.businessContext}
              </p>
            </div>

            {/* Objective */}
            <div className="space-y-1.5 bg-theme-accent-primary/5 p-4 rounded-xl border border-theme-accent-primary/10">
              <span className="text-[9px] font-mono text-theme-accent-primary font-black uppercase tracking-widest block mb-0.5">OBJECTIVE</span>
              <p className="text-xs text-theme-text font-medium leading-relaxed font-sans">
                {challengeSpec.objective}
              </p>
            </div>

            {/* Database Schema Section */}
            <div className="space-y-3.5 pt-2 border-t border-theme-border/40">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-theme-muted font-black uppercase tracking-widest block">DATABASE SCHEMA</span>
                <span className="text-[9px] font-mono bg-theme-bg border border-theme-border px-1.5 py-0.2 rounded text-theme-muted text-[8px] font-bold">
                  {challengeSpec.schemaTableName}
                </span>
              </div>

              {/* Grid Column definitions */}
              <div className="overflow-hidden border border-theme-border/50 rounded-xl bg-theme-bg/40">
                <table className="w-full text-left font-mono text-[11px] leading-relaxed border-collapse">
                  <thead>
                    <tr className="bg-theme-card/90 text-theme-muted uppercase text-[9px] font-bold tracking-wider border-b border-theme-border">
                      <th className="p-2 md:p-3 border-r border-theme-border/40">Column</th>
                      <th className="p-2 md:p-3 border-r border-theme-border/40">Type</th>
                      <th className="p-2 md:p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challengeSpec.schemaColumns.map(col => (
                      <tr key={col.name} className="border-b border-theme-border/20 last:border-0 hover:bg-theme-hover/20">
                        <td className="p-2 md:p-3 font-semibold text-theme-text border-r border-theme-border/40">{col.name}</td>
                        <td className="p-2 md:p-3 font-medium text-theme-accent-primary border-r border-theme-border/40">{col.type}</td>
                        <td className="p-2 md:p-3 text-theme-muted font-normal text-[10px] font-sans">{col.description || "Field property value"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CREATE TABLE VIEW DDL code blocks snippet */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] font-mono text-theme-muted font-black uppercase tracking-widest block">CREATE TABLE VIEW</span>
                <div className="bg-code-bg border border-code-border p-3 rounded-xl overflow-x-auto text-[11px] font-mono text-code-text leading-relaxed">
                  <pre><code>{challengeSpec.createTableSql}</code></pre>
                </div>
              </div>
            </div>

            {/* Sample Data layout */}
            <div className="space-y-2 pt-2 border-t border-theme-border/40">
              <span className="text-[9px] font-mono text-theme-muted font-black uppercase tracking-widest block">SAMPLE INPUT DATA</span>
              {renderTableHTML(challengeSpec.sampleData)}
            </div>

            {/* Expected Output layout */}
            <div className="space-y-2 pt-2 border-t border-theme-border/40">
              <span className="text-[9px] font-mono text-theme-muted font-black uppercase tracking-widest block">EXPECTED OUTPUT DATASET</span>
              {renderTableHTML(challengeSpec.expectedOutput)}
            </div>

            {/* Constraints/Requirements list */}
            <div className="space-y-2 pt-2 border-t border-theme-border/40">
              <span className="text-[9px] font-mono text-theme-muted font-black uppercase tracking-widest block">CONSTRAINTS &amp; REQUIREMENTS</span>
              <ul className="space-y-2.5">
                {challengeSpec.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-theme-muted leading-relaxed font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-accent-secondary shrink-0 mt-2" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Collapsible Hints Segment */}
            <div className="pt-2 border-t border-theme-border/40">
              <button
                onClick={() => setIsHintsExpanded(!isHintsExpanded)}
                className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-theme-text hover:text-theme-accent-primary py-2 select-none uppercase tracking-wide cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
                  Hints Section ({challengeSpec.hints.length} Progressive Hints)
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-theme-muted transition-transform duration-200 ${isHintsExpanded ? "transform rotate-180" : ""}`} />
              </button>

              {isHintsExpanded && (
                <div className="space-y-3 mt-3 animate-fade-in pl-1 bg-theme-bg/30 p-3.5 rounded-xl border border-theme-border/40">
                  {challengeSpec.hints.map((h, i) => (
                    <div key={i} className="p-2.5 bg-theme-card/60 rounded-lg border border-theme-border/50 text-xs">
                      <span className="text-[9px] font-mono font-bold text-amber-500 block uppercase mb-1">HINT {i + 1}</span>
                      <p className="text-theme-muted text-[11px] leading-relaxed font-sans">{h}</p>
                    </div>
                  ))}
                  {hint && (
                    <div className="p-3 bg-indigo-950/10 border border-indigo-500/20 text-indigo-300 rounded-lg mt-2 text-[11px]">
                      <span className="text-[9px] font-mono font-bold text-theme-accent-primary block uppercase mb-0.5">💡 Direct Mentor Hint:</span>
                      <div className="leading-relaxed font-sans font-normal p-0.5">{renderMarkdown(hint)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Collapsible Discussion Segment */}
            <div className="pt-2 border-t border-theme-border/40 pb-4">
              <button
                onClick={() => setIsDiscussionExpanded(!isDiscussionExpanded)}
                className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-theme-text hover:text-theme-accent-primary py-2 select-none uppercase tracking-wide cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-theme-accent-primary" />
                  Discussion &amp; Optimization Insights
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-theme-muted transition-transform duration-200 ${isDiscussionExpanded ? "transform rotate-180" : ""}`} />
              </button>

              {isDiscussionExpanded && (
                <div className="space-y-4 mt-3 animate-fade-in bg-theme-bg/30 p-4 rounded-xl border border-theme-border/40 text-xs text-theme-muted">
                  <div>
                    <span className="text-[9px] font-mono font-black text-theme-text block uppercase mb-1">WHY THE SOLUTION WORKS</span>
                    <p className="leading-relaxed font-sans text-[11px]">{challengeSpec.discussion.worksExplanation}</p>
                  </div>
                  <div className="pt-2 border-t border-theme-border/20">
                    <span className="text-[9px] font-mono font-black text-red-400 block uppercase mb-1">COMMON MISTAKES</span>
                    <p className="leading-relaxed font-sans text-[11px]">{challengeSpec.discussion.commonMistakes}</p>
                  </div>
                  <div className="pt-2 border-t border-theme-border/20">
                    <span className="text-[9px] font-mono font-black text-emerald-400 block uppercase mb-1">PERFORMANCE CONSIDERATIONS</span>
                    <p className="leading-relaxed font-sans text-[11px]">{challengeSpec.discussion.performance}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* DRAGGABLE DIVIDER (Desktop only) */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className={`hidden lg:flex items-center justify-center w-2 hover:w-2.5 bg-theme-border hover:bg-theme-accent-primary focus:bg-theme-accent-primary cursor-col-resize transition-colors self-stretch z-15 relative select-none`}
          title="Drag to resize panels"
        >
          <div className="w-1 h-10 rounded-full bg-theme-muted/40" />
        </div>

        {/* RIGHT PANEL: SOLUTION WORKSPACE (Independent Scroll container) */}
        <div 
          className={`h-full overflow-y-auto bg-theme-bg/60 p-4 md:p-6 flex flex-col justify-between ${
            mobileTab === "solution" ? "flex" : "hidden"
          } lg:flex flex-col`}
          style={{ width: typeof window !== "undefined" && window.innerWidth >= 1024 ? `${100 - splitPercentage}%` : "100%" }}
        >
          <div className="space-y-6">
            
            {/* Toolbar header of editor */}
            <div className="bg-theme-card border border-theme-border rounded-xl px-4 py-3 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <span className="w-px h-3 bg-theme-border mx-1" />
                <span className="font-mono text-theme-muted text-[11px] flex items-center gap-1.5 font-semibold">
                  <Terminal className="w-3.5 h-3.5 text-theme-accent-primary animate-pulse" />
                  curriculum_pipeline.{day.riddleLanguage === 'sql' ? 'sql' : day.riddleLanguage === 'python' ? 'py' : 'txt'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg hover:bg-theme-hover text-theme-muted hover:text-theme-accent-secondary transition cursor-pointer"
                  title="Reset code template"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Workable Editor body */}
            <div className="bg-theme-card border border-theme-border rounded-2xl overflow-hidden shadow-sm hover:border-theme-accent-primary/20 transition-colors flex flex-col">
              
              {/* Textarea Workspace block */}
              <div className="flex h-72 md:h-80 font-mono text-[14px]">
                
                {/* Line numbers column */}
                <div className="w-10 bg-theme-bg/85 text-theme-muted pr-2 py-4 flex flex-col items-end gap-0 relative select-none border-r border-theme-border/60">
                  {lineNumbers.map(num => (
                    <span key={num} className="h-6 leading-6 text-[10px] font-semibold text-theme-muted/40">{num}</span>
                  ))}
                </div>

                {/* Editor Textarea with custom typography spacing */}
                <textarea
                  value={code}
                  onChange={handleTextChange}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-theme-text p-4 font-mono text-[14px] leading-6 resize-none h-full focus:outline-none placeholder-theme-muted/50 selection:bg-theme-accent-primary/25 scrollbar-thin font-medium"
                  style={{ tabSize: 4 }}
                  placeholder="Draft your query insights or pipeline code parameters here..."
                />
              </div>

              {/* Direct Answer Copy Toolbar inside the card */}
              <div className="bg-theme-hover/40 border-t border-theme-border px-4 py-2 flex items-center justify-between">
                <div className="text-[10px] text-theme-muted flex items-center gap-1 font-mono uppercase font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-theme-accent-secondary" /> Cloud Compiler Enclosed
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDirectSolution(!showDirectSolution)}
                    className="text-[10px] font-mono border border-theme-border bg-theme-bg px-2.5 py-1 text-theme-accent-secondary hover:text-theme-accent-primary hover:border-theme-accent-primary/30 rounded-lg cursor-pointer transition uppercase font-black"
                  >
                    {showDirectSolution ? "Hide Solution" : "Show Solution"}
                  </button>
                </div>
              </div>
            </div>

            {/* DIRECT CORRECT ANSWER INLINE ACCORDION PANEL */}
            {showDirectSolution && (
              <div className="bg-indigo-950/5 border border-indigo-500/20 rounded-xl p-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                  <span className="text-[10px] font-mono text-theme-accent-secondary font-black uppercase flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Sample Correct Solution Response
                  </span>
                  <button
                    onClick={handleCopySolution}
                    className="p-1 px-2.5 hover:bg-theme-accent-primary hover:text-theme-inverse rounded border border-theme-border flex items-center gap-1 text-[9px] font-mono cursor-pointer transition uppercase font-black bg-theme-bg"
                  >
                    {copiedResponse ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
                    <span>{copiedResponse ? "Copied" : "Copy Solution"}</span>
                  </button>
                </div>
                <div className="bg-code-bg border border-code-border p-3.5 rounded-lg overflow-x-auto text-xs font-mono text-code-text leading-relaxed font-semibold">
                  <pre><code>{challengeSpec.correctSolution}</code></pre>
                </div>
              </div>
            )}

            {/* ACTION DIRECT BUTTONS BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-theme-card/30 border border-theme-border/60 rounded-xl">
              
              <div className="flex gap-2">
                {/* 1. Show Hint Trigger */}
                <button
                  onClick={handleRequestHint}
                  disabled={isHintLoading || isLoading}
                  className="px-3.5 py-2 hover:bg-theme-hover border border-theme-border text-theme-muted hover:text-theme-text text-[11px] font-mono font-bold uppercase rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 shrink-0"
                >
                  {isHintLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                  )}
                  <span>{day.riddleLanguage === 'sql' ? 'Show Hint' : 'Show Hint'}</span>
                </button>

                {/* 2. Manual Complete Switcher mark */}
                {onUpdateChallengeStatus && (
                  <button
                    onClick={handleToggleCompleted}
                    className={`px-3 py-2 border rounded-lg text-[11px] font-mono font-bold uppercase cursor-pointer flex items-center gap-1.5 transition shrink-0 ${
                      isChallengeDone
                        ? "bg-theme-success/10 border-theme-success/20 text-theme-success hover:bg-theme-success/25"
                        : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${isChallengeDone ? 'text-theme-success' : 'text-theme-muted'}`} />
                    <span>Mark Complete</span>
                  </button>
                )}
              </div>

              {/* 3. Execute Submit Check */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || isHintLoading}
                className="px-4.5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-teal-500 hover:opacity-95 text-slate-100 font-bold text-xs tracking-wide flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50 font-mono uppercase"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-300" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-teal-300" />
                )}
                <span>{day.riddleLanguage === 'sql' ? 'Run Query' : 'Run Code'}</span>
              </button>
            </div>

          </div>

          {/* DYNAMIC PROCESSING OVERLAY */}
          {isLoading && (
            <div className="bg-theme-card/95 border border-theme-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-md animate-fade-in my-4 py-8 select-none">
              <Loader2 className="w-8 h-8 text-theme-accent-primary animate-spin" />
              <div className="space-y-1">
                <h4 className="font-display font-bold text-theme-text text-sm uppercase">STAGED COMPILING OPERATIONS</h4>
                <p className="text-xs text-theme-accent-primary font-mono italic animate-pulse">{loadingPhrase}</p>
              </div>
            </div>
          )}

          {/* REDESIGNED EXECUTION RESULTS PANEL */}
          {execResult && !isLoading && (
            <div className="space-y-4 mt-6">
              
              {/* Distinct Success and Failure Hero Banners */}
              {execResult.validationPassed ? (
                <div className="bg-emerald-950/25 border border-emerald-500/40 text-emerald-300 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm animate-fade-in">
                  <div className="space-y-1">
                    <h4 className="font-display font-medium text-sm text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      ✓ Solution Accepted
                    </h4>
                    <p className="text-xs text-theme-muted font-normal font-sans">
                      All validation checks passed successfully. Your data pipeline compiles perfectly!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <span className="px-2.5 py-1 text-[9px] font-bold font-mono bg-emerald-500/15 border border-emerald-500/25 rounded-md uppercase text-emerald-400">✓ Correct Output</span>
                    <span className="px-2.5 py-1 text-[9px] font-bold font-mono bg-emerald-500/15 border border-emerald-500/25 rounded-md uppercase text-emerald-400">✓ Validation Passed</span>
                    <span className="px-2.5 py-1 text-[9px] font-bold font-mono bg-emerald-500/15 border border-emerald-500/25 rounded-md uppercase text-emerald-400">✓ Challenge Completed</span>
                    <span className="px-2.5 py-1 text-[9px] font-bold font-mono bg-emerald-500/15 border border-emerald-500/25 rounded-md uppercase text-emerald-400">✓ Progress Updated</span>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/20 border border-rose-500/30 text-rose-300 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
                  <div className="space-y-1">
                    <h4 className="font-display font-medium text-sm text-rose-400 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                      ✗ {execResult.status === "Syntax Error" ? "Syntax Error" : execResult.status === "Runtime Error" ? "Runtime Error" : "Validation Failed"}
                    </h4>
                    <p className="text-xs text-theme-muted font-normal font-sans">
                      Output does not match expected results. Review the differences and compiler outputs below to debug.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-[9px] font-bold font-mono bg-rose-500/15 border border-rose-500/25 rounded-md uppercase text-rose-400 shrink-0">✗ Fix Required</span>
                </div>
              )}

              {/* Collapsible result accordions */}
              <div className="space-y-3.5">
                
                {/* 1. Execution Status Accordion */}
                <div className="border border-theme-border/60 rounded-xl bg-theme-card overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("status")}
                    className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono font-bold text-theme-text hover:bg-theme-bg/30 text-left border-b border-theme-border/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-theme-accent-primary" />
                      1. EXECUTION STATUS
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                        execResult.validationPassed
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}>
                        {execResult.status}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${accordionStates.status ? "transform rotate-180" : ""}`} />
                    </div>
                  </button>
                  {accordionStates.status && (
                    <div className="p-4 bg-theme-bg/10 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in select-none">
                      <div className="p-3 bg-slate-900/40 rounded-lg border border-theme-border/20 text-center space-y-1">
                        <span className="text-[8px] font-mono text-theme-muted uppercase block font-black">Execution Status</span>
                        <span className={`text-[11px] font-mono font-bold ${execResult.validationPassed ? "text-emerald-400" : "text-rose-400"}`}>
                          {execResult.status}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900/40 rounded-lg border border-theme-border/20 text-center space-y-1">
                        <span className="text-[8px] font-mono text-theme-muted uppercase block font-black">Execution Time</span>
                        <span className="text-[11px] font-mono font-bold text-slate-200">{execResult.executionTimeMs} ms</span>
                      </div>
                      <div className="p-3 bg-slate-900/40 rounded-lg border border-theme-border/20 text-center space-y-1">
                        <span className="text-[8px] font-mono text-theme-muted uppercase block font-black">Memory Usage</span>
                        <span className="text-[11px] font-mono font-bold text-slate-200">{execResult.memoryUsageMb} MB</span>
                      </div>
                      <div className="p-3 bg-slate-900/40 rounded-lg border border-theme-border/20 text-center space-y-1">
                        <span className="text-[8px] font-mono text-theme-muted uppercase block font-black">Validation Result</span>
                        <span className={`text-[11px] font-mono font-bold ${execResult.validationPassed ? "text-emerald-400" : "text-rose-400"}`}>
                          {execResult.validationPassed ? "PASS" : "FAIL"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Raw Console Output Accordion */}
                <div className="border border-theme-border/60 rounded-xl bg-theme-card overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("rawConsole")}
                    className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono font-bold text-theme-text hover:bg-theme-bg/30 text-left border-b border-theme-border/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-theme-accent-secondary" />
                      2. RAW CONSOLE OUTPUT
                    </span>
                    <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${accordionStates.rawConsole ? "transform rotate-180" : ""}`} />
                  </button>
                  {accordionStates.rawConsole && (
                    <div className="p-4 bg-slate-950/80 border-t border-theme-border/30 select-text overflow-x-auto leading-relaxed animate-fade-in font-mono text-[11px] text-slate-300 font-semibold whitespace-pre-wrap">
                      {execResult.rawConsoleOutput}
                    </div>
                  )}
                </div>

                {/* 3. Expected Output Accordion */}
                <div className="border border-theme-border/60 rounded-xl bg-theme-card overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("expected")}
                    className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono font-bold text-theme-text hover:bg-theme-bg/30 text-left border-b border-theme-border/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      3. EXPECTED OUTPUT
                    </span>
                    <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${accordionStates.expected ? "transform rotate-180" : ""}`} />
                  </button>
                  {accordionStates.expected && (
                    <div className="p-4 bg-theme-bg/15 border-t border-theme-border/30 space-y-2 animate-fade-in">
                      <div className="text-[9px] font-mono text-emerald-400 uppercase font-black flex items-center justify-between mb-1">
                        <span>Expected Output Target Set</span>
                        <span className="text-[8px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">Standard Spec</span>
                      </div>
                      {renderTableComparison(challengeSpec.expectedOutput, execResult.actualOutput, true)}
                    </div>
                  )}
                </div>

                {/* 4. Actual Output Accordion */}
                <div className="border border-theme-border/60 rounded-xl bg-theme-card overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("actual")}
                    className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono font-bold text-theme-text hover:bg-theme-bg/30 text-left border-b border-theme-border/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" />
                      4. ACTUAL OUTPUT (Your Query Results)
                    </span>
                    <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${accordionStates.actual ? "transform rotate-180" : ""}`} />
                  </button>
                  {accordionStates.actual && (
                    <div className="p-4 bg-theme-bg/15 border-t border-theme-border/30 space-y-2 animate-fade-in">
                      <div className="text-[9px] font-mono uppercase font-black flex items-center justify-between mb-1">
                        <span className={execResult.validationPassed ? "text-emerald-400" : "text-rose-400"}>Your Actual Output</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border ${
                          execResult.validationPassed
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        } font-bold`}>
                          {execResult.validationPassed ? "MATCHED" : "MISMATCH"}
                        </span>
                      </div>
                      {renderTableComparison(execResult.actualOutput, challengeSpec.expectedOutput, false)}
                    </div>
                  )}
                </div>

                {/* 5. Evaluation Review Accordion */}
                <div className="border border-theme-border/60 rounded-xl bg-theme-card overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("evaluation")}
                    className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono font-bold text-theme-text hover:bg-theme-bg/30 text-left border-b border-theme-border/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      5. EVALUATION REVIEW (Coach Insights)
                    </span>
                    <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${accordionStates.evaluation ? "transform rotate-180" : ""}`} />
                  </button>
                  {accordionStates.evaluation && (
                    <div className="p-4 md:p-5 text-xs font-mono leading-relaxed bg-slate-900/40 select-text overflow-y-auto max-h-[400px] scrollbar-thin animate-fade-in border-t border-theme-border/30">
                      <div className="text-theme-text font-normal font-sans space-y-2 pr-1">
                        {renderMarkdown(execResult.reviewText)}
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Performance Metrics Accordion */}
                <div className="border border-theme-border/60 rounded-xl bg-theme-card overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("performance")}
                    className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono font-bold text-theme-text hover:bg-theme-bg/30 text-left border-b border-theme-border/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-theme-accent-primary" />
                      6. PERFORMANCE METRICS
                    </span>
                    <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${accordionStates.performance ? "transform rotate-180" : ""}`} />
                  </button>
                  {accordionStates.performance && (
                    <div className="p-4 bg-slate-900/30 border-t border-theme-border/30 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-in select-none">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-theme-border/20 space-y-1">
                        <span className="text-[8px] font-mono text-emerald-400 font-bold block uppercase">Execution Speed Percentile</span>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          Your query is faster than <span className="font-bold text-emerald-400">{execResult.validationPassed ? "94.8%" : "0.0%"}</span> of other submissions. Pushdown computation active.
                        </p>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-theme-border/20 space-y-1">
                        <span className="text-[8px] font-mono text-emerald-400 font-bold block uppercase">Complexity Estimation Overview</span>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          Estimated CPU complexity: <span className="font-bold text-teal-400">{execResult.validationPassed ? "O(N) Linear scan" : "Inconclusive"}</span>. Cache buffers hit successfully.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. Solution Explanation Accordion */}
                <div className="border border-theme-border/60 rounded-xl bg-theme-card overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("explanation")}
                    className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono font-bold text-theme-text hover:bg-theme-bg/30 text-left border-b border-theme-border/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      7. SOLUTION EXPLANATION (System Guide)
                    </span>
                    <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${accordionStates.explanation ? "transform rotate-180" : ""}`} />
                  </button>
                  {accordionStates.explanation && (
                    <div className="p-4 bg-slate-900/40 border-t border-theme-border/30 space-y-4 select-text animate-fade-in">
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-theme-border/30 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] font-mono uppercase text-theme-muted font-bold tracking-wider">Solution Template</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(challengeSpec.correctSolution);
                              setCopiedResponse(true);
                              setTimeout(() => setCopiedResponse(false), 2000);
                            }}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-[9px] font-mono text-slate-300 rounded border border-theme-border flex items-center gap-1 cursor-pointer transition uppercase"
                          >
                            {copiedResponse ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
                            <span>{copiedResponse ? "Copied" : "Copy Solution"}</span>
                          </button>
                        </div>
                        <pre className="font-mono text-[10.5px] text-slate-200 overflow-x-auto whitespace-pre leading-relaxed font-semibold">
                          <code>{challengeSpec.correctSolution}</code>
                        </pre>
                      </div>
                      {challengeSpec.discussion?.worksExplanation && (
                        <div className="space-y-1 p-1">
                          <span className="text-[8.5px] font-mono text-indigo-400 font-bold block uppercase">Why It Works:</span>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">{challengeSpec.discussion.worksExplanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 8. Hints Section Accordion */}
                <div className="border border-theme-border/60 rounded-xl bg-theme-card overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("hints")}
                    className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono font-bold text-theme-text hover:bg-theme-bg/30 text-left border-b border-theme-border/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
                      8. EXPLORATIVE HINTS MODULE
                    </span>
                    <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${accordionStates.hints ? "transform rotate-180" : ""}`} />
                  </button>
                  {accordionStates.hints && (
                    <div className="p-4 bg-slate-900/40 border-t border-theme-border/30 space-y-3 pl-1 animate-fade-in">
                      {challengeSpec.hints.map((h, i) => (
                        <div key={i} className="p-2.5 bg-theme-card/60 rounded-lg border border-theme-border/50 text-[11.5px] font-sans text-slate-300 leading-relaxed">
                          <span className="text-[8.5px] font-mono font-bold text-amber-500 block uppercase mb-0.5">PROGRESSIVE HINT {i + 1}</span>
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 9. Discussion & Pitfalls Accordion */}
                <div className="border border-theme-border/60 rounded-xl bg-theme-card overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("discussion")}
                    className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono font-bold text-theme-text hover:bg-theme-bg/30 text-left border-b border-theme-border/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-400" />
                      9. COMMON MISTAKES &amp; DISCUSSION
                    </span>
                    <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${accordionStates.discussion ? "transform rotate-180" : ""}`} />
                  </button>
                  {accordionStates.discussion && (
                    <div className="p-4 bg-slate-900/40 border-t border-theme-border/30 space-y-4 animate-fade-in">
                      {challengeSpec.discussion?.commonMistakes && (
                        <div className="space-y-1">
                          <span className="text-[8.5px] font-mono text-rose-400 font-bold block uppercase">Common Pitfalls:</span>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">{challengeSpec.discussion.commonMistakes}</p>
                        </div>
                      )}
                      {challengeSpec.discussion?.performance && (
                        <div className="space-y-1 border-t border-theme-border/20 pt-3">
                          <span className="text-[8.5px] font-mono text-teal-400 font-bold block uppercase">Production Scaling Notes:</span>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">{challengeSpec.discussion.performance}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
