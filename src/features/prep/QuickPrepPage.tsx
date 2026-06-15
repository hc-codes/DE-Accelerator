import React, { useState } from "react";
import { Briefcase, Building, Code2, PlayCircle, Loader2 } from "lucide-react";

export function QuickPrepPage() {
  const [jd, setJd] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [yoe, setYoe] = useState("");
  const [focusAreas, setFocusAreas] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [activeMode, setActiveMode] = useState<"setup" | "knowledge" | "learning">("setup");

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/prep/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, company, role, yoe, focusAreas })
      });
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        alert("Error analyzing JD: " + (data.error || "Unknown error"));
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to connect to the server: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (activeMode === "knowledge") {
    return <KnowledgeCheckMode analysisResult={analysisResult} onBack={() => setActiveMode("setup")} />;
  }

  if (activeMode === "learning") {
    return <LearningMode analysisResult={analysisResult} onBack={() => setActiveMode("setup")} />;
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-black text-theme-text flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-theme-accent-primary" />
            Quick Interview Prep
          </h1>
          <p className="text-theme-muted font-sans text-sm">
            Configure your target role and let the AI generate a personalized learning roadmap and knowledge check profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-theme-card border border-theme-border rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold font-mono text-theme-accent-secondary uppercase tracking-widest border-b border-theme-border/50 pb-2">
              Target Profile
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-theme-muted mb-1.5 uppercase font-mono">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-theme-muted" />
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Stripe" className="w-full bg-theme-bg border border-theme-border rounded-lg pl-9 pr-3 py-2 text-sm text-theme-text focus:border-theme-accent-primary focus:ring-1 focus:ring-theme-accent-primary transition-all outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-theme-muted mb-1.5 uppercase font-mono">Target Role</label>
                <div className="relative">
                  <Code2 className="absolute left-3 top-2.5 w-4 h-4 text-theme-muted" />
                  <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Software Engineer" className="w-full bg-theme-bg border border-theme-border rounded-lg pl-9 pr-3 py-2 text-sm text-theme-text focus:border-theme-accent-primary focus:ring-1 focus:ring-theme-accent-primary transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-muted mb-1.5 uppercase font-mono">Years of Experience</label>
                <input type="number" value={yoe} onChange={e => setYoe(e.target.value)} placeholder="e.g. 5" className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2 text-sm text-theme-text focus:border-theme-accent-primary focus:ring-1 focus:ring-theme-accent-primary transition-all outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-muted mb-1.5 uppercase font-mono">Focus Areas (Optional)</label>
                <input type="text" value={focusAreas} onChange={e => setFocusAreas(e.target.value)} placeholder="e.g. System Design, React" className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2 text-sm text-theme-text focus:border-theme-accent-primary focus:ring-1 focus:ring-theme-accent-primary transition-all outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-theme-card border border-theme-border rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold font-mono text-theme-accent-secondary uppercase tracking-widest border-b border-theme-border/50 pb-2">
              Job Description
            </h2>
            <textarea 
              value={jd} 
              onChange={e => setJd(e.target.value)} 
              placeholder="Paste the full job description here..." 
              className="w-full h-[260px] bg-theme-bg border border-theme-border rounded-xl p-3 text-sm text-theme-text focus:border-theme-accent-primary focus:ring-1 focus:ring-theme-accent-primary transition-all outline-none resize-none font-sans"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !jd}
            className="bg-theme-accent-primary hover:bg-theme-accent-primary/90 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-w-[200px]"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Profile...</>
            ) : (
              <><PlayCircle className="w-5 h-5" /> Generate Prep Roadmap</>
            )}
          </button>
        </div>

        {analysisResult && (
          <div className="bg-theme-card border border-theme-border rounded-2xl p-6 space-y-6 mt-8 animate-fade-in">
            <div className="border-b border-theme-border/50 pb-4">
              <h3 className="text-xl font-bold text-theme-text font-display">Target Skills Analysis</h3>
              <p className="text-theme-muted text-sm mt-1">Based on the JD, Company, and Role</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase">Must Have Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.mustHave.map((skill: string, i: number) => (
                    <span key={i} className="bg-theme-bg border border-emerald-500/30 text-theme-text px-2 py-1 flex items-center gap-1.5 rounded text-xs"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"/>{skill}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">Good To Have</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.goodToHave.map((skill: string, i: number) => (
                    <span key={i} className="bg-theme-bg border border-amber-500/30 text-theme-text px-2 py-1 flex items-center gap-1.5 rounded text-xs"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"/>{skill}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-purple-400 uppercase">Bonus Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.bonus.map((skill: string, i: number) => (
                    <span key={i} className="bg-theme-bg border border-purple-500/30 text-theme-text px-2 py-1 flex items-center gap-1.5 rounded text-xs"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"/>{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 py-6">
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg font-bold text-theme-text">Interview Difficulty Estimate</h4>
                <p className="text-theme-accent-primary font-mono font-bold text-xl mt-1">{analysisResult.difficulty}</p>
                <p className="text-theme-muted text-xs mt-1">{analysisResult.difficultyReason}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button onClick={() => setActiveMode("knowledge")} className="bg-theme-bg border border-theme-border hover:border-theme-accent-primary/50 hover:bg-theme-card p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 transition-colors group cursor-pointer">
                <div className="w-12 h-12 bg-theme-accent-primary/10 text-theme-accent-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-theme-text text-lg">Mode 1: Knowledge Check</h4>
                  <p className="text-xs text-theme-muted mt-1">Dynamic, continuous interview simulation. Answers are scored to build your competency matrix.</p>
                </div>
              </button>

              <button onClick={() => setActiveMode("learning")} className="bg-theme-bg border border-theme-border hover:border-theme-accent-secondary/50 hover:bg-theme-card p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 transition-colors group cursor-pointer">
                <div className="w-12 h-12 bg-theme-accent-secondary/10 text-theme-accent-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-theme-text text-lg">Mode 2: Learning Mode</h4>
                  <p className="text-xs text-theme-muted mt-1">Deep-dive concepts, architectures, and real-world examples for your target skills.</p>
                </div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ----------------------------------------------------
// knowledge Mode Component
// ----------------------------------------------------
import { ArrowLeft, Send, CheckCircle2, AlertCircle, XCircle, ListTodo, MessageSquare } from "lucide-react";

function KnowledgeCheckMode({ analysisResult, onBack }: { analysisResult: any, onBack: () => void }) {
  const [interviewMode, setInterviewMode] = useState<"mcq" | "coding" | "short" | null>(null);

  if (!interviewMode) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-theme-bg p-8 animate-fade-in relative w-full">
        <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-theme-card border border-theme-border hover:bg-theme-bg rounded-lg text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="max-w-2xl w-full text-center space-y-6">
          <h2 className="text-3xl font-display font-black text-theme-text">Select Interview Format</h2>
          <p className="text-theme-muted">Choose how you'd like to be assessed for the {analysisResult.role} role.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <button onClick={() => setInterviewMode("mcq")} className="bg-theme-card border border-theme-border hover:border-theme-accent-primary/50 hover:bg-theme-bg p-6 rounded-xl flex flex-col items-center gap-3 transition-all cursor-pointer">
               <ListTodo className="w-8 h-8 text-emerald-400" />
               <h3 className="font-bold text-theme-text">Multiple Choice</h3>
               <p className="text-xs text-theme-muted">Quick 4-option questions</p>
            </button>
            <button onClick={() => setInterviewMode("short")} className="bg-theme-card border border-theme-border hover:border-theme-accent-primary/50 hover:bg-theme-bg p-6 rounded-xl flex flex-col items-center gap-3 transition-all cursor-pointer">
               <MessageSquare className="w-8 h-8 text-amber-400" />
               <h3 className="font-bold text-theme-text">Short Answer</h3>
               <p className="text-xs text-theme-muted">Conversational Q&A style</p>
            </button>
            <button onClick={() => setInterviewMode("coding")} className="bg-theme-card border border-theme-border hover:border-theme-accent-primary/50 hover:bg-theme-bg p-6 rounded-xl flex flex-col items-center gap-3 transition-all cursor-pointer">
               <Code2 className="w-8 h-8 text-purple-400" />
               <h3 className="font-bold text-theme-text">Coding & Design</h3>
               <p className="text-xs text-theme-muted">Technical implementation</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ActiveInterviewMode analysisResult={analysisResult} onBack={() => setInterviewMode(null)} mode={interviewMode} />;
}

function ActiveInterviewMode({ analysisResult, onBack, mode }: { analysisResult: any, onBack: () => void, mode: "mcq" | "coding" | "short" }) {
  const [messages, setMessages] = useState<{role: "assistant" | "user", content: string, evaluation?: any}[]>([{
    role: "assistant",
    content: `Welcome to your mock interview for the ${analysisResult.role} position at ${analysisResult.company}. I will be assessing your knowledge across various dimensions. We will keep going until you decide to stop. Are you ready for the first question?`
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [competencyMatrix, setCompetencyMatrix] = useState<Record<string, number>>({});

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/prep/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisResult,
          history: messages.concat(userMessage),
          currentCompetency: competencyMatrix,
          mode
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.nextQuestion,
          evaluation: data.evaluation
        }]);
        if (data.updatedCompetency) {
          setCompetencyMatrix(data.updatedCompetency);
        }
      } else {
        alert("Error: " + data.error);
        setMessages(prev => prev.slice(0, -1)); // rollback
      }
    } catch(e: any) {
      console.error(e);
      alert("Failed to connect: " + e.message);
      setMessages(prev => prev.slice(0, -1)); // rollback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-theme-bg animate-fade-in relative overflow-hidden">
      <div className="border-b border-theme-border/60 bg-theme-card px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-theme-bg rounded-lg text-theme-muted hover:text-theme-text transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-theme-text font-display">Knowledge Check Interview</h2>
            <p className="text-xs text-theme-muted font-mono">{analysisResult.company} - {analysisResult.role}</p>
          </div>
        </div>
        <div className="flex bg-theme-bg border border-theme-border px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-theme-accent-primary gap-2 items-center">
           <PlayCircle className="w-3.5 h-3.5" /> Live Session
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Chat / Interview Area */}
        <div className="flex-1 flex flex-col bg-theme-bg overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin pb-32">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-full`}>
                
                {msg.role === "assistant" && msg.evaluation && (
                   <div className="w-full max-w-3xl bg-theme-card border border-theme-border p-4 rounded-xl mb-4 font-sans text-sm space-y-3">
                     <div className="flex items-center justify-between border-b border-theme-border/50 pb-2">
                       <span className="font-bold text-theme-text flex items-center gap-2">
                         {msg.evaluation.score >= 8 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : 
                          msg.evaluation.score >= 5 ? <AlertCircle className="w-4 h-4 text-amber-400" /> :
                          <XCircle className="w-4 h-4 text-red-400" />}
                         Evaluation
                       </span>
                       <span className="font-mono text-xl font-black text-theme-accent-primary">{msg.evaluation.score}/10</span>
                     </div>
                     <p className="text-theme-text"><span className="font-bold">Feedback:</span> {msg.evaluation.feedback}</p>
                     <p className="text-theme-text"><span className="font-bold text-emerald-400">Ideal Answer Overview:</span> {msg.evaluation.idealAnswer}</p>
                     {msg.evaluation.gaps && msg.evaluation.gaps.length > 0 && (
                       <div className="pt-1">
                         <span className="font-bold text-amber-400 text-xs uppercase font-mono tracking-wider block mb-1">Identified Gaps:</span>
                         <ul className="list-disc pl-4 text-theme-muted space-y-0.5 text-xs">
                           {msg.evaluation.gaps.map((gap: string, i: number) => <li key={i}>{gap}</li>)}
                         </ul>
                       </div>
                     )}
                   </div>
                )}

                <div className={`p-4 rounded-2xl max-w-3xl text-sm ${msg.role === "user" ? "bg-theme-accent-primary text-slate-950 font-medium" : "bg-theme-card border border-theme-border text-theme-text"}`}>
                  {msg.role === "assistant" && (
                    <div className="font-bold text-xs uppercase tracking-wider mb-2 opacity-50 font-mono flex items-center gap-2">
                       <span className="w-5 h-5 rounded-full bg-theme-border flex items-center justify-center">Q</span> Question {(idx / 2) + 1}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start max-w-3xl">
                <div className="p-4 rounded-2xl bg-theme-card border border-theme-border text-theme-text flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-theme-accent-primary rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-theme-accent-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-theme-accent-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-theme-bg to-transparent">
             <div className="max-w-4xl mx-auto flex gap-2 relative">
               <textarea 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type your answer... (Press Enter to send)"
                  className="flex-1 bg-theme-card border border-theme-border rounded-xl pl-4 pr-12 py-3.5 h-[56px] min-h-[56px] max-h-[120px] text-sm text-theme-text focus:border-theme-accent-primary focus:ring-1 focus:ring-theme-accent-primary transition-all outline-none resize-y"
               />
               <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-theme-accent-primary text-slate-950 rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
               >
                 <Send className="w-4 h-4" />
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Learning Mode Component
// ----------------------------------------------------
import { BookOpen } from "lucide-react";

function LearningMode({ analysisResult, onBack }: { analysisResult: any, onBack: () => void }) {
  const allSkills = [...analysisResult.mustHave, ...analysisResult.goodToHave, ...analysisResult.bonus];
  const [selectedSkill, setSelectedSkill] = useState(allSkills[0]);
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContent = async (skill: string) => {
    setIsLoading(true);
    setContent(null);
    try {
      const response = await fetch("/api/prep/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill,
          role: analysisResult.role,
        })
      });
      const data = await response.json();
      if (data.success) {
        setContent(data.content);
      } else {
        alert("Error: " + data.error);
      }
    } catch(e: any) {
      console.error(e);
      alert("Failed to connect: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch when selectedSkill changes
  React.useEffect(() => {
    if (selectedSkill) fetchContent(selectedSkill);
  }, [selectedSkill]);

  return (
    <div className="h-full flex flex-col bg-theme-bg animate-fade-in">
      <div className="border-b border-theme-border/60 bg-theme-card px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-theme-bg rounded-lg text-theme-muted hover:text-theme-text transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-theme-text font-display">Deep Learning Mode</h2>
            <p className="text-xs text-theme-muted font-mono">{analysisResult.role} Skill Roadmap</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-64 bg-theme-card border-r border-theme-border flex flex-col shrink-0 overflow-y-auto">
           <div className="p-3">
             <h3 className="text-[10px] uppercase font-mono font-bold text-theme-muted tracking-wider mb-2 px-2">Identified Skills</h3>
             <div className="space-y-1">
               {allSkills.map((s, i) => (
                 <button 
                   key={i} 
                   onClick={() => setSelectedSkill(s)} 
                   className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSkill === s ? "bg-theme-accent-primary/10 text-theme-accent-primary" : "text-theme-muted hover:bg-theme-bg hover:text-theme-text"}`}
                 >
                   {s}
                 </button>
               ))}
             </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {isLoading && (
             <div className="absolute inset-0 z-10 flex items-center justify-center bg-theme-bg/50 backdrop-blur-sm">
               <div className="flex flex-col items-center gap-3">
                 <Loader2 className="w-8 h-8 animate-spin text-theme-accent-primary" />
                 <p className="text-sm font-mono text-theme-muted tracking-widest font-bold">GENERATING CURRICULUM</p>
               </div>
             </div>
           )}

           {content && (
             <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
                <div>
                  <h1 className="text-3xl font-display font-black text-theme-text mb-2">{selectedSkill}</h1>
                  <p className="text-theme-muted">Senior-level exploration and knowledge mapping.</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-theme-card border border-theme-border p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
                    <h3 className="text-xs uppercase font-mono font-bold text-emerald-400 mb-2 tracking-widest">Beginner Concept</h3>
                    <p className="text-theme-text text-sm leading-relaxed">{content.beginnerExplanation}</p>
                  </div>

                  <div className="bg-theme-card border border-theme-border p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                    <h3 className="text-xs uppercase font-mono font-bold text-amber-400 mb-2 tracking-widest">Intermediate Context</h3>
                    <p className="text-theme-text text-sm leading-relaxed">{content.intermediateExplanation}</p>
                  </div>

                  <div className="bg-theme-card border border-theme-border p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-theme-accent-primary" />
                    <h3 className="text-xs uppercase font-mono font-bold text-theme-accent-primary mb-2 tracking-widest">Senior / Architect Deep Dive</h3>
                    <p className="text-theme-text text-sm leading-relaxed">{content.seniorExplanation}</p>
                  </div>

                  <div className="bg-theme-card border border-theme-border p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-theme-text border-b border-theme-border pb-2 mb-4">Practical Scenarios & Trade-offs</h3>
                    <div className="space-y-4">
                      {content.practicalScenarios.map((sc: any, i: number) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-6 h-6 rounded bg-theme-bg shrink-0 flex items-center justify-center text-xs font-mono font-bold text-theme-accent-secondary border border-theme-border">{i+1}</div>
                          <div>
                            <p className="font-bold text-sm text-theme-text">{sc.scenario}</p>
                            <p className="text-xs text-theme-muted mt-1 leading-relaxed"><span className="font-bold text-amber-500">Trade-offs:</span> {sc.tradeoff}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-theme-bg border border-theme-border p-5 rounded-2xl">
                       <h3 className="text-xs uppercase font-mono font-bold text-theme-muted tracking-widest mb-3">Common Interview Questions</h3>
                       <ul className="space-y-2 text-sm text-theme-text">
                         {content.commonQuestions.map((q: string, i: number) => (
                           <li key={i} className="flex gap-2 items-start"><span className="text-theme-accent-primary">•</span>{q}</li>
                         ))}
                       </ul>
                     </div>
                     <div className="bg-[#1A1A1A] border border-[#333] p-5 rounded-2xl">
                       <h3 className="text-xs uppercase font-mono font-bold text-red-400 tracking-widest mb-3">Advanced / Core Internals</h3>
                       <ul className="space-y-2 text-sm text-slate-300">
                         {content.advancedQuestions.map((q: string, i: number) => (
                           <li key={i} className="flex gap-2 items-start"><span className="text-red-500">•</span>{q}</li>
                         ))}
                       </ul>
                     </div>
                  </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

