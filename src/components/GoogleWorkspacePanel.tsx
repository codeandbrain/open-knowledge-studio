/**
 * GoogleWorkspacePanel — Google Drive, Docs, Sheets, Slides, Gmail, Tasks integration.
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { AppUser } from '../types';
import { signInWithGoogle, logoutUser, googleDriveListFiles, googleCreateSheet, googleCreateDoc, getGoogleAccessToken, subscribeAuth } from '../services/googleAuthService';
import { Cloud, X, FileText, Download, Upload, Globe, Mail, CheckSquare, LogIn, LogOut } from './icons/lucide-shim';

interface Props {
  currentFile?: { name: string; content: string };
}

export const GoogleWorkspacePanel: React.FC<Props> = ({ currentFile }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'drive' | 'sheets' | 'docs' | 'gmail'>('overview');
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const unsub = subscribeAuth((u) => setUser(u));
    return unsub;
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      const u = await signInWithGoogle();
      if (u) setToast(`Signed in as ${u.email}`);
    } catch (err: any) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
    setDriveFiles([]);
  };

  const fetchDriveFiles = async () => {
    const token = getGoogleAccessToken();
    if (!token) return;
    try {
      setIsLoading(true);
      const files = await googleDriveListFiles(token);
      setDriveFiles(files);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToGoogleSheet = async () => {
    if (!currentFile) return;
    const token = getGoogleAccessToken();
    if (!token) { setError('Please sign in first'); return; }
    try {
      setIsLoading(true);
      // Parse CSV or split content into rows
      const rows = currentFile.content.split('\n').map((line) => line.split(/[,;\t]/));
      await googleCreateSheet(token, currentFile.name.replace(/\.\w+$/, ''), rows);
      setToast('Created Google Sheet');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const exportToGoogleDoc = async () => {
    if (!currentFile) return;
    const token = getGoogleAccessToken();
    if (!token) { setError('Please sign in first'); return; }
    try {
      setIsLoading(true);
      await googleCreateDoc(token, currentFile.name.replace(/\.\w+$/, ''), currentFile.content);
      setToast('Created Google Doc');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#2a2a3e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-indigo-400" />
          <span className="text-sm font-medium">Google Workspace</span>
        </div>
        {user ? (
          <button onClick={handleSignOut} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400"><LogOut size={12} /> Sign out</button>
        ) : (
          <button onClick={handleSignIn} className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"><LogIn size={12} /> Sign in</button>
        )}
      </div>

      {/* User info */}
      {user && (
        <div className="px-3 py-1.5 border-b border-[#2a2a3e] flex items-center gap-2">
          {user.photoURL && <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />}
          <span className="text-xs">{user.displayName || user.email}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#2a2a3e]">
        {(['overview', 'drive', 'sheets', 'docs', 'gmail'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs capitalize ${activeTab === tab ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {error && <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded mb-2">{error}</div>}
        {toast && <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded mb-2">{toast}</div>}

        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-400">
              <p className="mb-2">Connect your Google account to enable:</p>
              <ul className="space-y-1 ml-3">
                <li>• Cloud backup to your Google Drive</li>
                <li>• Export documents to Google Docs, Sheets, Slides</li>
                <li>• Send reports via Gmail</li>
                <li>• Create Google Tasks from action items</li>
              </ul>
            </div>
            {!user && (
              <button onClick={handleSignIn} disabled={isLoading} className="w-full py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {isLoading ? 'Connecting...' : 'Sign in with Google'}
              </button>
            )}
          </div>
        )}

        {activeTab === 'drive' && (
          <div className="space-y-2">
            <button onClick={fetchDriveFiles} disabled={!user || isLoading} className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50">
              <Cloud size={12} /> {isLoading ? 'Loading...' : 'List Drive Files'}
            </button>
            {driveFiles.length > 0 && (
              <div className="space-y-1">
                {driveFiles.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-2 p-2 rounded bg-[#1a1a2e] border border-[#2a2a3e] text-xs">
                    <FileText size={12} className="text-gray-400" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-[10px] text-gray-500">{f.mimeType?.split('/').pop()}</span>
                  </div>
                ))}
              </div>
            )}
            {!user && <p className="text-xs text-gray-500">Sign in to access your Drive.</p>}
          </div>
        )}

        {activeTab === 'sheets' && (
          <div className="space-y-2">
            <button onClick={exportToGoogleSheet} disabled={!user || !currentFile || isLoading} className="w-full py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1">
              <Upload size={12} /> Export to Google Sheet
            </button>
            {!currentFile && <p className="text-xs text-gray-500">Select a file in the editor first.</p>}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-2">
            <button onClick={exportToGoogleDoc} disabled={!user || !currentFile || isLoading} className="w-full py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1">
              <FileText size={12} /> Export to Google Doc
            </button>
            {!currentFile && <p className="text-xs text-gray-500">Select a file in the editor first.</p>}
          </div>
        )}

        {activeTab === 'gmail' && (
          <div className="space-y-2 text-xs text-gray-400">
            <p>Gmail integration requires signing in with appropriate scopes.</p>
            <p>After signing in, you can compose and send reports directly from the Studio.</p>
          </div>
        )}
      </div>
    </div>
  );
};
