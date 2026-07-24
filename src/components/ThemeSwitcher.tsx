/**
 * ThemeSwitcher — Dark/light mode toggle with localStorage persistence.
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Moon, Sun } from './icons/lucide-shim';

interface Props {
  isDark: boolean;
  onToggle: () => void;
}

const ThemeSwitcher: React.FC<Props> = ({ isDark, onToggle }) => (
  <button
    onClick={onToggle}
    className="p-1.5 rounded-lg hover:bg-[#2a2a3e] transition-colors"
    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-400" />}
  </button>
);

export default ThemeSwitcher;
