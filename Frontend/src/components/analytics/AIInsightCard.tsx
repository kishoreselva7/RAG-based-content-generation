import React from 'react';
import { AIInsight } from '../../types';
import { AlertTriangle, Wand2, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';

interface AIInsightCardProps {
  insight: AIInsight;
  onGenerateRemedial: (insight: AIInsight) => void;
  isGenerating?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onGenerateRemedial,
  isGenerating = false,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-900/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                Weak Topic Detected
              </span>
              <span className="text-xs font-mono text-slate-400">Avg: {insight.averageScore}%</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">{insight.topicName}</h3>
          </div>
        </div>

        <button
          onClick={() => onGenerateRemedial(insight)}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/30 shrink-0 disabled:opacity-50"
        >
          <Wand2 className="w-4 h-4 text-indigo-200" />
          <span>{isGenerating ? 'Generating...' : insight.remedialActionText}</span>
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10">{insight.summary}</p>

      {/* Struggling concepts */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 mb-4 relative z-10">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Key Student Struggles Identified</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {insight.struggles.map((str, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>{str}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Recommendation */}
      <div className="flex items-center justify-between text-xs text-indigo-200 relative z-10">
        <span>💡 AI Recommendation: {insight.recommendation}</span>
      </div>
    </div>
  );
};
