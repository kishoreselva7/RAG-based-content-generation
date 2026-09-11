import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { WorkflowStepper } from '../components/layout/WorkflowStepper';
import { CourseHeader } from '../components/layout/CourseHeader';
import { BookOpen, Database, Sparkles, CheckSquare, Globe, Users, BarChart3, Wand2, ArrowRight } from 'lucide-react';

export const CourseOverview: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { activeCourse, selectCourse } = useCourse();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      selectCourse(courseId);
    }
  }, [courseId]);

  if (!activeCourse) return null;

  const cards = [
    {
      title: 'Knowledge Base',
      desc: 'Upload syllabus, lecture slides, question papers, and reference documents.',
      step: 'knowledge',
      path: `/courses/${activeCourse.id}/knowledge`,
      icon: <Database className="w-5 h-5 text-indigo-600" />,
      status: activeCourse.workflowStatus.knowledge,
    },
    {
      title: 'AI Course Builder',
      desc: 'Generate topic-by-topic lecture notes, quizzes, assignments, and flashcards.',
      step: 'builder',
      path: `/courses/${activeCourse.id}/builder`,
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      status: activeCourse.workflowStatus.builder,
    },
    {
      title: 'Content Review',
      desc: 'Inspect and edit AI draft contents before publishing.',
      step: 'review',
      path: `/courses/${activeCourse.id}/review`,
      icon: <CheckSquare className="w-5 h-5 text-amber-600" />,
      status: activeCourse.workflowStatus.review,
    },
    {
      title: 'Publish Course',
      desc: 'Select approved modules and publish to student LMS feeds.',
      step: 'publish',
      path: `/courses/${activeCourse.id}/publish`,
      icon: <Globe className="w-5 h-5 text-emerald-600" />,
      status: activeCourse.workflowStatus.publish,
    },
    {
      title: 'Students & Roster',
      desc: 'Manage enrolled students and assign course assessments.',
      step: 'students',
      path: `/courses/${activeCourse.id}/students`,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      status: activeCourse.workflowStatus.students,
    },
    {
      title: 'Performance Analytics',
      desc: 'Monitor student performance and AI weak-topic detection.',
      step: 'analytics',
      path: `/courses/${activeCourse.id}/analytics`,
      icon: <BarChart3 className="w-5 h-5 text-rose-600" />,
      status: activeCourse.workflowStatus.analytics,
    },
  ];

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 space-y-6">
      {/* Workflow Stepper Bar */}
      <WorkflowStepper activeStep="create" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Course Header Banner */}
        <CourseHeader course={activeCourse} currentStep="create" />

        {/* Workflow Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div
              key={c.title}
              onClick={() => navigate(c.path)}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl group-hover:scale-105 transition">
                    {c.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{c.desc}</p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 pt-3 border-t border-slate-100">
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
