import React, { useState } from 'react';
import { ContentType, GenerationConfig } from '../../types';
import { Sparkles, X, Check, Clock, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: GenerationConfig) => Promise<void>;
  courseId: string;
  unitId?: string;
  topicId?: string;
  defaultContentType?: ContentType;
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  courseId,
  unitId,
  topicId,
  defaultContentType = 'lecture_notes',
}) => {
  const [contentType, setContentType] = useState<ContentType>(defaultContentType);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [objectives, setObjectives] = useState<string[]>([
    'Understand core formulas & derivations',
    'Apply concepts to practical dataset problems',
    'Evaluate model performance tradeoffs',
  ]);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([
    'Understand core formulas & derivations',
    'Apply concepts to practical dataset problems',
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genStage, setGenStage] = useState<number>(0);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenStage(1);

    // Stage 1 -> Stage 2
    setTimeout(() => {
      setGenStage(2);
    }, 900);

    // Stage 2 -> Stage 3
    setTimeout(() => {
      setGenStage(3);
    }, 1800);

    // Stage 3 -> Complete
    setTimeout(async () => {
      await onGenerate({
        courseId,
        unitId,
        topicId,
        contentType,
        difficulty,
        questionCount,
        learningObjectives: selectedObjectives,
      });
      setIsGenerating(false);
      setGenStage(0);
      onClose();
    }, 2600);
  };

  const toggleObjective = (obj: string) => {
    if (selectedObjectives.includes(obj)) {
      setSelectedObjectives(selectedObjectives.filter((o) => o !== obj));
    } else {
      setSelectedObjectives([...selectedObjectives, obj]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Generate AI Content</h3>
              <p className="text-[11px] text-slate-400">EduGen AI Workspace Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isGenerating ? (
          <div className="p-6 space-y-5">
            {/* Content Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Content Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'lecture_notes', label: 'Lecture Notes' },
                  { id: 'quiz', label: 'Quiz' },
                  { id: 'assignment', label: 'Assignment' },
                  { id: 'question_bank', label: 'Question Bank' },
                  { id: 'flashcards', label: 'Flashcards' },
                  { id: 'study_material', label: 'Study Material' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setContentType(type.id as ContentType)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-left ${
                      contentType === type.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      difficulty === diff
                        ? 'bg-slate-900 border-slate-900 text-white font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of questions if quiz/question_bank */}
            {(contentType === 'quiz' || contentType === 'question_bank') && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Number of Questions</span>
                  <span className="text-indigo-600 font-mono font-bold">{questionCount}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={5}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            )}

            {/* Learning Objectives */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Learning Objectives
              </label>
              <div className="space-y-2">
                {objectives.map((obj) => (
                  <label
                    key={obj}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedObjectives.includes(obj)}
                      onChange={() => toggleObjective(obj)}
                      className="accent-indigo-600 rounded"
                    />
                    <span>{obj}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartGeneration}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Generate Content</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live AI Processing Screen */
          <div className="p-8 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">EduGen AI is generating your content...</h4>
              <p className="text-xs text-slate-500 mt-1">Grounding generation in uploaded course knowledge base.</p>
            </div>

            <div className="space-y-3 text-left max-w-xs mx-auto text-xs">
              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                  genStage >= 1
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {genStage >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 shrink-0" />
                )}
                <span>Analyzing knowledge base</span>
              </div>

              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                  genStage >= 2
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {genStage >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 shrink-0" />
                )}
                <span>Synthesizing structured content</span>
              </div>

              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                  genStage >= 3
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {genStage >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 shrink-0" />
                )}
                <span>Validating learning objectives</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
