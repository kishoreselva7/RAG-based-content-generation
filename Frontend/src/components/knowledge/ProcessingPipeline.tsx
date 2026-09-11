import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Circle, Sparkles, FileText, ArrowRight } from 'lucide-react';

interface ProcessingPipelineProps {
  fileName: string;
  onComplete: () => void;
}

const PIPELINE_STEPS = [
  'Document uploaded',
  'Extracting text & formatting',
  'Detecting course structure',
  'Identifying units & modules',
  'Identifying topics & sub-concepts',
  'Creating semantic knowledge chunks',
  'Generating vector embeddings',
  'Storing knowledge in graph base',
];

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ fileName, onComplete }) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  useEffect(() => {
    if (activeStepIndex < PIPELINE_STEPS.length) {
      const timer = setTimeout(() => {
        setActiveStepIndex((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeStepIndex, onComplete]);

  const progressPercentage = Math.round((activeStepIndex / PIPELINE_STEPS.length) * 100);

  return (
    <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Processing Knowledge Document</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{fileName}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-indigo-400">{progressPercentage}% Complete</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6 relative z-10">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Pipeline Step Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 mb-6">
        {PIPELINE_STEPS.map((step, idx) => {
          let isCompleted = idx < activeStepIndex;
          let isCurrent = idx === activeStepIndex;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all ${
                isCompleted
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : isCurrent
                  ? 'bg-indigo-950/50 border-indigo-700 text-indigo-200 font-semibold ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/20 border-slate-800/60 text-slate-500'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Clock className="w-4 h-4 text-indigo-400 shrink-0 animate-spin" />
              ) : (
                <Circle className="w-4 h-4 text-slate-700 shrink-0" />
              )}
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>

      {activeStepIndex >= PIPELINE_STEPS.length && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-200 relative z-10 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Document processed successfully into 124 knowledge chunks across 8 units!</span>
          </div>
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0"
          >
            <span>View Knowledge Base</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
