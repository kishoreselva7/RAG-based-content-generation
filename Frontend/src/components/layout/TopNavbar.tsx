import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  BookOpen,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

export const TopNavbar: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const { courses, activeCourse, selectCourse } = useCourse();
  const { teacher, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate breadcrumb text
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/courses/create')) return 'My Courses / Create Course';
    if (path.includes('/courses') && activeCourse) {
      if (path.includes('/knowledge')) return `My Courses / ${activeCourse.code} / Knowledge Base`;
      if (path.includes('/builder')) return `My Courses / ${activeCourse.code} / AI Builder`;
      if (path.includes('/review')) return `My Courses / ${activeCourse.code} / Content Review`;
      if (path.includes('/publish')) return `My Courses / ${activeCourse.code} / Publish`;
      if (path.includes('/students')) return `My Courses / ${activeCourse.code} / Students`;
      if (path.includes('/analytics')) return `My Courses / ${activeCourse.code} / Analytics`;
      if (path.includes('/improve')) return `My Courses / ${activeCourse.code} / Improve Content`;
      return `My Courses / ${activeCourse.code}`;
    }
    if (path.includes('/settings')) return 'Settings';
    return 'EduGen AI Workspace';
  };

  const notificationsList = [
    {
      id: 1,
      title: 'Unit 2 Assessment Ready',
      desc: 'AI generated 10 quiz questions for Model Evaluation.',
      time: '10 min ago',
      unread: true,
      type: 'success',
    },
    {
      id: 2,
      title: 'Weak Topic Alert',
      desc: '54% average on Model Evaluation. Remedial content recommended.',
      time: '1 hour ago',
      unread: true,
      type: 'warning',
    },
    {
      id: 3,
      title: 'Syllabus Processed',
      desc: 'Machine Learning Syllabus.pdf parsed into 8 units and 46 topics.',
      time: '3 hours ago',
      unread: false,
      type: 'info',
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left section: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-xs font-medium text-gray-500">{getBreadcrumbs()}</div>
        </div>
      </div>

      {/* Middle section: Course Selector Dropdown */}
      {activeCourse && (
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowCourseDropdown(!showCourseDropdown)}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-800 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="truncate max-w-[200px] font-semibold">{activeCourse.title}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showCourseDropdown && (
            <div className="absolute top-full mt-2 left-0 w-72 bg-white border border-gray-200 shadow-lg rounded-lg p-2 z-50">
              <div className="text-[11px] font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                Switch Course
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto my-1">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      selectCourse(course.id);
                      setShowCourseDropdown(false);
                      navigate(`/courses/${course.id}`);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition cursor-pointer ${
                      course.id === activeCourse.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{course.title}</span>
                    <span className="text-[10px] text-gray-400 ml-2 font-mono shrink-0">{course.code}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-1.5 mt-1">
                <button
                  onClick={() => {
                    setShowCourseDropdown(false);
                    navigate('/courses/create');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-600 font-medium hover:bg-indigo-50 rounded-md transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Course</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right section: Search, Notifications, Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden sm:block w-48 lg:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Modal */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 py-3 max-h-72 overflow-y-auto">
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100 cursor-pointer"
                  >
                    {n.type === 'warning' ? (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">{n.title}</p>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{n.desc}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-2 text-center">
                <button className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <img
              src={teacher?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt={teacher?.name || 'Teacher Profile'}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-lg p-2 z-50">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-semibold text-gray-900">{teacher?.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{teacher?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-md transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
