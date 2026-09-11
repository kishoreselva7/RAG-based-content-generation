import React from 'react';
import { Unit, Topic, ContentType } from '../../types';
import {
  BookOpen,
  Sparkles,
  FileText,
  HelpCircle,
  FileCheck,
  Layers,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';

interface UnitTopicTreeProps {
  units: Unit[];
  onOpenGenerateModal: (unitId: string, topicId: string, contentType: ContentType) => void;
  onGenerateUnit: (unitId: string) => void;
}

export const UnitTopicTree: React.FC<UnitTopicTreeProps> = ({
  units,
  onOpenGenerateModal,
  onGenerateUnit,
}) => {
  return (
    <div className="space-y-6">
      {units.map((unit) => (
        <div
          key={unit.id}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
        >
          {/* Unit Header Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                  Unit {unit.unitNumber}
                </span>
                <span className="text-slate-400 text-xs">• {unit.topics.length} Topics</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{unit.title}</h3>
            </div>

            <button
              onClick={() => onGenerateUnit(unit.id)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs shrink-0"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Generate Entire Unit</span>
            </button>
          </div>

          {/* Topics List */}
          <div className="divide-y divide-slate-100">
            {unit.topics.map((topic) => {
              const statusBadges = {
                not_generated: 'bg-slate-100 text-slate-600 border-slate-200',
                generating: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
                generated: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
                published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              };

              const statusLabels = {
                not_generated: 'Not Generated',
                generating: 'Generating...',
                generated: 'Generated',
                reviewed: 'Reviewed ✓',
                published: 'Published ✓',
              };

              return (
                <div key={topic.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Topic Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        {topic.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <h4 className="text-sm font-semibold text-slate-900">{topic.title}</h4>
                        <span
                          className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md ${
                            statusBadges[topic.status]
                          }`}
                        >
                          {statusLabels[topic.status]}
                        </span>
                      </div>

                      {topic.averageScore && (
                        <p className="text-xs text-amber-600 font-medium ml-6">
                          ⚠ Class Performance: {topic.averageScore}% (Needs attention)
                        </p>
                      )}
                    </div>

                    {/* AI Generation Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                      <button
                        onClick={() => onOpenGenerateModal(unit.id, topic.id, 'lecture_notes')}
                        className="flex items-center gap-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Notes</span>
                      </button>

                      <button
                        onClick={() => onOpenGenerateModal(unit.id, topic.id, 'quiz')}
                        className="flex items-center gap-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Quiz</span>
                      </button>

                      <button
                        onClick={() => onOpenGenerateModal(unit.id, topic.id, 'assignment')}
                        className="flex items-center gap-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Assignment</span>
                      </button>

                      <button
                        onClick={() => onOpenGenerateModal(unit.id, topic.id, 'flashcards')}
                        className="flex items-center gap-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        <span>Flashcards</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
