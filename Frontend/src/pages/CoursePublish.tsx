import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useToast } from '../context/ToastContext';
import { contentApi } from '../api/contentApi';
import { GeneratedContent } from '../types';
import { WorkflowStepper } from '../components/layout/WorkflowStepper';
import { CourseHeader } from '../components/layout/CourseHeader';
import { PublishModal } from '../components/content/PublishModal';
import { Globe, CheckCircle2, ArrowRight, ShieldCheck, Users } from 'lucide-react';

export const CoursePublish: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { activeCourse, selectCourse, updateWorkflowStep } = useCourse();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const effectiveCourseId = courseId || activeCourse?.id || 'c_ml_101';

  useEffect(() => {
    if (effectiveCourseId) {
      selectCourse(effectiveCourseId);
      contentApi.getCourseContents(effectiveCourseId).then((c) => setContents(c));
    }
  }, [effectiveCourseId]);

  const handlePublish = async (selectedIds: string[]) => {
    await contentApi.publishCourseContents(effectiveCourseId, selectedIds);
    setContents((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, status: 'published' } : c))
    );
    await updateWorkflowStep(effectiveCourseId, 'publish', 'completed');
    addToast('Course Published ✓', 'Selected modules published to student portal.', 'success');
  };

  const publishedCount = contents.filter((c) => c.status === 'published').length;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 space-y-6">
      <WorkflowStepper activeStep="publish" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {activeCourse && <CourseHeader course={activeCourse} currentStep="publish" />}

        {/* Publish Banner Card */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Globe className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Publish Approved Course Modules</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {publishedCount} of {contents.length} modules currently published to student LMS feed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-emerald-600/30"
            >
              <Globe className="w-4 h-4 text-emerald-200" />
              <span>Publish Selected Content</span>
            </button>
          </div>
        </div>

        {/* Content Items Ready Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Reviewed Course Modules</h3>

          <div className="space-y-3">
            {contents.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-200 px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Difficulty: {item.difficulty}</p>
                </div>

                <div>
                  {item.status === 'published' ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Published ✓
                    </span>
                  ) : item.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                      Ready to Publish
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                      Needs Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Ready to assign assessments to enrolled students?
            </span>
            <button
              onClick={() => navigate(`/courses/${effectiveCourseId}/students`)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>Assign to Students →</span>
            </button>
          </div>
        </div>
      </div>

      <PublishModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contents={contents}
        onPublish={handlePublish}
        onNavigateToStudents={() => navigate(`/courses/${effectiveCourseId}/students`)}
      />
    </div>
  );
};
