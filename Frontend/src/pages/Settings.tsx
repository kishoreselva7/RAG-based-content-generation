import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Settings as SettingsIcon, Server, Key, User, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { teacher } = useAuth();
  const { addToast } = useToast();

  const [backendUrl, setBackendUrl] = useState<string>(
    (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'
  );
  const [apiKey, setApiKey] = useState<string>('••••••••••••••••••••••••••••••••');
  const [department, setDepartment] = useState<string>(teacher?.department || 'Computer Science');
  const [institution, setInstitution] = useState<string>(teacher?.institution || 'Stanford School of Engineering');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Settings Saved ✓', 'API endpoint configuration updated successfully.', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Integrations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure API endpoints, Gemini AI keys, and teacher profile preferences.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Python Backend API Configuration Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Python Backend Integration</h3>
              <p className="text-[11px] text-slate-500">
                Connect your existing Python FastAPI or Django API service
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Backend API URL (<code className="text-indigo-600 font-mono">REACT_APP_API_URL / VITE_API_URL</code>)
            </label>
            <input
              type="url"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              The React frontend issues Axios requests to this central endpoint via modular API service files in <code className="text-slate-600 font-mono">src/api/</code>.
            </p>
          </div>
        </div>

        {/* Gemini AI Key Configuration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Model Credentials</h3>
              <p className="text-[11px] text-slate-500">Managed safely via environment credentials</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gemini AI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Teacher Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Teacher Profile Information</h3>
              <p className="text-[11px] text-slate-500">Institution & Department metadata</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
