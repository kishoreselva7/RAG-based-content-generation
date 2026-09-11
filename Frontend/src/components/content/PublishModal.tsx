import React, { useState } from 'react';
import { GeneratedContent } from '../../types';
import { Globe, Check, Calendar, ArrowRight, X, CheckCircle2, Users } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  contents: GeneratedContent[];
  onPublish: (selectedIds: string[]) => Promise<void>;
  onNavigateToStudents: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  contents,
  onPublish,
  onNavigateToStudents,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    contents.filter((c) => c.status === 'approved' || c.status === 'needs_review').map((c) => c.id)
  );
  const [publishSchedule, setPublishSchedule] = useState<'immediate' | 'schedule'>('immediate');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    await onPublish(selectedIds);
    setIsPublishing(false);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Publish Course Content</h3>
              <p className="text-[11px] text-slate-400">Make reviewed materials visible to students</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isSuccess ? (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Contents to Publish ({selectedIds.length} selected)
              </label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {contents.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="accent-indigo-600 rounded shrink-0"
                      />
                      <span className="font-semibold text-slate-900 truncate">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono capitalize shrink-0">
                      {item.type.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Schedule options */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Availability</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPublishSchedule('immediate')}
                  className={`p-3 rounded-xl border text-xs font-medium transition cursor-pointer text-left ${
                    publishSchedule === 'immediate'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Publish Immediately
                </button>
                <button
                  type="button"
                  onClick={() => setPublishSchedule('schedule')}
                  className={`p-3 rounded-xl border text-xs font-medium transition cursor-pointer text-left ${
                    publishSchedule === 'schedule'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Schedule Later
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-xs font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={isPublishing || selectedIds.length === 0}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
              >
                <Globe className="w-4 h-4 text-indigo-200" />
                <span>{isPublishing ? 'Publishing...' : 'Publish Course'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">Course Published ✓</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Your students can now access the selected content modules in their LMS feed.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-xs font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToStudents();
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Users className="w-4 h-4" />
                <span>Assign to Students →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
