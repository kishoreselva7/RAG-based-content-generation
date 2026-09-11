import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { KnowledgeDocument } from '../../types';

interface FileUploaderProps {
  onUpload: (file: File, category: KnowledgeDocument['category']) => Promise<void>;
  isLoading?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isLoading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<KnowledgeDocument['category']>('Syllabus');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['pdf', 'docx', 'txt', 'ppt', 'pptx'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !validExtensions.includes(ext)) {
      setErrorMsg('Invalid file type. Please upload PDF, DOCX, TXT, or PPT documents.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File size exceeds 50 MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, category);
    setSelectedFile(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" />
          <span>Upload Course Knowledge Documents</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload course syllabi, lecture notes, textbooks, or past question papers to power AI generation.
        </p>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['Syllabus', 'Notes', 'Books', 'Question Papers', 'Reference Materials'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              category === cat
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Drag and Drop Zone */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleChange}
            accept=".pdf,.docx,.txt,.ppt,.pptx"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-xs">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Drag & Drop your document here, or <span className="text-indigo-600 underline">Browse Files</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT, PPT (Max 50MB)</p>
        </div>
      ) : (
        /* Selected File Card */
        <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 truncate max-w-sm">{selectedFile.name}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                <span>• Category: {category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{isLoading ? 'Processing...' : 'Process Document →'}</span>
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-rose-600 mt-3 font-medium">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
