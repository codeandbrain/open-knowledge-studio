/**
 * Zero-dependency Lucide icon shim — renders Lucide icons as inline SVG.
 * No lucide-react package required.
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

function make(name: string, paths: React.ReactNode[], viewBox = '0 0 24 24') {
  const Icon: React.FC<IconProps> = ({ size = 20, className = '', color }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      data-lucide={name}
    >
      {paths}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}

export const Sparkles = make('sparkles', [
  <path key="1" d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 1-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />,
  <path key="2" d="M20 3v4" />,
  <path key="3" d="M22 5h-4" />,
  <path key="4" d="M4 17v2" />,
  <path key="5" d="M5 18H3" />,
]);

export const Brain = make('brain', [
  <path key="1" d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />,
  <path key="2" d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />,
  <path key="3" d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />,
  <path key="4" d="M17.599 6.5a3 3 0 0 0 .399-1.375" />,
  <path key="5" d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />,
  <path key="6" d="M3.477 10.896a4 4 0 0 1 .585-.396" />,
  <path key="7" d="M19.938 10.5a4 4 0 0 1 .585.396" />,
  <path key="8" d="M6 18a4 4 0 0 1-1.967-.516" />,
  <path key="9" d="M19.967 17.484A4 4 0 0 1 18 18" />,
]);

export const Code = make('code', [
  <polyline key="1" points="16 18 22 12 16 6" />,
  <polyline key="2" points="8 6 2 12 8 18" />,
]);

export const ShieldCheck = make('shield-check', [
  <path key="1" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />,
  <path key="2" d="m9 12 2 2 4-4" />,
]);

export const Database = make('database', [
  <ellipse key="1" cx="12" cy="5" rx="9" ry="3" />,
  <path key="2" d="M3 5V19A9 3 0 0 0 21 19V5" />,
  <path key="3" d="M3 12A9 3 0 0 0 21 12" />,
]);

export const GitMerge = make('git-merge', [
  <circle key="1" cx="18" cy="18" r="3" />,
  <circle key="2" cx="6" cy="6" r="3" />,
  <path key="3" d="M6 21V9a9 9 0 0 0 9 9" />,
]);

export const Activity = make('activity', [
  <path key="1" d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />,
]);

export const BarChart = make('bar-chart', [
  <line key="1" x1="18" y1="20" x2="18" y2="10" />,
  <line key="2" x1="12" y1="20" x2="12" y2="4" />,
  <line key="3" x1="6" y1="20" x2="6" y2="14" />,
]);

export const Edit = make('edit', [
  <path key="1" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />,
  <path key="2" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />,
]);

export const BookOpen = make('book-open', [
  <path key="1" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />,
  <path key="2" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />,
]);

export const X = make('x', [
  <line key="1" x1="18" y1="6" x2="6" y2="18" />,
  <line key="2" x1="6" y1="6" x2="18" y2="18" />,
]);

export const Search = make('search', [
  <circle key="1" cx="11" cy="11" r="8" />,
  <line key="2" x1="21" y1="21" x2="16.65" y2="16.65" />,
]);

export const Folder = make('folder', [
  <path key="1" d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />,
]);

export const FileText = make('file-text', [
  <path key="1" d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />,
  <polyline key="2" points="14 2 14 8 20 8" />,
  <line key="3" x1="16" y1="13" x2="8" y2="13" />,
  <line key="4" x1="16" y1="17" x2="8" y2="17" />,
  <line key="5" x1="10" y1="9" x2="8" y2="9" />,
]);

export const MessageSquare = make('message-square', [
  <path key="1" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
]);

export const Settings = make('settings', [
  <path key="1" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />,
  <circle key="2" cx="12" cy="12" r="3" />,
]);

export const Send = make('send', [
  <path key="1" d="m22 2-7 20-4-9-9-4Z" />,
  <path key="2" d="M22 2 11 13" />,
]);

export const Mic = make('mic', [
  <path key="1" d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />,
  <path key="2" d="M19 10v2a7 7 0 0 1-14 0v-2" />,
  <line key="3" x1="12" y1="19" x2="12" y2="22" />,
]);

export const Play = make('play', [
  <polygon key="1" points="5 3 19 12 5 21 5 3" />,
]);

export const Pause = make('pause', [
  <rect key="1" x="14" y="4" width="4" height="16" rx="1" />,
  <rect key="2" x="6" y="4" width="4" height="16" rx="1" />,
]);

export const Trash = make('trash', [
  <path key="1" d="M3 6h18" />,
  <path key="2" d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />,
  <path key="3" d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
]);

export const Plus = make('plus', [
  <line key="1" x1="12" y1="5" x2="12" y2="19" />,
  <line key="2" x1="5" y1="12" x2="19" y2="12" />,
]);

export const Download = make('download', [
  <path key="1" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />,
  <polyline key="2" points="7 10 12 15 17 10" />,
  <line key="3" x1="12" y1="15" x2="12" y2="3" />,
]);

export const Upload = make('upload', [
  <path key="1" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />,
  <polyline key="2" points="17 8 12 3 7 8" />,
  <line key="3" x1="12" y1="3" x2="12" y2="15" />,
]);

export const Copy = make('copy', [
  <rect key="1" x="9" y="9" width="13" height="13" rx="2" ry="2" />,
  <path key="2" d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />,
]);

export const Moon = make('moon', [
  <path key="1" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
]);

export const Sun = make('sun', [
  <circle key="1" cx="12" cy="12" r="4" />,
  <path key="2" d="M12 2v2" />,
  <path key="3" d="M12 20v2" />,
  <path key="4" d="m4.93 4.93 1.41 1.41" />,
  <path key="5" d="m17.66 17.66 1.41 1.41" />,
  <path key="6" d="M2 12h2" />,
  <path key="7" d="M20 12h2" />,
  <path key="8" d="m6.34 17.66-1.41 1.41" />,
  <path key="9" d="m19.07 4.93-1.41 1.41" />,
]);

export const Cloud = make('cloud', [
  <path key="1" d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
]);

export const Wifi = make('wifi', [
  <path key="1" d="M12 20h.01" />,
  <path key="2" d="M2 8.82a15 15 0 0 1 20 0" />,
  <path key="3" d="M5 12.859a10 10 0 0 1 14 0" />,
  <path key="4" d="M8.5 16.429a5 5 0 0 1 7 0" />,
]);

export const WifiOff = make('wifi-off', [
  <line key="1" x1="2" y1="2" x2="22" y2="22" />,
  <path key="2" d="M8.5 16.429a5 5 0 0 1 7 0" />,
  <path key="3" d="M12 20h.01" />,
  <path key="4" d="M16.5 16.5a15 15 0 0 1 3.7 1.17" />,
  <path key="5" d="M12 12c2.5 0 4.7 1 6.4 2.6" />,
]);

export const Layout = make('layout', [
  <rect key="1" x="3" y="3" width="18" height="18" rx="2" ry="2" />,
  <line key="2" x1="3" y1="9" x2="21" y2="9" />,
  <line key="3" x1="9" y1="21" x2="9" y2="9" />,
]);

export const Menu = make('menu', [
  <line key="1" x1="4" y1="12" x2="20" y2="12" />,
  <line key="2" x1="4" y1="6" x2="20" y2="6" />,
  <line key="3" x1="4" y1="18" x2="20" y2="18" />,
]);

export const Clock = make('clock', [
  <circle key="1" cx="12" cy="12" r="10" />,
  <polyline key="2" points="12 6 12 12 16 14" />,
]);

export const Users = make('users', [
  <path key="1" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />,
  <circle key="2" cx="9" cy="7" r="4" />,
  <path key="3" d="M22 21v-2a4 4 0 0 0-3-3.87" />,
  <path key="4" d="M16 3.13a4 4 0 0 1 0 7.75" />,
]);

export const Check = make('check', [
  <polyline key="1" points="20 6 9 17 4 12" />,
]);

export const AlertTriangle = make('alert-triangle', [
  <path key="1" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />,
  <line key="2" x1="12" y1="9" x2="12" y2="13" />,
  <line key="3" x1="12" y1="17" x2="12.01" y2="17" />,
]);

export const Eye = make('eye', [
  <path key="1" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />,
  <circle key="2" cx="12" cy="12" r="3" />,
]);

export const EyeOff = make('eye-off', [
  <path key="1" d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />,
  <path key="2" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />,
  <path key="3" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />,
  <line key="4" x1="2" y1="2" x2="22" y2="22" />,
]);

export const Zap = make('zap', [
  <polygon key="1" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
]);

export const Globe = make('globe', [
  <circle key="1" cx="12" cy="12" r="10" />,
  <line key="2" x1="2" y1="12" x2="22" y2="12" />,
  <path key="3" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />,
]);

export const Layers = make('layers', [
  <polygon key="1" points="12 2 2 7 12 12 22 7 12 2" />,
  <polyline key="2" points="2 17 12 22 22 17" />,
  <polyline key="3" points="2 12 12 17 22 12" />,
]);

export const Template = make('template', [
  <rect key="1" x="3" y="3" width="18" height="18" rx="2" ry="2" />,
  <line key="2" x1="3" y1="9" x2="21" y2="9" />,
  <line key="3" x1="9" y1="21" x2="9" y2="9" />,
]);

export const Kanban = make('kanban', [
  <rect key="1" x="3" y="3" width="5" height="18" rx="1" />,
  <rect key="2" x="10" y="3" width="5" height="12" rx="1" />,
  <rect key="3" x="17" y="3" width="5" height="15" rx="1" />,
]);
export const MicOff = make('mic-off', [
  <line key="1" x1="2" y1="2" x2="22" y2="22" />,
  <path key="2" d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />,
  <path key="3" d="M5 10v2a7 7 0 0 0 12 5" />,
  <line key="4" x1="12" y1="19" x2="12" y2="22" />,
]);

export const Loader2 = make('loader-2', [
  <path key="1" d="M21 12a9 9 0 1 1-6.219-8.56" />,
]);

export const Tag = make('tag', [
  <path key="1" d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />,
  <circle key="2" cx="7.5" cy="7.5" r=".5" fill="currentColor" />,
]);

export const Mail = make('mail', [
  <rect key="1" x="2" y="4" width="20" height="16" rx="2" />,
  <path key="2" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />,
]);

export const CheckSquare = make('check-square', [
  <polyline key="1" points="9 11 12 14 22 4" />,
  <path key="2" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
]);

export const LogIn = make('log-in', [
  <path key="1" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />,
  <polyline key="2" points="10 17 15 12 10 7" />,
  <line key="3" x1="15" y1="12" x2="3" y2="12" />,
]);

export const LogOut = make('log-out', [
  <path key="1" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />,
  <polyline key="2" points="16 17 21 12 16 7" />,
  <line key="3" x1="21" y1="12" x2="9" y2="12" />,
]);
