import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

export const CourseCreate: React.FC = () => {
  const { createCourse } = useCourse();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('Fall 2026');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState<string[]>([
    'Master foundational mathematical and algorithmic principles',
    'Build end-to-end practical project pipelines',
  ]);
  const [newObj, setNewObj] = useState('');

  const addObjective = () => {
    if (newObj.trim()) {
      setObjectives([...objectives, newObj.trim()]);
      setNewObj('');
    }
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      addToast('Course Name Required', 'Please enter a name for your course.', 'error');
      return;
    }

    const newCourse = await createCourse({
      title,
      code: code || 'CS-101',
      subject: subject || 'Computer Science',
      department,
      semester,
      description,
      learningObjectives: objectives,
    });

    addToast('Course Created ✓', 'Navigating to syllabus document upload...', 'success');

    // Section 8 prompt mandate:
    // "After clicking Continue: Automatically move to Upload Syllabus. Do not make the teacher manually search for the next page."
    navigate(`/courses/${newCourse.id}/knowledge`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Course</h1>
        <p className="text-xs text-slate-500 mt-1">
          Set up course metadata before uploading syllabi and reference documents.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 font-bold shrink-0">
            <span>1 Course Details</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-200 shrink-0" />
          <div className="text-slate-400 shrink-0">2 Syllabus</div>
          <div className="h-0.5 w-6 bg-slate-200 shrink-0" />
          <div className="text-slate-400 shrink-0">3 Knowledge</div>
          <div className="h-0.5 w-6 bg-slate-200 shrink-0" />
          <div className="text-slate-400 shrink-0">4 Generate</div>
          <div className="h-0.5 w-6 bg-slate-200 shrink-0" />
          <div className="text-slate-400 shrink-0">5 Review</div>
          <div className="h-0.5 w-6 bg-slate-200 shrink-0" />
          <div className="text-slate-400 shrink-0">6 Publish</div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Machine Learning & Neural Networks"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CS-401"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a high-level overview of the course scope..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-y"
            />
          </div>
        </div>

        {/* Learning Objectives */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Learning Objectives</label>
          <div className="space-y-2 mb-3">
            {objectives.map((obj, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                <span>• {obj}</span>
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newObj}
              onChange={(e) => setNewObj(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
              placeholder="Add another learning objective..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={addObjective}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              + Add Objective
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <span>Save & Continue to Syllabus Upload</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
