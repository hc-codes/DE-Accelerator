import React, { useState, useEffect } from "react";
import { 
  Terminal, Play, HelpCircle, RotateCcw, CheckCircle, 
  XCircle, Zap, Loader2, Sparkles, BookOpen 
} from "lucide-react";
import { CurriculumDay } from "../data/curriculum";

interface CodeLabProps {
  day: CurriculumDay;
  savedCode: string;
  onSaveCode: (code: string) => void;
  onSubmitFinish: (approved: boolean, review: string) => void;
  savedReview: string;
  savedApproved: boolean | null;
}

export function InteractiveCodeLab({ 
  day, savedCode, onSaveCode, onSubmitFinish, savedReview, savedApproved 
}: CodeLabProps) {
  const [code, setCode] = useState(savedCode || day.riddlePlaceholder);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Sync state with selected day changes
  useEffect(() => {
    setCode(savedCode || day.riddlePlaceholder);
    setHint(null);
  }, [day, savedCode]);

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    onSaveCode(val);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset today's code to the template?")) {
      setCode(day.riddlePlaceholder);
      onSaveCode(day.riddlePlaceholder);
      setHint(null);
    }
  };

  const handleRequestHint = async () => {
    setIsHintLoading(true);
    setHint(null);
    try {
      const response = await fetch("/api/coach/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayId: day.id,
          focusTitle: day.focusTitle,
          riddleTitle: day.riddleTitle,
          riddleText: day.riddleText,
          currentCode: code
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
          sourceCode: code
        })
      });
      const data = await response.json();
      if (data.success) {
        onSubmitFinish(data.approved, data.review);
      } else {
        onSubmitFinish(false, "Coach suffered a session log read error! Try submitting again. Keep your head up!");
      }
    } catch (err) {
      console.error(err);
      onSubmitFinish(false, "Network warning detected on pipeline! Ensure server connection remains steady. Give it another submission, Champion.");
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
        // Clean line from bullet symbol
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

  // Helper inside renderer to handle **bold** segments
  const formatBoldText = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-teal-300">{part}</strong>;
      }
      // Check for inline backtick codes
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

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 8) }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Riddle Briefing Card */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 md:p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-theme-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-mono text-theme-accent-primary font-semibold uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Core Dynamic Task Module
        </div>

        <h3 className="font-display font-extrabold text-theme-text text-lg md:text-xl tracking-tight mb-3">
          🧩 Riddle: {day.riddleTitle}
        </h3>

        <div className="bg-theme-bg rounded-xl p-4 border border-theme-border text-xs text-theme-muted leading-relaxed mb-4 font-normal">
          {day.riddleText.split("\n").map((para, i) => (
            <p key={i} className="mb-2 last:mb-0">{para}</p>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-theme-hover p-2.5 rounded-lg border border-theme-border">
          <div className="flex items-center gap-1.5 text-theme-muted font-mono text-[11px]">
            <span>Active workspace:</span>
            <span className="font-semibold text-theme-text bg-theme-bg border border-theme-border px-2 py-0.5 rounded uppercase">
              {day.riddleLanguage} playground
            </span>
          </div>
          <p className="text-[10px] text-theme-muted font-mono italic">
            *Code submits safely to server-side check. No mock loops.
          </p>
        </div>
      </div>

      {/* Editor & Playground Workspace */}
      <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden shadow-sm">
        {/* Workspace Toolbar Controls */}
        <div className="bg-theme-hover border-b border-theme-border px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="w-px h-3.5 bg-theme-border mx-1.5" />
            <div className="flex items-center gap-1.5 font-mono text-theme-muted text-xs">
              <Terminal className="w-3.5 h-3.5 text-theme-accent-primary" />
              <span>curriculum_pipeline.{day.riddleLanguage === 'sql' ? 'sql' : day.riddleLanguage === 'python' ? 'py' : 'txt'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleReset}
              title="Reset template"
              className="p-1.5 rounded-md hover:bg-theme-hover text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Written Workspace */}
        <div className="flex bg-theme-bg relative h-72 font-mono text-xs">
          {/* Editor Line Numbers */}
          <div className="w-10 bg-theme-hover border-r border-theme-border text-theme-muted select-none pr-2.5 py-4 font-mono font-medium line-none flex flex-col items-end gap-1 select-none">
            {lineNumbers.map(n => (
              <span key={n} className="h-5 leading-5 block">{n}</span>
            ))}
          </div>

          {/* Interactive Text Input Area */}
          <textarea
            value={code}
            onChange={handleTextChange}
            disabled={isLoading}
            className="flex-1 bg-transparent text-theme-text p-4 font-mono text-xs leading-5 resize-none h-full focus:outline-none placeholder-theme-muted/50 selection:bg-theme-accent-primary/20 scrollbar-thin"
            style={{ tabSize: 4 }}
          />

          {/* Solution Approved Stamp Background watermarking */}
          {savedApproved === true && (
            <div className="absolute right-4 bottom-4 border-2 border-theme-success/40 text-theme-success/40 px-3 py-1 rounded font-display font-black text-xs uppercase tracking-widest leading-none pointer-events-none select-none transform rotate-12 uppercase scale-110">
              Approved Code
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="bg-theme-hover border-t border-theme-border px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleRequestHint}
            disabled={isHintLoading || isLoading}
            className="px-3.5 py-2 rounded-lg bg-theme-bg hover:bg-theme-hover border border-theme-border text-theme-muted hover:text-theme-text text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            {isHintLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>Ask Coach's Hint</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading || isHintLoading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-slate-100 font-semibold text-xs tracking-wide flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-300" />
            ) : (
              <Play className="w-3.5 h-3.5 text-teal-300" />
            )}
            <span>Submit Solution Log</span>
          </button>
        </div>
      </div>

      {/* Dynamic Loading Overlay */}
      {isLoading && (
        <div className="bg-theme-card/90 border border-theme-border rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm animate-fade-in py-10">
          <Loader2 className="w-8 h-8 text-theme-accent-primary animate-spin" />
          <div className="space-y-1">
            <h4 className="font-display font-bold text-theme-text text-sm">Processing Pipeline Operations</h4>
            <p className="text-xs text-theme-accent-primary font-mono italic animate-pulse">{loadingPhrase}</p>
          </div>
        </div>
      )}

      {/* Hint Output Box */}
      {hint && !isLoading && (
        <div className="bg-theme-card border border-amber-500/20 rounded-xl p-4 md:p-5 relative overflow-hidden animation-fade-in">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-1.5">
              <h5 className="font-display font-bold text-amber-400 text-[11px] uppercase tracking-widest">
                Direct Mentor Hint Session
              </h5>
              <div className="text-theme-muted text-xs leading-relaxed font-normal">
                {renderMarkdown(hint)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compiler / Coach Review Console Panel */}
      {savedReview && !isLoading && (
        <div className={`border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
          savedApproved === true 
            ? "border-theme-success/20 bg-theme-card" 
            : savedApproved === false 
              ? "border-amber-500/20 bg-theme-card" 
              : "border-theme-border bg-theme-card"
        }`}>
          {/* Console Header */}
          <div className={`px-4 py-3 flex items-center justify-between border-b ${
            savedApproved === true 
              ? "bg-theme-hover border-theme-success/15 text-theme-success" 
              : savedApproved === false 
                ? "bg-theme-hover border-amber-500/15 text-theme-amber" 
                : "bg-theme-hover border-theme-border text-theme-muted"
          }`}>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-theme-bg flex items-center justify-center font-mono text-[10px] uppercase font-bold px-1.5">
                system
              </div>
              <span className="font-display font-semibold text-xs tracking-wide uppercase">
                Coach Feedback Console
              </span>
            </div>

            {/* Approved / Revisions Badge tags */}
            {savedApproved === true ? (
              <span className="flex items-center gap-1 text-[10px] font-mono font-medium bg-theme-success/10 text-theme-success border border-theme-success/20 px-2 py-0.5 rounded-full uppercase">
                <CheckCircle className="w-3.5 h-3.5" /> Approved
              </span>
            ) : savedApproved === false ? (
              <span className="flex items-center gap-1 text-[10px] font-mono font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                <XCircle className="w-3.5 h-3.5" /> Revision Preferred
              </span>
            ) : (
              <span className="text-[10px] font-mono font-medium text-theme-muted">
                Evaluation Logged
              </span>
            )}
          </div>

          {/* Console Body output message */}
          <div className="p-5 md:p-6 bg-theme-bg text-xs overflow-y-auto max-h-[400px] scrollbar-thin">
            <div className="flex gap-2 text-theme-muted font-mono text-[10px] mb-3 select-none pb-1 border-b border-theme-border">
              <span>COMPILE_STAGED_UTILITY_RUN</span> • <span>SUCCESSFUL_DE_DEATH_DELTAS</span>
            </div>
            <div className="space-y-3 font-sans font-normal text-theme-text font-normal">
              {renderMarkdown(savedReview)}
            </div>
            
            {/* Encouraging coach monologues trigger */}
            {savedApproved === true && (
              <div className="mt-5 p-3.5 bg-theme-hover rounded-xl border border-theme-border flex items-start gap-3 shadow-inner">
                <Sparkles className="w-4 h-4 text-theme-accent-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[11px] font-display font-bold text-theme-text">Coach's Certification Note:</p>
                  <p className="text-[10px] text-theme-muted font-normal leading-relaxed">
                    Splendid execution, champ! Tick this day's unit to-do checkbox list elements, take a mental micro-break, and prepare to compound this knowledge tomorrow. You're building robust data structures already!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
