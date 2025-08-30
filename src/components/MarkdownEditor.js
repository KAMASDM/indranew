// MarkdownEditor.js
'use client';
import { useState } from 'react';

export default function MarkdownEditor({ value, onChange }) {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <div className="bg-white rounded border border-gray-200">
      <div className="flex justify-between mb-2">
        <button type="button" className={`px-3 py-1 rounded-t ${!showPreview ? 'bg-teal-100' : ''}`} onClick={()=>setShowPreview(false)}>Edit</button>
        <button type="button" className={`px-3 py-1 rounded-t ${showPreview ? 'bg-teal-100' : ''}`} onClick={()=>setShowPreview(true)}>Preview</button>
      </div>
      {!showPreview ? (
        <textarea
          className="w-full min-h-[200px] p-2 border-none outline-none text-gray-900 bg-white font-mono"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Write your blog content in Markdown..."
        />
      ) : (
        <div className="prose prose-lg max-w-none p-4 bg-gray-50 min-h-[200px]" dangerouslySetInnerHTML={{ __html: window.marked ? window.marked.parse(value) : value }} />
      )}
      <div className="text-xs text-gray-500 mt-2">Supports Markdown. For images: <code>![](image-url)</code></div>
    </div>
  );
}
