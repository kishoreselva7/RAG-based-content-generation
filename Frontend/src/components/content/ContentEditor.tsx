import React, { useState } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Table,
  Check,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ContentEditorProps {
  initialContent: string;
  onSave: (updatedBody: string) => void;
  onRegenerateSection?: () => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  initialContent,
  onSave,
  onRegenerateSection,
}) => {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaved(false);
  };

  const handleSave = () => {
    onSave(content);
    setSaved(true);
  };

  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + '\n' + snippet);
    setSaved(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertSnippet('## Section Heading')}
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition text-xs font-semibold"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSnippet('**Bold Text**')}
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSnippet('*Italic Text*')}
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <button
            onClick={() => insertSnippet('- Bullet point item')}
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSnippet('1. Numbered item')}
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSnippet('```python\n# Python Code Sample\ndef evaluate():\n    pass\n```')}
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              insertSnippet('| Concept | Formula |\n| --- | --- |\n| Loss | $J(\\theta)$ |')
            }
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Table"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Draft Saved</span>
              </>
            ) : (
              <span className="text-amber-600 font-semibold">• Unsaved changes</span>
            )}
          </span>

          {onRegenerateSection && (
            <button
              onClick={onRegenerateSection}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 font-medium px-2.5 py-1 rounded-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="p-4 flex-1">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Edit markdown or text content here..."
          className="w-full h-96 p-4 bg-slate-50/50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-y"
        />
      </div>
    </div>
  );
};
