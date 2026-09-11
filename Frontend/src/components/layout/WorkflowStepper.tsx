import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourse } from '../../context/CourseContext';
import { WorkflowStepId } from '../../types';
import {
  FilePlus,
  FileText,
  Sparkles,
  CheckSquare,
  Globe,
  Users,
  BarChart3,
  Wand2,
  CheckCircle2,
  Clock,
  Circle,
} from 'lucide-react';

interface StepDef {
  id: WorkflowStepId;
  label: string;
  path: (id: string) => string;
  icon: React.ReactNode;
}

export const WORKFLOW_STEPS: StepDef[] = [
  { id: 'create', label: '1. Create', path: (id) => `/courses/${id}`, icon: <FilePlus className="w-4 h-4" /> },
  { id: 'knowledge', label: '2. Knowledge', path: (id) => `/courses/${id}/knowledge`, icon: <FileText className="w-4 h-4" /> },
  { id: 'builder', label: '3. AI Builder', path: (id) => `/courses/${id}/builder`, icon: <Sparkles className="w-4 h-4" /> },
  { id: 'review', label: '4. Review', path: (id) => `/courses/${id}/review`, icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'publish', label: '5. Publish', path: (id) => `/courses/${id}/publish`, icon: <Globe className="w-4 h-4" /> },
  { id: 'students', label: '6. Assign', path: (id) => `/courses/${id}/students`, icon: <Users className="w-4 h-4" /> },
  { id: 'analytics', label: '7. Analytics', path: (id) => `/courses/${id}/analytics`, icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'improve', label: '8. Improve', path: (id) => `/courses/${id}/improve`, icon: <Wand2 className="w-4 h-4" /> },
];

export const WorkflowStepper: React.FC<{ activeStep: WorkflowStepId }> = ({ activeStep }) => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { activeCourse } = useCourse();

  const effectiveCourseId = courseId || activeCourse?.id || 'c_ml_101';
  const workflowStatus = activeCourse?.workflowStatus || {
    create: 'completed',
    knowledge: 'completed',
    builder: 'completed',
    review: 'in_progress',
    publish: 'pending',
    students: 'pending',
    analytics: 'pending',
    improve: 'pending',
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-xs sticky top-0 z-20">
      <div className="flex items-center justify-between overflow-x-auto gap-2 no-scrollbar py-1">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = workflowStatus[step.id] || 'pending';
          const isCurrent = step.id === activeStep;

          let badgeColor = 'bg-gray-50 text-gray-500 border-gray-200';
          let iconComponent = <Circle className="w-3.5 h-3.5" />;

          if (status === 'completed') {
            badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            iconComponent = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
          } else if (isCurrent || status === 'in_progress') {
            badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold ring-2 ring-indigo-500/20';
            iconComponent = <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />;
          } else if (status === 'needs_attention') {
            badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
          }

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => navigate(step.path(effectiveCourseId))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs whitespace-nowrap transition-all duration-150 cursor-pointer hover:shadow-xs ${badgeColor}`}
              >
                {iconComponent}
                <span>{step.label}</span>
              </button>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="h-0.5 w-4 bg-gray-200 shrink-0 hidden md:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
