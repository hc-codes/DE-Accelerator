import React from "react";
import { ArrowRight, ToggleLeft, Layers, Terminal, Zap } from "lucide-react";
import { CurriculumDay } from "../data/curriculum";

interface ConceptBridgeProps {
  day: CurriculumDay;
}

export function ConceptBridgeCard({ day }: ConceptBridgeProps) {
  return (
    <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:border-theme-border/85 animate-fade-in">
      {/* Card Header Branding */}
      <div className="bg-theme-hover border-b border-theme-border px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-theme-accent-primary/10 text-theme-accent-primary">
            <ToggleLeft className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-theme-text text-sm tracking-wide uppercase">
              Informatica-To-Code Bridge
            </h4>
            <p className="text-theme-muted text-xs">Transforming your visual foundation into programmatic power</p>
          </div>
        </div>
        <div className="bg-theme-accent-primary/10 text-theme-accent-primary px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border border-theme-accent-primary/10">
          Mapped Concept
        </div>
      </div>

      <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
        {/* Informatica Visual Side */}
        <div className="lg:col-span-5 bg-theme-bg rounded-xl p-4 border border-theme-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-mono font-semibold text-theme-text uppercase tracking-widest">
              IDMC Visual Pipeline
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="bg-theme-card p-3 rounded-lg border border-theme-border flex flex-col gap-1.5 hover:border-theme-border/80 transition-all">
              <span className="font-semibold text-theme-text text-xs tracking-wider uppercase">Informatica Element:</span>
              <span className="text-sm text-theme-accent-secondary font-mono bg-theme-accent-secondary/15 px-2 py-0.5 rounded border border-theme-accent-secondary/15 w-fit">
                {day.informaticaConcept}
              </span>
            </div>
            <div className="bg-theme-card p-3 rounded-lg border border-theme-border text-xs text-theme-muted leading-relaxed">
              Mapped columns are piped through UI nodes. Group, join, or filter rules are written as dialog property values in specialized properties boxes.
            </div>
          </div>
          
          {/* Visual Port Simulation Mock */}
          <div className="mt-4 border border-theme-border rounded-lg p-2.5 bg-theme-bg space-y-1.5 text-[11px] font-mono">
            <div className="text-theme-muted text-[10px] uppercase tracking-wider font-semibold border-b border-theme-border pb-1 mb-1">
              Transformation Port Configurations
            </div>
            <div className="flex justify-between items-center bg-theme-card px-2 py-1 rounded">
              <span className="text-theme-text">📥 i_customer_id (Input)</span>
              <span className="text-theme-muted">BigInt</span>
            </div>
            <div className="flex justify-between items-center bg-theme-card px-2 py-1 rounded">
              <span className="text-theme-text">📥 i_annual_spend (Input)</span>
              <span className="text-theme-muted">Decimal</span>
            </div>
            <div className="flex justify-between items-center bg-theme-hover px-2 py-1 rounded border border-theme-border">
              <span className="text-theme-accent-primary font-medium">📤 o_{day.bridgeTitle.replace(/\s+/g, '_').toLowerCase()} (Output)</span>
              <span className="text-theme-accent-primary">Dynamic</span>
            </div>
          </div>
        </div>

        {/* The Connector arrow */}
        <div className="col-span-1 flex justify-center lg:flex-col items-center gap-2">
          <div className="h-0.5 w-6 lg:h-12 lg:w-0.5 bg-gradient-to-b from-rose-500/30 to-teal-500/30" />
          <div className="p-2 bg-theme-bg border border-theme-border rounded-full text-theme-accent-primary transform scale-110 shadow-sm">
            <ArrowRight className="w-4 h-4 lg:rotate-0" />
          </div>
          <div className="h-0.5 w-6 lg:h-12 lg:w-0.5 bg-gradient-to-b from-indigo-500/30 to-teal-500/30" />
        </div>

        {/* Written Code Side */}
        <div className="lg:col-span-5 bg-theme-bg rounded-xl p-4 border border-theme-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-theme-accent-primary animate-pulse" />
            <span className="text-xs font-mono font-semibold text-theme-text uppercase tracking-widest">
              Modern Pipeline Code
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="bg-theme-card p-3 rounded-lg border border-theme-border flex flex-col gap-1.5 hover:border-theme-border/80 transition-all">
              <span className="font-semibold text-theme-text text-xs tracking-wider uppercase">Code Counterpart:</span>
              <span className="text-sm text-theme-accent-primary font-mono bg-theme-accent-primary/15 px-2 py-0.5 rounded border border-theme-accent-primary/15 w-fit">
                {day.modernEquivalent}
              </span>
            </div>
            <div className="bg-theme-card p-3 rounded-lg border border-theme-border text-xs text-theme-muted leading-relaxed">
              No UI layers. Code statements run directly at the database or framework level, dramatically boosting optimization options, speed, and Git versioning ease.
            </div>
          </div>

          {/* Interactive Code translation mock */}
          <div className="mt-4 border border-theme-border rounded-lg p-2.5 bg-theme-bg space-y-1.5 text-[11px] font-mono text-theme-text">
            <div className="text-theme-muted text-[10px] uppercase tracking-wider font-semibold border-b border-theme-border pb-1 mb-1">
              Written Statement Output (Example)
            </div>
            {day.riddleLanguage === 'sql' ? (
              <div className="space-y-1 text-theme-accent-primary/95">
                <p><span className="text-theme-accent-secondary">SELECT</span> customer_id, spend</p>
                <p><span className="text-theme-accent-secondary">FROM</span> main_analytics_table</p>
                <p><span className="text-theme-accent-secondary">WHERE</span> spend &gt; <span className="text-theme-success">5000</span>;</p>
              </div>
            ) : day.riddleLanguage === 'python' ? (
              <div className="space-y-1 text-theme-accent-primary/95">
                <p><span className="text-theme-accent-secondary">import</span> pandas <span className="text-theme-accent-secondary">as</span> pd</p>
                <p>df = pd.read_csv(<span className="text-theme-accent-secondary">"data.csv"</span>)</p>
                <p>clean_df = df[df[<span className="text-theme-accent-secondary">"spend"</span>] &gt; <span className="text-theme-success">5000</span>]</p>
              </div>
            ) : (
              <div className="text-theme-muted italic">
                Translating architectural mappings to systems verbal delivery narratives.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Box */}
      <div className="px-5 py-4 bg-theme-hover border-t border-theme-border text-xs text-theme-text leading-relaxed flex items-start gap-2.5">
        <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-theme-text font-semibold">Strategic Mapping Guide:</strong> {day.bridgeDetails || "Translating your enterprise data warehousing foundation into high-paying modern systems code."}
        </div>
      </div>
    </div>
  );
}
