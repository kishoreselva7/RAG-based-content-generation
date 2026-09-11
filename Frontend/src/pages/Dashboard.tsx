import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import {
  BookOpen,
  Users,
  Sparkles,
  CheckSquare,
  Plus,
  Upload,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { teacher } = useAuth();
  const { courses, selectCourse } = useCourse();
  const navigate = useNavigate();

  const totalStudents = courses.reduce((acc, c) => acc + c.studentsCount, 0);
  const totalContent = courses.reduce((acc, c) => acc + c.contentCount, 0);

  // Helper to resolve next route for course based on workflow
  const getCourseNextRoute = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return `/courses/${courseId}/knowledge`;

    const wf = course.workflowStatus;
    if (wf.knowledge !== 'completed') return `/courses/${courseId}/knowledge`;
    if (wf.builder !== 'completed') return `/courses/${courseId}/builder`;
    if (wf.review !== 'completed') return `/courses/${courseId}/review`;
    if (wf.publish !== 'completed') return `/courses/${courseId}/publish`;
    if (wf.students !== 'completed') return `/courses/${courseId}/students`;
    if (wf.analytics !== 'completed') return `/courses/${courseId}/analytics`;
    return `/courses/${courseId}/improve`;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3 py-1 rounded-full">
              Teacher Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-2">
              Good morning, {teacher?.name || 'Teacher'} 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Here's what's happening with your AI-powered courses today. You have 5 AI generated contents waiting for review.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/courses/create')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-3 rounded-xl transition cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Courses</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{courses.length}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Active this semester</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Students</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
          <p className="text-[11px] text-slate-400 mt-1">Across all sections</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>AI Content Generated</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalContent} items</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ 12 generated this week</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Pending Reviews</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">5 items</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Requires teacher approval</p>
        </div>
      </div>

      {/* Continue Working Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Continue Working</h2>
            <p className="text-xs text-slate-500">Courses currently progressing through the AI workflow</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            View All Courses →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const nextRoute = getCourseNextRoute(course.id);

            return (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-slate-100 text-slate-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                      {course.code}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600">
                      {course.overallProgress}% Complete
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">{course.title}</h3>

                  {/* Workflow Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-3">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${course.overallProgress}%` }}
                    />
                  </div>

                  {/* Workflow Steps Breakdown */}
                  <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold text-slate-600 mb-4">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-1.5 rounded-lg text-center">
                      Knowledge ✓
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-1.5 rounded-lg text-center">
                      AI Content ✓
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-1.5 rounded-lg text-center">
                      Review ●
                    </div>
                    <div className="bg-slate-50 border border-slate-200 text-slate-400 p-1.5 rounded-lg text-center">
                      Publish ○
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{course.studentsCount} Students enrolled</span>
                  <button
                    onClick={() => {
                      selectCourse(course.id);
                      navigate(nextRoute);
                    }}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/courses/create')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition cursor-pointer text-left text-xs font-medium text-slate-800"
            >
              <Plus className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Create New Course</span>
            </button>

            <button
              onClick={() => navigate('/courses/c_ml_101/knowledge')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition cursor-pointer text-left text-xs font-medium text-slate-800"
            >
              <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Upload Syllabus & Documents</span>
            </button>

            <button
              onClick={() => navigate('/courses/c_ml_101/builder')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition cursor-pointer text-left text-xs font-medium text-slate-800"
            >
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Generate AI Quiz / Notes</span>
            </button>

            <button
              onClick={() => navigate('/courses/c_ml_101/analytics')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition cursor-pointer text-left text-xs font-medium text-slate-800"
            >
              <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
              <span>View Analytics & AI Insights</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Activity Feed</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Unit 2 Assessment generated</p>
                <p className="text-slate-500 mt-0.5">Machine Learning • 10 questions on Model Evaluation</p>
                <p className="text-[10px] text-slate-400 mt-1">15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Syllabus processed into knowledge chunks</p>
                <p className="text-slate-500 mt-0.5">Machine Learning Syllabus.pdf parsed (8 units, 46 topics)</p>
                <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">5 generated contents waiting for review</p>
                <p className="text-amber-800 mt-0.5">Requires teacher verification before publishing to students</p>
                <p className="text-[10px] text-amber-600 mt-1">Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
