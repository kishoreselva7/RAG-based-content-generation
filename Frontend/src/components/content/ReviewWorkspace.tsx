import React, { useState } from 'react';
import { GeneratedContent } from '../../types';
import { ContentEditor } from './ContentEditor';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  RotateCcw,
  Sparkles,
  FileText,
  Clock,
  Eye,
  Check,
  Globe,
  Tag,
} from 'lucide-react';

interface ReviewWorkspaceProps {
  content: GeneratedContent;
  onApprove: (contentId: string) => void;
  onReject: (contentId: string) => void;
  onSaveContent: (contentId: string, updatedBody: string) => void;
  onNavigateToPublish?: () => void;
}

export const ReviewWorkspace: React.FC<ReviewWorkspaceProps> = ({
  content,
  onApprove,
  onReject,
  onSaveContent,
  onNavigateToPublish,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentBody, setCurrentBody] = useState(content.contentBody);
  const [status, setStatus] = useState(content.status);

  const handleApprove = () => {
    setStatus('approved');
    onApprove(content.id);
  };

  const handleReject = () => {
    setStatus('rejected');
    onReject(content.id);
  };

  const handleSave = (updatedBody: string) => {
    setCurrentBody(updatedBody);
    onSaveContent(content.id, updatedBody);
  };

  const statusColors = {
    needs_review: 'bg-amber-50 text-amber-800 border-amber-300',
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    published: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    rejected: 'bg-rose-50 text-rose-800 border-rose-300',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Action Header */}
      <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-md uppercase tracking-wider ${statusColors[status]}`}
            >
              {status.replace('_', ' ')}
            </span>
            <span className="text-slate-400 text-xs">• Difficulty: {content.difficulty}</span>
          </div>
          <h2 className="text-lg font-bold text-white">{content.title}</h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer border border-slate-700"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Preview Mode' : 'Edit Content'}</span>
          </button>

          {status !== 'approved' ? (
            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Content</span>
            </button>
          ) : (
            <button
              onClick={onNavigateToPublish}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Proceed to Publish →</span>
            </button>
          )}

          <button
            onClick={handleReject}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Reject Content"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Review Workspace Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & AI Grounding */}
        <div className="space-y-6 lg:col-span-1 border-r-0 lg:border-r border-slate-200 lg:pr-6">
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Grounding Metadata</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <p>
                <strong className="text-slate-900">Source:</strong> Course Knowledge Base
              </p>
              <p>
                <strong className="text-slate-900">Type:</strong> {content.type.replace('_', ' ')}
              </p>
              <p>
                <strong className="text-slate-900">Generated:</strong>{' '}
                {new Date(content.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Target Learning Objectives
            </h4>
            <ul className="space-y-2">
              {(content.metadata?.learningObjectivesCovered || [
                'Understand foundational formulas',
                'Apply algorithms to problem sets',
              ]).map((obj) => (
                <li key={obj} className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quiz questions view if applicable */}
          {content.questions && content.questions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Quiz Questions ({content.questions.length})
              </h4>
              <div className="space-y-3">
                {content.questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <p className="font-semibold text-slate-900 mb-1">
                      Q{idx + 1}. {q.question}
                    </p>
                    <p className="text-emerald-700 font-medium">
                      ✓ Answer: {q.options[q.correctAnswer]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Editor or Rendered Preview */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <ContentEditor initialContent={currentBody} onSave={handleSave} />
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>Student View Preview</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Markdown Formatted</span>
              </div>

              <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
                <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                  {currentBody}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
