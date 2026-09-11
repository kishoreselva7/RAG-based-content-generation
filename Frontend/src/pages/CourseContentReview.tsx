import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useToast } from '../context/ToastContext';
import { contentApi } from '../api/contentApi';
import { GeneratedContent } from '../types';
import { WorkflowStepper } from '../components/layout/WorkflowStepper';
import { CourseHeader } from '../components/layout/CourseHeader';
import { ReviewWorkspace } from '../components/content/ReviewWorkspace';
import { FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export const CourseContentReview: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { activeCourse, selectCourse, updateWorkflowStep } = useCourse();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  const effectiveCourseId = courseId || activeCourse?.id || 'c_ml_101';

  useEffect(() => {
    if (effectiveCourseId) {
      selectCourse(effectiveCourseId);
      contentApi.getCourseContents(effectiveCourseId).then((items) => {
        setContents(items);
        if (items.length > 0) {
          setSelectedContentId(items[0].id);
        }
      });
    }
  }, [effectiveCourseId]);

  const activeContent = contents.find((c) => c.id === selectedContentId) || contents[0];

  const handleApprove = async (id: string) => {
    await contentApi.updateContentStatus(id, 'approved');
    setContents((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)));
    await updateWorkflowStep(effectiveCourseId, 'review', 'completed');
    addToast('Content Approved ✓', 'Marked ready for course publishing.', 'success');
  };

  const handleReject = async (id: string) => {
    await contentApi.updateContentStatus(id, 'rejected');
    setContents((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)));
    addToast('Content Rejected', 'Content item returned to draft stage.', 'warning');
  };

  const handleSaveContent = async (id: string, updatedBody: string) => {
    await contentApi.updateContentStatus(id, activeContent.status, updatedBody);
    setContents((prev) => prev.map((c) => (c.id === id ? { ...c, contentBody: updatedBody } : c)));
    addToast('Draft Saved ✓', 'Updated content body saved successfully.', 'success');
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 space-y-6">
      <WorkflowStepper activeStep="review" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {activeCourse && <CourseHeader course={activeCourse} currentStep="review" />}

        {/* Generated Items Selector List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Generated Items Pending Review ({contents.length})
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {contents.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedContentId(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer whitespace-nowrap ${
                  item.id === activeContent?.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[180px]">{item.title}</span>
                {item.status === 'approved' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Review Workspace */}
        {activeContent ? (
          <ReviewWorkspace
            content={activeContent}
            onApprove={handleApprove}
            onReject={handleReject}
            onSaveContent={handleSaveContent}
            onNavigateToPublish={() => navigate(`/courses/${effectiveCourseId}/publish`)}
          />
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No generated contents available for review. Go to AI Builder to generate content first.
          </div>
        )}
      </div>
    </div>
  );
};
