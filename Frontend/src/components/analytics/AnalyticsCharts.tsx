import React from 'react';
import { CourseAnalytics } from '../../types';
import { BarChart3, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

export const AnalyticsCharts: React.FC<{ analytics: CourseAnalytics }> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Average Score</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.averageScore}%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ +4% vs last unit</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Completion Rate</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.completionRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">168 students completed</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Active Students</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.activeStudents}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active this week</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>At-Risk Students</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{analytics.atRiskStudents}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Require remedial help</p>
        </div>
      </div>

      {/* Topic Performance Breakdown Table/Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span>Topic Mastery Performance Breakdown</span>
        </h3>

        <div className="space-y-4">
          {analytics.topicPerformances.map((tp) => {
            let barColor = 'bg-emerald-500';
            if (tp.scorePercentage < 60) barColor = 'bg-amber-500';
            else if (tp.scorePercentage < 75) barColor = 'bg-indigo-500';

            return (
              <div key={tp.topicId}>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>{tp.topicName}</span>
                  <span className="font-mono">{tp.scorePercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${tp.scorePercentage}%` }}
                  />
                </div>
                {tp.struggleConcepts && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1">
                    ⚠️ Struggle areas: {tp.struggleConcepts.join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
