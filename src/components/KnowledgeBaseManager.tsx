/**
 * KnowledgeBaseManager — File/folder management with drag-and-drop, search, and bulk actions.
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback } from 'react';
import { KBFile, KBFolder, FileType } from '../types';
import { Folder, FileText, Plus, Trash, Upload, Search, Download, Tag } from './icons/lucide-shim';

interface Props {
  files: KBFile[];
  folders: KBFolder[];
  setFiles: React.Dispatch<React.SetStateAction<KBFile[]>>;
  setFolders: React.Dispatch<React.SetStateAction<KBFolder[]>>;
  onFileSelect: (file: KBFile) => void;
  activeFileId: string | null;
}

const KnowledgeBaseManager: React.FC<Props> = ({ files, folders, setFiles, setFolders, onFileSelect, activeFileId }) => {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(folders.map((f) => f.id)));

  // Filter files by search
  const filteredFiles = searchQuery
    ? files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  const filesByFolder = (folderId: string | null) =>
    filteredFiles.filter((f) => f.parentFolderId === folderId);

  const unsortedFiles = filesByFolder(null);

  // Create folder
  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const folder: KBFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
    };
    setFolders((prev) => [...prev, folder]);
    setNewFolderName('');
    setShowNewFolder(false);
    setExpandedFolders((prev) => new Set([...prev, folder.id]));
  };

  // Create new file
  const createFile = (folderId: string | null = null) => {
    const name = newFileName.trim() || `New File ${files.length + 1}.md`;
    const file: KBFile = {
      id: `file-${Date.now()}`,
      name: name.endsWith('.md') ? name : name + '.md',
      type: 'markdown',
      content: `# ${name.replace(/\.md$/, '')}\n\n`,
      size: '0.1 KB',
      parentFolderId: folderId,
      isActive: false,
      createdAt: new Date(),
    };
    setFiles((prev) => [file, ...prev]);
    setNewFileName('');
    setShowNewFile(false);
    onFileSelect(file);
  };

  // Delete file
  const deleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Toggle active (context inclusion)
  const toggleActive = (fileId: string) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, isActive: !f.isActive } : f));
  };

  // Delete folder
  const deleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setFiles((prev) => prev.map((f) => f.parentFolderId === folderId ? { ...f, parentFolderId: null } : f));
  };

  // Toggle folder expand
  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  // Drag-and-drop file upload
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    for (const df of droppedFiles) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const type: FileType = df.name.endsWith('.json') ? 'json' : df.name.endsWith('.csv') ? 'csv' : 'text';
        const newFile: KBFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: df.name,
          type,
          content,
          size: `${(content.length / 1024).toFixed(1)} KB`,
          parentFolderId: null,
          isActive: false,
          createdAt: new Date(),
        };
        setFiles((prev) => [newFile, ...prev]);
      };
      reader.readAsText(df);
    }
  }, [setFiles]);

  // Export file
  const exportFile = (file: KBFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="px-3 py-2 border-b border-[#2a2a3e]">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500/50 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#2a2a3e]">
        <button onClick={() => setShowNewFolder(!showNewFolder)} className="p-1.5 rounded hover:bg-[#2a2a3e]" title="New folder">
          <Folder size={14} className="text-gray-400" />
        </button>
        <button onClick={() => setShowNewFile(!showNewFile)} className="p-1.5 rounded hover:bg-[#2a2a3e]" title="New file">
          <Plus size={14} className="text-gray-400" />
        </button>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2a2a3e]">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            placeholder="Folder name..."
            className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500/50"
            autoFocus
          />
          <button onClick={createFolder} className="px-2 py-1 text-xs bg-indigo-600 rounded text-white">Create</button>
        </div>
      )}

      {/* New file input */}
      {showNewFile && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2a2a3e]">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createFile()}
            placeholder="filename.md"
            className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500/50"
            autoFocus
          />
          <button onClick={() => createFile()} className="px-2 py-1 text-xs bg-indigo-600 rounded text-white">Create</button>
        </div>
      )}

      {/* File tree — drop zone */}
      <div
        className={`flex-1 overflow-y-auto px-2 py-2 drop-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Unsorted files */}
        {unsortedFiles.length > 0 && (
          <div className="mb-2">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Unsorted</div>
            {unsortedFiles.map((file) => (
              <FileRow key={file.id} file={file} isActive={activeFileId === file.id} onSelect={onFileSelect} onDelete={deleteFile} onToggleActive={toggleActive} onExport={exportFile} />
            ))}
          </div>
        )}

        {/* Folders */}
        {folders.map((folder) => {
          const folderFiles = filesByFolder(folder.id);
          const isExpanded = expandedFolders.has(folder.id);
          return (
            <div key={folder.id} className="mb-1">
              <div className="flex items-center gap-1 px-1 py-1 hover:bg-[#2a2a3e] rounded cursor-pointer" onClick={() => toggleExpand(folder.id)}>
                <span className="text-[10px] text-gray-500">{isExpanded ? '▼' : '▶'}</span>
                <Folder size={12} className="text-yellow-500" />
                <span className="text-xs flex-1 truncate">{folder.name}</span>
                <span className="text-[10px] text-gray-600">{folderFiles.length}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} className="p-0.5 hover:text-red-400"><Trash size={10} /></button>
              </div>
              {isExpanded && (
                <div className="ml-4">
                  {folderFiles.map((file) => (
                    <FileRow key={file.id} file={file} isActive={activeFileId === file.id} onSelect={onFileSelect} onDelete={deleteFile} onToggleActive={toggleActive} onExport={exportFile} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {files.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Upload size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">Drop files here or create new ones</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-3 py-1.5 border-t border-[#2a2a3e] flex justify-between text-[10px] text-gray-500">
        <span>{files.length} files</span>
        <span>{folders.length} folders</span>
        <span>{files.filter((f) => f.isActive).length} active</span>
      </div>
    </div>
  );
};

/* ─── File Row Sub-component ─── */
const FileRow: React.FC<{
  file: KBFile;
  isActive: boolean;
  onSelect: (f: KBFile) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onExport: (f: KBFile) => void;
}> = ({ file, isActive, onSelect, onDelete, onToggleActive, onExport }) => (
  <div className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer group ${isActive ? 'bg-indigo-600/10 border-l-2 border-indigo-500' : 'hover:bg-[#2a2a3e]'}`}>
    <input type="checkbox" checked={file.isActive} onChange={() => onToggleActive(file.id)} className="w-3 h-3 accent-indigo-500" title="Include in AI context" />
    <FileText size={12} className="text-gray-400 shrink-0" />
    <span className="text-xs flex-1 truncate" onClick={() => onSelect(file)}>{file.name}</span>
    <button onClick={(e) => { e.stopPropagation(); onExport(file); }} className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-indigo-400" title="Export"><Download size={10} /></button>
    <button onClick={(e) => { e.stopPropagation(); onDelete(file.id); }} className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-red-400" title="Delete"><Trash size={10} /></button>
  </div>
);

export default KnowledgeBaseManager;
