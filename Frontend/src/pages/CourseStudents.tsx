import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useToast } from '../context/ToastContext';
import { studentApi } from '../api/studentApi';
import { assignmentApi } from '../api/assignmentApi';
import { contentApi } from '../api/contentApi';
import { Student, Assignment, GeneratedContent } from '../types';
import { WorkflowStepper } from '../components/layout/WorkflowStepper';
import { CourseHeader } from '../components/layout/CourseHeader';
import {
  Users,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileCheck,
  X,
  ArrowRight,
} from 'lucide-react';

export const CourseStudents: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { activeCourse, selectCourse, updateWorkflowStep } = useCourse();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [contents, setContents] = useState<GeneratedContent[]>([]);

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('2026-08-25');
  const [maxAttempts, setMaxAttempts] = useState<number>(2);

  const effectiveCourseId = courseId || activeCourse?.id || 'c_ml_101';

  useEffect(() => {
    if (effectiveCourseId) {
      selectCourse(effectiveCourseId);
      studentApi.getStudentsByCourse(effectiveCourseId).then((s) => setStudents(s));
      assignmentApi.getAssignments(effectiveCourseId).then((a) => setAssignments(a));
      contentApi.getCourseContents(effectiveCourseId).then((c) => {
        setContents(c);
        if (c.length > 0) setSelectedContentId(c[0].id);
      });
    }
  }, [effectiveCourseId]);

  const filteredStudents = students.filter((s) => {
    const matchesFilter = filterStatus === 'All' || s.status === filterStatus;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateAssignment = async () => {
    if (!selectedContentId) return;
    const content = contents.find((c) => c.id === selectedContentId);

    const newAsg = await assignmentApi.createAssignment({
      courseId: effectiveCourseId,
      contentId: selectedContentId,
      title: content?.title || 'Course Assessment',
      assignedToGroups: ['CS-401 Section A', 'CS-401 Section B'],
      dueDate,
      maxAttempts,
    });

    setAssignments((prev) => [newAsg, ...prev]);
    setAssignModalOpen(false);
    await updateWorkflowStep(effectiveCourseId, 'students', 'completed');
    addToast('Assignment Issued ✓', `Assigned to ${students.length} students.`, 'success');
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 space-y-6">
      <WorkflowStepper activeStep="students" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {activeCourse && <CourseHeader course={activeCourse} currentStep="students" />}

        {/* Top Actions & Assign Button */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Users className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Student Roster & Assignment Engine</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {students.length} enrolled students • {assignments.length} active assignments
              </p>
            </div>
          </div>

          <button
            onClick={() => setAssignModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Course Assessment</span>
          </button>
        </div>

        {/* Active Assignments List */}
        {assignments.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>Active Assignments Issued</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((asg) => (
                <div key={asg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-xs">
                      {asg.title}
                    </span>
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                      Due: {asg.dueDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>Submitted: {asg.submittedCount} / {asg.totalAssigned}</span>
                    <span>Pending: {asg.pendingCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              {['All', 'On Track', 'At Risk', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    filterStatus === tab
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3">Average Score</th>
                  <th className="px-5 py-3">Last Active</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div>
                        <p>{st.name}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{st.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${st.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-600">{st.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {st.averageScore}%
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{st.lastActive}</td>
                    <td className="px-5 py-3.5">
                      {st.status === 'At Risk' ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-md text-[11px] font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> At Risk ⚠
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-md text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> On Track
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {filteredStudents.length} students enrolled in {activeCourse?.code}
            </span>
            <button
              onClick={() => navigate(`/courses/${effectiveCourseId}/analytics`)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <span>View Course Analytics →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Assign Content to Students</h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Content</label>
              <select
                value={selectedContentId}
                onChange={(e) => setSelectedContentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              >
                {contents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Attempts</label>
              <input
                type="number"
                min={1}
                max={5}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-xs text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
              >
                Issue Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
