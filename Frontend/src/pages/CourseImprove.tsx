import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useToast } from '../context/ToastContext';
import { improvementApi } from '../api/improvementApi';
import { GeneratedContent } from '../types';
import { WorkflowStepper } from '../components/layout/WorkflowStepper';
import { CourseHeader } from '../components/layout/CourseHeader';
import { Wand2, AlertTriangle, CheckCircle2, ArrowRight, FileText, Sparkles } from 'lucide-react';

export const CourseImprove: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { activeCourse, selectCourse, updateWorkflowStep } = useCourse();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isGenerating, setIsGenerating] = useState(false);
  const [remedialContents, setRemedialContents] = useState<GeneratedContent[]>([]);

  const effectiveCourseId = courseId || activeCourse?.id || 'c_ml_101';

  const handleGeneratePackage = async () => {
    setIsGenerating(true);
    const res = await improvementApi.generateRemedialPackage(
      effectiveCourseId,
      't_2_3',
      'Model Evaluation & Confusion Matrix',
      ['Precision vs Recall Tradeoff', 'Confusion Matrix Interpretation', 'K-Fold Cross Validation']
    );

    setIsGenerating(false);
    setRemedialContents(res.remedialContent);
    await updateWorkflowStep(effectiveCourseId, 'improve', 'completed');
    addToast('Remedial Package Generated ✓', 'Content generated specifically addressing weak concepts.', 'success');
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 space-y-6">
      <WorkflowStepper activeStep="improve" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {activeCourse && <CourseHeader course={activeCourse} currentStep="improve" />}

        {/* Improvement Header Card */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase">
                  Weak Topic Remedial Engine
                </span>
                <span className="text-xs text-slate-400 font-mono">Current Performance: 54%</span>
              </div>
              <h2 className="text-xl font-bold text-white">Content Improvement Workspace</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Close the teaching-learning loop by generating targeted remedial explanations, visual diagrams, and step-by-step drills for struggling students.
              </p>
            </div>

            <button
              onClick={handleGeneratePackage}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-3 rounded-xl transition cursor-pointer shadow-lg shadow-indigo-600/30 shrink-0 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4 text-indigo-200" />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Improvement Package'}</span>
            </button>
          </div>
        </div>

        {/* AI Recommendations Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Diagnostic & Remedial Package Checklist</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            {[
              { title: 'Simplified Intuitive Explanation', desc: 'Analogy-based breakdown of Confusion Matrix' },
              { title: 'Visual Calculation Example', desc: 'Step-by-step Precision and Recall formulas' },
              { title: '10 Practice Drill Problems', desc: 'Graduated difficulty scenario questions' },
              { title: 'Revision Flashcards Set', desc: 'Key terms definitions for quick memory retention' },
            ].map((item) => (
              <div key={item.title} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Remedial Draft Preview */}
        {remedialContents.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Generated Remedial Package Draft</span>
              </h3>

              <button
                onClick={() => navigate(`/courses/${effectiveCourseId}/review`)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <span>Review & Approve Content →</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs whitespace-pre-wrap font-sans text-slate-800 leading-relaxed max-h-72 overflow-y-auto">
              {remedialContents[0].contentBody}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
