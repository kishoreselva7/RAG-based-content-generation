import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useToast } from '../context/ToastContext';
import { knowledgeApi } from '../api/knowledgeApi';
import { KnowledgeDocument } from '../types';
import { WorkflowStepper } from '../components/layout/WorkflowStepper';
import { CourseHeader } from '../components/layout/CourseHeader';
import { FileUploader } from '../components/knowledge/FileUploader';
import { ProcessingPipeline } from '../components/knowledge/ProcessingPipeline';
import {
  FileText,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const CourseKnowledge: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { activeCourse, selectCourse, updateWorkflowStep } = useCourse();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All Files');
  const [search, setSearch] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingFileName, setProcessingFileName] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocument | null>(null);

  const effectiveCourseId = courseId || activeCourse?.id || 'c_ml_101';

  useEffect(() => {
    if (effectiveCourseId) {
      selectCourse(effectiveCourseId);
      knowledgeApi.getDocuments(effectiveCourseId).then((docs) => setDocuments(docs));
    }
  }, [effectiveCourseId]);

  const handleUploadFile = async (file: File, category: KnowledgeDocument['category']) => {
    setProcessingFileName(file.name);
    setIsProcessing(true);

    const newDoc = await knowledgeApi.uploadDocument(effectiveCourseId, file, category);
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleProcessingComplete = async () => {
    setIsProcessing(false);
    setDocuments((prev) =>
      prev.map((d) => (d.fileName === processingFileName ? { ...d, status: 'processed' } : d))
    );
    await updateWorkflowStep(effectiveCourseId, 'knowledge', 'completed');
    addToast('Knowledge Base Ready ✓', 'Document indexed into 124 knowledge chunks.', 'success');
  };

  const handleDelete = async (docId: string) => {
    await knowledgeApi.deleteDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    addToast('Document Removed', 'Knowledge document deleted successfully.', 'info');
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesTab = activeTab === 'All Files' || doc.category === activeTab;
    const matchesSearch = doc.fileName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 space-y-6">
      <WorkflowStepper activeStep="knowledge" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {activeCourse && <CourseHeader course={activeCourse} currentStep="knowledge" />}

        {/* Processing Pipeline Banner */}
        {isProcessing && (
          <ProcessingPipeline fileName={processingFileName} onComplete={handleProcessingComplete} />
        )}

        {/* Uploader Widget */}
        <FileUploader onUpload={handleUploadFile} isLoading={isProcessing} />

        {/* Knowledge Workspace Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Tabs & Search */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {['All Files', 'Syllabus', 'Notes', 'Books', 'Question Papers', 'Reference Materials'].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Document Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Size</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2.5 min-w-[200px]">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="truncate max-w-xs">{doc.fileName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium text-[11px]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono">{doc.fileSize}</td>
                    <td className="px-5 py-3.5">
                      {doc.status === 'processed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Processed ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-medium animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Processing...
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Preview document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDocs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No documents found matching criteria. Upload a file above to begin.
            </div>
          )}

          {/* Bottom Call to Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {documents.length} knowledge documents indexed for AI course generation.
            </span>
            <button
              onClick={() => navigate(`/courses/${effectiveCourseId}/builder`)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <span>Continue to AI Builder →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Preview Drawer/Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{previewDoc.fileName}</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 font-mono text-slate-700">
              <p>Category: {previewDoc.category}</p>
              <p>File Size: {previewDoc.fileSize}</p>
              <p>Indexed Chunks: {previewDoc.chunkCount || 124}</p>
              <p>Status: {previewDoc.status}</p>
              <p className="text-slate-500 italic mt-3 font-sans">
                "Grounding content verified against target course learning objectives."
              </p>
            </div>
            <button
              onClick={() => setPreviewDoc(null)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
