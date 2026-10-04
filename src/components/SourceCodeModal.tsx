import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Server, Database, ShieldCheck } from 'lucide-react';
import { SOURCE_CODE_FILES, CodeFileEntry } from '../data/sourceCodeBundle';

interface SourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFileEntry>(SOURCE_CODE_FILES[0]);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (file: CodeFileEntry) => {
    navigator.clipboard.writeText(file.code);
    setCopiedPath(file.path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDownloadSingle = (file: CodeFileEntry) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.replace(/^\//, '').replace(/\//g, '_');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white border border-neutral-200 rounded-xl w-full max-w-6xl h-[86vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1B2A49] text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-[#C89B3C]" />
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                InfinityFree PHP + MySQL + Node.js CCTV Source Code & Deployment Package
              </h2>
              <p className="text-xs text-neutral-300">
                Complete commented files ready for InfinityFree (htdocs + phpMyAdmin) & standalone Node.js RTSP server
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close code modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          {/* File Tree Sidebar */}
          <aside className="w-72 bg-[#FBF9F5] border-r border-neutral-200 p-4 overflow-y-auto shrink-0">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Project Files
            </div>
            <div className="space-y-1.5">
              {SOURCE_CODE_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#1B2A49] text-white font-medium'
                        : 'text-neutral-700 hover:bg-neutral-200/70'
                    }`}
                  >
                    {file.category === 'Database & Config' ? (
                      <Database className="w-4 h-4 shrink-0 mt-0.5 text-[#C8102E]" />
                    ) : file.category === 'Node.js CCTV Server' ? (
                      <Server className="w-4 h-4 shrink-0 mt-0.5 text-[#C89B3C]" />
                    ) : file.category === 'Deployment Guide' ? (
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <FileCode className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                    )}
                    <div className="min-w-0">
                      <div className="font-mono-tabular truncate">{file.path}</div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-neutral-300' : 'text-neutral-500'
                        }`}
                      >
                        {file.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0F172A] text-neutral-100">
            <div className="flex items-center justify-between px-6 py-3 bg-[#1E293B] border-b border-neutral-700">
              <div className="min-w-0">
                <div className="font-mono-tabular text-sm font-semibold text-white">
                  {selectedFile.path}
                </div>
                <p className="text-xs text-neutral-300 truncate mt-0.5">
                  {selectedFile.description}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(selectedFile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors whitespace-nowrap"
                >
                  {copiedPath === selectedFile.path ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy File
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownloadSingle(selectedFile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C8102E] hover:bg-[#A50D26] text-white transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download {selectedFile.path.split('/').pop()}
                </button>
              </div>
            </div>
            <pre className="flex-1 p-6 overflow-auto text-xs font-mono leading-relaxed text-neutral-200 select-all">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
