import React, { useState, useRef, useEffect } from "react";
import { Send, User, ChevronUp, ChevronDown, RefreshCw, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { CurriculumDay } from "../data/curriculum";

export interface ChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
}

interface ChatProps {
  currentDay: CurriculumDay;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isChatLoading: boolean;
  onClearChat: () => void;
  onClose?: () => void;
}

export function InteractiveCoachChat({ 
  currentDay, messages, onSendMessage, isChatLoading, onClearChat, onClose 
}: ChatProps) {
  const [inputText, setInputText] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Strategic Prompt Starters customized for our transitioning user
  const starters = [
    { label: "Explain dbt models in relation to IDMC Mappings", text: "How does dbt (data build tool) compare structurally to Informatica Intelligent Cloud Services (IICS) mappings? How are target operations managed?" },
    { label: "Window Function variables trick mapping details", text: "In Informatica I used expression ports v_last_id to compare records historical updates. Explain how over() partitions lag/lead can replace this in advanced queries." },
    { label: "Star schemas modeling inside modern lake houses", text: "What's the best strategy to model star schemas fact tables in cloud-native systems (BigQuery/Snowflake) compared to normal Oracle databases?" },
    { label: "Pitching my 4-year Informatica resume to managers", text: "Help me write an elevator pitch for hiring managers that positions my 4 years of Informatica design experience as a strong asset for code-heavy DE positions." }
  ];

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden shadow-sm flex flex-col h-[520px] lg:h-full animate-fade-in">
      {/* Messenger Header */}
      <div className="bg-theme-hover border-b border-theme-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center font-display font-semibold text-theme-inverse text-xs">
              M
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-theme-success border border-theme-card" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-display font-bold text-theme-text text-xs uppercase tracking-wide">Elite DE Coach</h4>
              <Sparkles className="w-3 h-3 text-theme-accent-primary" />
            </div>
            <p className="text-[10px] text-theme-accent-primary font-mono">Real-Time Guidance Active</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            title="Clear chat log"
            className="text-theme-muted hover:text-theme-text p-1.5 rounded hover:bg-theme-hover transition-colors text-[10px] font-mono flex items-center gap-1 cursor-pointer bg-transparent border-0"
          >
            <RefreshCw className="w-3 h-3" /> Clear History
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              title="Close chat"
              className="text-theme-muted hover:text-theme-text p-1 rounded hover:bg-theme-hover transition-colors cursor-pointer bg-transparent border-0"
            >
              <span className="text-sm font-bold font-mono">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Panel Screen */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-theme-bg">
        {messages.length === 0 ? (
          <div className="space-y-4 py-4">
            <div className="bg-theme-card border border-theme-border rounded-xl p-4 text-center">
              <MessageSquare className="w-6 h-6 text-theme-accent-primary mx-auto mb-2" />
              <h5 className="font-display font-bold text-theme-text text-xs mb-1">Direct Chat with your Mentor</h5>
              <p className="text-[11px] text-theme-muted max-w-xs mx-auto leading-relaxed">
                Connect directly with your transition career coach! Ask anything about SQL, Python scripting, resume optimization, or interview strategies.
              </p>
            </div>

            {/* In-chat prompt selectors */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-theme-muted px-1">
                Select a tactical discussion starter:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {starters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(starter.text);
                    }}
                    className="p-2.5 rounded-lg border border-theme-border bg-theme-hover hover:bg-theme-card text-left text-[11px] text-theme-text hover:text-theme-accent-primary transition-all outline-none leading-relaxed hover:border-theme-border/80 cursor-pointer flex items-start gap-1.5"
                  >
                    <span className="text-theme-accent-primary font-mono mt-0.5">🔹</span>
                    <span>{starter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isCoach = msg.sender === "coach";
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isCoach ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-semibold text-[10px] uppercase font-mono ${
                  isCoach 
                    ? "bg-theme-hover text-theme-text border border-theme-border" 
                    : "bg-theme-accent-primary/10 text-theme-accent-primary border border-theme-accent-primary/20"
                }`}>
                  {isCoach ? "DE" : "ME"}
                </div>

                {/* Message Speech bubble */}
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isCoach 
                      ? "bg-theme-hover text-theme-text border border-theme-border rounded-tl-none font-normal" 
                      : "bg-theme-accent-primary text-theme-inverse rounded-tr-none font-medium shadow-sm"
                  }`}>
                    {/* Render message formatting inline */}
                    <div className="whitespace-pre-wrap">
                      {msg.text.split("\n").map((line, i) => {
                        // support basic markdown list
                        if (line.trim().startsWith("- ")) {
                          return <li key={i} className="list-disc ml-3.5 my-1 text-[11px] text-theme-text">{line.replace("- ", "")}</li>;
                        }
                        if (line.trim().startsWith("🔹") || line.trim().startsWith("💡")) {
                          return <p key={i} className="my-1.5 font-medium text-theme-accent-primary">{line}</p>;
                        }
                        return <p key={i} className="mb-1.5 last:mb-0">{line}</p>;
                      })}
                    </div>
                  </div>
                  <p className="text-[9px] font-mono text-theme-muted text-right px-1 select-none">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Coach is Typing Loader */}
        {isChatLoading && (
          <div className="flex gap-3 mr-auto max-w-[85%] items-start animate-pulse">
            <div className="w-7 h-7 rounded-full bg-theme-hover text-theme-text border border-theme-border flex items-center justify-center font-semibold text-[10px] font-mono">
              DE
            </div>
            <div className="bg-theme-card border border-theme-border text-theme-muted p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-theme-accent-primary" />
              <span>Coach is formulating bridge analytics...</span>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Inputs Area */}
      <div className="p-3 bg-theme-hover border-t border-theme-border flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isChatLoading}
          placeholder="Ask your coach any question..."
          className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2 text-xs text-theme-text placeholder-theme-muted focus:outline-none focus:border-theme-accent-primary/80 focus:ring-1 focus:ring-theme-accent-primary/80 transition-all font-sans"
        />
        <button
          onClick={handleSend}
          disabled={isChatLoading || !inputText.trim()}
          className="p-2 rounded-xl bg-theme-accent-primary hover:opacity-90 text-theme-inverse disabled:opacity-40 transition-all shadow-sm flex items-center justify-center shrink-0 w-8.5 h-8.5 cursor-pointer border-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
