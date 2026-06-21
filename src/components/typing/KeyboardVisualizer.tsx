'use client';

import React from 'react';

interface KeyboardVisualizerProps {
  targetKey: string;
  errorKey?: string;
}

export const KeyboardVisualizer: React.FC<KeyboardVisualizerProps> = ({ targetKey, errorKey }) => {
  const normTarget = targetKey.toUpperCase();
  const normError = errorKey ? errorKey.toUpperCase() : '';

  const rows = [
    [
      { label: '`', key: '`', width: 'w-10' },
      { label: '1', key: '1', width: 'w-10' },
      { label: '2', key: '2', width: 'w-10' },
      { label: '3', key: '3', width: 'w-10' },
      { label: '4', key: '4', width: 'w-10' },
      { label: '5', key: '5', width: 'w-10' },
      { label: '6', key: '6', width: 'w-10' },
      { label: '7', key: '7', width: 'w-10' },
      { label: '8', key: '8', width: 'w-10' },
      { label: '9', key: '9', width: 'w-10' },
      { label: '0', key: '0', width: 'w-10' },
      { label: '-', key: '-', width: 'w-10' },
      { label: '=', key: '=', width: 'w-10' },
      { label: 'Delete', key: 'BACKSPACE', width: 'w-16 flex-grow' },
    ],
    [
      { label: 'Tab', key: 'TAB', width: 'w-14' },
      { label: 'Q', key: 'Q', width: 'w-10' },
      { label: 'W', key: 'W', width: 'w-10' },
      { label: 'E', key: 'E', width: 'w-10' },
      { label: 'R', key: 'R', width: 'w-10' },
      { label: 'T', key: 'T', width: 'w-10' },
      { label: 'Y', key: 'Y', width: 'w-10' },
      { label: 'U', key: 'U', width: 'w-10' },
      { label: 'I', key: 'I', width: 'w-10' },
      { label: 'O', key: 'O', width: 'w-10' },
      { label: 'P', key: 'P', width: 'w-10' },
      { label: '[', key: '[', width: 'w-10' },
      { label: ']', key: ']', width: 'w-10' },
      { label: '\\', key: '\\', width: 'w-12' },
    ],
    [
      { label: 'Caps', key: 'CAPSLOCK', width: 'w-16' },
      { label: 'A', key: 'A', width: 'w-10' },
      { label: 'S', key: 'S', width: 'w-10' },
      { label: 'D', key: 'D', width: 'w-10' },
      { label: 'F', key: 'F', width: 'w-10' },
      { label: 'G', key: 'G', width: 'w-10' },
      { label: 'H', key: 'H', width: 'w-10' },
      { label: 'J', key: 'J', width: 'w-10' },
      { label: 'K', key: 'K', width: 'w-10' },
      { label: 'L', key: 'L', width: 'w-10' },
      { label: ';', key: ';', width: 'w-10' },
      { label: "'", key: "'", width: 'w-10' },
      { label: 'Enter', key: 'ENTER', width: 'w-20 flex-grow' },
    ],
    [
      { label: 'Shift', key: 'SHIFT', width: 'w-20' },
      { label: 'Z', key: 'Z', width: 'w-10' },
      { label: 'X', key: 'X', width: 'w-10' },
      { label: 'C', key: 'C', width: 'w-10' },
      { label: 'V', key: 'V', width: 'w-10' },
      { label: 'B', key: 'B', width: 'w-10' },
      { label: 'N', key: 'N', width: 'w-10' },
      { label: 'M', key: 'M', width: 'w-10' },
      { label: ',', key: ',', width: 'w-10' },
      { label: '.', key: '.', width: 'w-10' },
      { label: '/', key: '/', width: 'w-10' },
      { label: 'Shift', key: 'SHIFT_RIGHT', width: 'w-20' },
    ],
    [
      { label: 'Ctrl', key: 'CONTROL', width: 'w-12' },
      { label: 'Opt', key: 'ALT', width: 'w-12' },
      { label: 'Cmd', key: 'META', width: 'w-12' },
      { label: 'Spacebar', key: ' ', width: 'w-64 flex-grow' },
      { label: 'Cmd', key: 'META_RIGHT', width: 'w-12' },
      { label: 'Opt', key: 'ALT_RIGHT', width: 'w-12' },
    ],
  ];

  // Helper to determine key highlight color
  const getKeyHighlight = (key: string) => {
    // If this key maps to the target
    if (key === normTarget || (key === ' ' && normTarget === 'SPACE')) {
      return 'border-cyber-blue bg-cyber-blue/20 text-cyber-blue shadow-[0_0_12px_rgba(0,242,254,0.4)] font-extrabold animate-pulse';
    }
    // If user typed the wrong key
    if (key === normError) {
      return 'border-cyber-red bg-cyber-red/20 text-cyber-red shadow-[0_0_10px_rgba(244,63,94,0.4)] font-bold';
    }
    return 'border-white/5 bg-slate-900/30 text-slate-400';
  };

  return (
    <div className="glass-card p-4 rounded-2xl w-full max-w-2xl mx-auto overflow-x-auto select-none border border-white/5 bg-slate-950/40">
      <div className="min-w-[620px] space-y-1.5 font-mono">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 justify-center">
            {row.map((item, kIdx) => (
              <div
                key={`${rIdx}-${kIdx}`}
                className={`h-9 border text-center flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${item.width} ${getKeyHighlight(
                  item.key
                )}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
