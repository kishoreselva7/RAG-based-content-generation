import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import {
  LayoutDashboard,
  BookOpen,
  Database,
  Sparkles,
  Users,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { teacher, logout } = useAuth();
  const { activeCourse } = useCourse();
  const navigate = useNavigate();

  const courseId = activeCourse?.id || 'c_ml_101';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Courses', path: '/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Knowledge Base', path: `/courses/${courseId}/knowledge`, icon: <Database className="w-4 h-4" /> },
    { label: 'AI Builder', path: `/courses/${courseId}/builder`, icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Students', path: `/courses/${courseId}/students`, icon: <Users className="w-4 h-4" /> },
    { label: 'Analytics', path: `/courses/${courseId}/analytics`, icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 text-gray-700 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Brand */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-1">
                EduGen <span className="text-indigo-600 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] text-gray-500 block font-medium uppercase tracking-wider">
                Teacher Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Active Course Quick Selector Card */}
        {activeCourse && (
          <div className="mx-4 mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Active Course
            </div>
            <div
              onClick={() => navigate(`/courses/${activeCourse.id}`)}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition">
                  {activeCourse.title}
                </p>
                <p className="text-[11px] text-gray-500">{activeCourse.code}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition shrink-0" />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile & Logout */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={teacher?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt={teacher?.name || 'Teacher'}
                className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{teacher?.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{teacher?.role}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-lg transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

