import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, WorkflowStepId } from '../../types';
import { BookOpen, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface CourseHeaderProps {
  course: Course;
  currentStep: WorkflowStepId;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course, currentStep }) => {
  const navigate = useNavigate();

  // Determine next action button based on current step
  const getNextAction = () => {
    switch (currentStep) {
      case 'create':
        return { label: 'Upload Syllabus →', path: `/courses/${course.id}/knowledge` };
      case 'knowledge':
        return { label: 'Continue to AI Builder →', path: `/courses/${course.id}/builder` };
      case 'builder':
        return { label: 'Review AI Content →', path: `/courses/${course.id}/review` };
      case 'review':
        return { label: 'Publish Course →', path: `/courses/${course.id}/publish` };
      case 'publish':
        return { label: 'Assign to Students →', path: `/courses/${course.id}/students` };
      case 'students':
        return { label: 'View Performance Analytics →', path: `/courses/${course.id}/analytics` };
      case 'analytics':
        return { label: 'Generate Remedial Content →', path: `/courses/${course.id}/improve` };
      case 'improve':
        return { label: 'Back to Overview →', path: `/courses/${course.id}` };
      default:
        return { label: 'Continue Workflow →', path: `/courses/${course.id}/knowledge` };
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="bg-white border border-gray-200 text-gray-900 p-6 rounded-xl shadow-sm mb-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold">
              {course.code}
            </span>
            <span className="text-gray-500 text-xs font-medium">{course.semester}</span>
            <span className="text-gray-400 text-xs">• {course.department}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {course.title}
          </h1>

          <p className="text-gray-600 text-sm max-w-2xl line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-lg shrink-0">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium">Course Progress</span>
              <span className="text-indigo-600 font-bold ml-3">{course.overallProgress}%</span>
            </div>
            <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                style={{ width: `${course.overallProgress}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => navigate(nextAction.path)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <span>{nextAction.label}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
