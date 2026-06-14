import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, RotateCcw, 
  Award, Sparkles, XCircle, Info, BrainCircuit, Play 
} from "lucide-react";
import { getAssessmentForDay, AssessmentQuestion } from "../data/assessments";

interface KnowledgeCheckProps {
  dayId: string;
  focusTitle: string;
  onAssessmentCompleted?: (score: number) => void;
}

export function KnowledgeCheckPortal({ dayId, focusTitle, onAssessmentCompleted }: KnowledgeCheckProps) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState<{ [qIndex: number]: boolean }>({});
  const [score, setScore] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);

  // Load new questions when day changes
  useEffect(() => {
    const dayQuestions = getAssessmentForDay(dayId);
    setQuestions(dayQuestions);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowExplanation({});
    setScore(0);
  }, [dayId]);

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: optionIndex
    }));
  };

  const handleToggleExplanation = (qIndex: number) => {
    setShowExplanation(prev => ({
      ...prev,
      [qIndex]: !prev[qIndex]
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowExplanation({});
    setScore(0);
  };

  const handleSubmit = () => {
    let currentScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);

    if (onAssessmentCompleted) {
      onAssessmentCompleted(currentScore);
    }
  };

  const totalQuestions = questions.length;
  const isAllAnswered = Object.keys(selectedAnswers).length === totalQuestions;
  const passed = score >= 2; // Pass criteria (2 out of 3 or higher)

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden shadow-sm transition-all duration-300">
      {/* Portal Header */}
      <div className="bg-theme-hover border-b border-theme-border px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/10 shrink-0">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-display font-bold text-theme-text text-sm tracking-wide uppercase flex items-center gap-1.5">
              Knowledge Validation Engine 
              <span className="text-[10px] bg-theme-bg text-theme-accent-primary font-mono border border-theme-border px-1.5 py-0.5 rounded uppercase">
                Interactive Check
              </span>
            </h4>
            <p className="text-theme-muted text-xs mt-0.5">3-Question elite training module for {focusTitle}</p>
          </div>
        </div>

        {/* Action Toggle Button */}
        <button
          id="btn-unlock-knowledge"
          onClick={() => setShowAssessment(!showAssessment)}
          className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer border-0 ${
            showAssessment 
              ? "bg-theme-bg text-theme-muted border border-theme-border hover:bg-theme-hover" 
              : "bg-theme-accent-primary hover:opacity-95 text-theme-inverse shadow-sm"
          }`}
        >
          <span>{showAssessment ? "🙈 Hide Active Quiz" : "🧠 Unlock Daily Knowledge Check"}</span>
        </button>
      </div>

      {showAssessment && (
        <div className="p-5 md:p-6 space-y-6 bg-theme-bg animate-fade-in">
          {/* Main Assessment List */}
          <div className="space-y-6">
            {questions.map((q, qIdx) => {
              const selectedIdx = selectedAnswers[qIdx];
              const isCorrect = selectedIdx === q.correctIndex;
              const hasExp = !!showExplanation[qIdx];

              return (
                <div 
                  key={q.id} 
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isSubmitted 
                      ? isCorrect 
                        ? "bg-theme-success/5 border-theme-success/20" 
                        : "bg-rose-500/5 border-rose-500/10"
                      : "bg-theme-card border border-theme-border hover:border-theme-border/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Circle Indicator Index */}
                    <div className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSubmitted 
                        ? isCorrect 
                          ? "bg-theme-success/10 text-theme-success border border-theme-success/20" 
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-theme-hover text-theme-muted"
                    }`}>
                      {qIdx + 1}
                    </div>

                    <div className="flex-1 space-y-3.5">
                      <h5 className="font-display font-bold text-theme-text text-sm leading-snug">
                        {q.question}
                      </h5>

                      {/* Options List */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {q.options.map((option, optIdx) => {
                          const isOptionSelected = selectedIdx === optIdx;
                          const showCorrectTag = isSubmitted && optIdx === q.correctIndex;
                          const showWrongTag = isSubmitted && isOptionSelected && !isCorrect;

                          return (
                            <button
                              key={optIdx}
                              disabled={isSubmitted}
                              onClick={() => handleSelectAnswer(qIdx, optIdx)}
                              className={`w-full p-3 rounded-lg text-left text-xs leading-relaxed transition-all flex items-start gap-2.5 border-0 ${
                                isOptionSelected
                                  ? isSubmitted
                                    ? isCorrect
                                      ? "bg-theme-success/20 border border-theme-success text-theme-success font-medium"
                                      : "bg-rose-500/20 border border-rose-500 text-rose-400 font-medium"
                                    : "bg-theme-accent-primary/20 border border-theme-accent-primary text-theme-text font-medium"
                                  : showCorrectTag
                                    ? "bg-theme-success/10 border border-theme-success/60 text-theme-success font-medium animate-pulse"
                                    : "bg-theme-bg border border-theme-border hover:bg-theme-hover text-theme-muted hover:text-theme-text"
                              }`}
                            >
                              <span className="font-mono uppercase text-[10px] text-theme-muted bg-theme-hover border border-theme-border px-1.5 py-0.2 rounded shrink-0 block mt-0.5">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="flex-1">{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanations & feedback */}
                      {isSubmitted && (
                        <div className="mt-3 flex flex-col gap-2">
                          <button
                            onClick={() => handleToggleToggleExplanation(qIdx)}
                            className="bg-transparent border-0 p-0 text-theme-muted hover:text-theme-accent-primary text-[11px] font-mono flex items-center gap-1.5 cursor-pointer w-fit"
                          >
                            <Info className="w-3.5 h-3.5" /> 
                            <span>{hasExp ? "Hide logic manual" : "Explain Coach's theory answer key"}</span>
                          </button>
                          
                          {hasExp && (
                            <div className="p-3 bg-theme-card rounded-lg border border-theme-border text-[11px] text-theme-muted leading-relaxed font-sans mt-0.5 animate-fade-in">
                              <span className="font-bold text-theme-accent-primary uppercase tracking-widest text-[9px] font-mono block mb-1">
                                Concept Commentary:
                              </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

              function handleToggleToggleExplanation(idx: number) {
                setShowExplanation(prev => ({
                  ...prev,
                  [idx]: !prev[idx]
                }));
              }
            })}
          </div>

          {/* Verification Actions Area */}
          <div className="border-t border-theme-border pt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {!isSubmitted ? (
                <p className="text-xs text-theme-muted font-mono italic">
                  *Answer all 3 questions to unlock evaluation diagnostics.
                </p>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl border text-center font-display font-extrabold text-sm ${
                    passed 
                      ? "bg-theme-success/10 border-theme-success/20 text-theme-success" 
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    Score: {score} / 3
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-xs text-theme-text">
                      {passed ? "🎉 Validation Unit Clear!" : "⏳ Revision Preferred"}
                    </h5>
                    <p className="text-[10px] text-theme-muted">
                      {passed ? "Athila, your technical base maps are excellent!" : "Analyze logic feedback and re-test tomorrow."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isSubmitted && (
                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded-lg bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-test
                </button>
              )}

              {!isSubmitted && (
                <button
                  onClick={handleSubmit}
                  disabled={!isAllAnswered}
                  className="px-4 py-2 rounded-lg bg-theme-accent-primary hover:opacity-90 text-theme-inverse text-xs font-bold uppercase tracking-wider disabled:opacity-40 flex items-center gap-1.5 transition-all cursor-pointer select-none border-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Validate Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
