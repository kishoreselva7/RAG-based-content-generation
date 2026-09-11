import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useToast } from '../context/ToastContext';
import { analyticsApi } from '../api/analyticsApi';
import { CourseAnalytics as AnalyticsType, AIInsight } from '../types';
import { WorkflowStepper } from '../components/layout/WorkflowStepper';
import { CourseHeader } from '../components/layout/CourseHeader';
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts';
import { AIInsightCard } from '../components/analytics/AIInsightCard';
import { BarChart3, Wand2 } from 'lucide-react';

export const CourseAnalytics: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { activeCourse, selectCourse, updateWorkflowStep } = useCourse();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);

  const effectiveCourseId = courseId || activeCourse?.id || 'c_ml_101';

  useEffect(() => {
    if (effectiveCourseId) {
      selectCourse(effectiveCourseId);
      analyticsApi.getCourseAnalytics(effectiveCourseId).then((a) => setAnalytics(a));
    }
  }, [effectiveCourseId]);

  const handleGenerateRemedial = async (insight: AIInsight) => {
    await updateWorkflowStep(effectiveCourseId, 'analytics', 'completed');
    addToast('Opening Remedial Generator', `Preparing improvement package for ${insight.topicName}...`, 'info');
    navigate(`/courses/${effectiveCourseId}/improve`);
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 space-y-6">
      <WorkflowStepper activeStep="analytics" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {activeCourse && <CourseHeader course={activeCourse} currentStep="analytics" />}

        {/* AI Learning Insights Header */}
        {analytics?.aiInsights && analytics.aiInsights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-600" />
              <span>AI Learning Insights & Weak Topic Detection</span>
            </h2>

            {analytics.aiInsights.map((insight) => (
              <AIInsightCard
                key={insight.id}
                insight={insight}
                onGenerateRemedial={handleGenerateRemedial}
              />
            ))}
          </div>
        )}

        {/* Performance Charts */}
        {analytics && <AnalyticsCharts analytics={analytics} />}
      </div>
    </div>
  );
};
