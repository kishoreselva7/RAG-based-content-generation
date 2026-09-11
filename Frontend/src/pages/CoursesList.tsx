import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { BookOpen, Plus, Search, ArrowRight, Users, Sparkles, Filter } from 'lucide-react';

export const CoursesList: React.FC = () => {
  const { courses, selectCourse } = useCourse();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(filter.toLowerCase()) ||
      c.code.toLowerCase().includes(filter.toLowerCase()) ||
      c.department.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Courses</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and generate AI workflows for your courses</p>
        </div>

        <button
          onClick={() => navigate('/courses/create')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter courses by name, code, department..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border border-indigo-200">
                  {course.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">{course.semester}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{course.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                {course.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Course Progress</span>
                  <span className="text-indigo-600">{course.overallProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${course.overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.studentsCount} Students</span>
              </span>

              <button
                onClick={() => {
                  selectCourse(course.id);
                  navigate(`/courses/${course.id}`);
                }}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
