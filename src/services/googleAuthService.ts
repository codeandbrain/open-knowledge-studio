/**
 * Zero-dependency Google sign-in + cloud sync.
 * Uses Google Identity Services (GIS) for OAuth and Drive REST API appDataFolder.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const CLIENT_ID: string = (import.meta as any).env?.VITE_GOOGLE_OAUTH_CLIENT_ID || '';

const SCOPES = [
  'openid', 'email', 'profile',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/tasks',
].join(' ');

let cachedAccessToken: string | null = null;
let currentUser: AppUser | null = null;
const listeners = new Set<(u: AppUser | null) => void>();

function notify() { listeners.forEach((cb) => cb(currentUser)); }

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) { resolve(); return; }
    const existing = document.getElementById('gis-client-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load GIS')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'gis-client-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load GIS'));
    document.head.appendChild(script);
  });
}

async function fetchUserInfo(token: string): Promise<AppUser> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch Google user profile');
  const info = await res.json();
  return { uid: info.sub, email: info.email || null, displayName: info.name || null, photoURL: info.picture || null };
}

export const subscribeAuth = (cb: (u: AppUser | null) => void): (() => void) => {
  listeners.add(cb);
  cb(currentUser);
  return () => listeners.delete(cb);
};

export const getGoogleAccessToken = (): string | null => cachedAccessToken;
export const setGoogleAccessToken = (token: string | null): void => { cachedAccessToken = token; };

export const signInWithGoogle = async (): Promise<AppUser | null> => {
  if (!CLIENT_ID) throw Object.assign(new Error('Google OAuth Client ID is not configured. Set VITE_GOOGLE_OAUTH_CLIENT_ID in .env.'), { code: 'auth/missing-client-id' });
  await loadGisScript();
  return new Promise((resolve, reject) => {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (resp: any) => {
          if (resp.error) { reject(Object.assign(new Error(resp.error_description || resp.error), { code: resp.error })); return; }
          cachedAccessToken = resp.access_token;
          try { const user = await fetchUserInfo(resp.access_token); currentUser = user; notify(); resolve(user); } catch (err) { reject(err); }
        },
        error_callback: (err: any) => { reject(Object.assign(new Error(err?.message || 'Google sign-in cancelled.'), { code: err?.type === 'popup_closed' ? 'auth/popup-closed-by-user' : 'auth/error' })); },
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) { reject(err); }
  });
};

export const logoutUser = async (): Promise<void> => {
  try { if (cachedAccessToken && (window as any).google?.accounts?.oauth2) (window as any).google.accounts.oauth2.revoke(cachedAccessToken, () => {}); } finally {
    cachedAccessToken = null; currentUser = null; notify();
  }
};

/* ─── Drive appDataFolder Cloud Sync ─── */
const DOC_FILE_NAME = 'zarish-open-knowledge-studio-user-data.json';

async function findAppDataFileId(token: string): Promise<string | null> {
  const params = new URLSearchParams({ spaces: 'appDataFolder', q: `name = '${DOC_FILE_NAME}'`, fields: 'files(id,name)' });
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive list failed: HTTP ${res.status}`);
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

export const getUserDoc = async (): Promise<Record<string, any> | null> => {
  const token = cachedAccessToken;
  if (!token) return null;
  const fileId = await findAppDataFileId(token);
  if (!fileId) return null;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive read failed: HTTP ${res.status}`);
  return res.json();
};

export const saveUserDoc = async (data: Record<string, any>): Promise<void> => {
  const token = cachedAccessToken;
  if (!token) return;
  const existingId = await findAppDataFileId(token);
  const body = JSON.stringify(data);
  if (existingId) {
    const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body,
    });
    if (!res.ok) throw new Error(`Drive update failed: HTTP ${res.status}`);
    return;
  }
  const boundary = `zks_${Math.random().toString(36).slice(2)}`;
  const metadata = { name: DOC_FILE_NAME, parents: ['appDataFolder'] };
  const multipartBody = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipartBody,
  });
  if (!res.ok) throw new Error(`Drive create failed: HTTP ${res.status}`);
};

export const updateUserDoc = async (partial: Record<string, any>): Promise<void> => {
  const existing = (await getUserDoc()) || {};
  await saveUserDoc({ ...existing, ...partial });
};

/* ─── Google Workspace REST API helpers ─── */
export async function googleDriveListFiles(token: string, query?: string): Promise<any[]> {
  const params = new URLSearchParams({ fields: 'files(id,name,mimeType,modifiedTime,size)' });
  if (query) params.set('q', query);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive list failed: ${res.status}`);
  return (await res.json()).files || [];
}

export async function googleCreateSheet(token: string, title: string, rows: string[][]): Promise<any> {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: { title }, sheets: [{ properties: { title: 'Sheet1' } }] }),
  });
  if (!res.ok) throw new Error(`Sheets create failed: ${res.status}`);
  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=RAW`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: rows }),
  });
  return data;
}

export async function googleCreateDoc(token: string, title: string, content: string): Promise<any> {
  const res = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body: { content: [{ paragraph: { elements: [{ textRun: { content } }] } }] } }),
  });
  if (!res.ok) throw new Error(`Docs create failed: ${res.status}`);
  return res.json();
}
