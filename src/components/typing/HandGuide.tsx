'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface HandGuideProps {
  targetKey: string;
  onClose?: () => void;
}

export const HandGuide: React.FC<HandGuideProps> = ({ targetKey, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check if the user has dismissed the guide permanently
    if (typeof window !== 'undefined') {
      const skipGuide = localStorage.getItem('typemaster_skip_hand_guide');
      if (skipGuide === 'true') {
        setVisible(false);
      }
    }
  }, []);

  if (!visible) return null;

  const handleSkipPermanently = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typemaster_skip_hand_guide', 'true');
    }
    setVisible(false);
    if (onClose) onClose();
  };

  // Determine hand and finger based on the character
  const getFingerMapping = (char: string): { hand: 'left' | 'right'; finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb' } => {
    const key = char.toUpperCase();
    
    // Left Hand Keys
    if (['Q', 'A', 'Z', '1', '!', '`', '~'].includes(key)) {
      return { hand: 'left', finger: 'pinky' };
    }
    if (['W', 'S', 'X', '2', '@'].includes(key)) {
      return { hand: 'left', finger: 'ring' };
    }
    if (['E', 'D', 'C', '3', '#'].includes(key)) {
      return { hand: 'left', finger: 'middle' };
    }
    if (['R', 'T', 'F', 'G', 'V', 'B', '4', '5', '$', '%'].includes(key)) {
      return { hand: 'left', finger: 'index' };
    }
    
    // Space
    if (key === ' ' || key === 'SPACE') {
      return { hand: 'right', finger: 'thumb' }; // Space defaults to right thumb
    }

    // Right Hand Keys
    if (['Y', 'U', 'H', 'J', 'N', 'M', '6', '7', '^', '&'].includes(key)) {
      return { hand: 'right', finger: 'index' };
    }
    if (['I', 'K', ',', '<', '8', '*'].includes(key)) {
      return { hand: 'right', finger: 'middle' };
    }
    if (['O', 'L', '.', '>', '9', '('].includes(key)) {
      return { hand: 'right', finger: 'ring' };
    }
    
    // Default to right pinky for symbols, semicolons, brackets, etc.
    return { hand: 'right', finger: 'pinky' };
  };

  const info = getFingerMapping(targetKey);

  // Checks if a finger is currently targeted
  const isFingerTargeted = (hand: 'left' | 'right', finger: string) => {
    return info.hand === hand && info.finger === finger;
  };

  // SVG Finger highlight color helper
  const getFingerClass = (hand: 'left' | 'right', finger: string) => {
    return isFingerTargeted(hand, finger)
      ? 'fill-cyber-blue stroke-cyber-blue shadow-glow animate-pulse stroke-2'
      : 'fill-slate-800 stroke-slate-700';
  };

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-2 right-2 flex gap-2">
        <button 
          onClick={handleSkipPermanently}
          className="text-[10px] text-slate-400 hover:text-cyber-blue bg-slate-900 border border-white/5 px-2.5 py-1 rounded-lg transition"
          title="Don't show this finger guide on future lessons"
        >
          Never Show Again
        </button>
        <button 
          onClick={() => { setVisible(false); if (onClose) onClose(); }}
          className="text-slate-400 hover:text-slate-200"
        >
          <X size={16} />
        </button>
      </div>

      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5 self-start">
        <span className="w-2 h-2 rounded-full bg-cyber-blue animate-ping" />
        Hand Positioning Guide
      </h4>
      <p className="text-xs text-slate-400 mb-6 self-start">
        Press key <kbd className="px-2 py-0.5 rounded bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 font-bold">{targetKey === ' ' ? 'SPACE' : targetKey}</kbd> using your <span className="text-white font-bold">{info.hand} {info.finger}</span> finger.
      </p>

      {/* Hand SVGs */}
      <div className="flex gap-16 justify-center items-center py-4 bg-slate-950/20 rounded-xl w-full border border-white/5">
        {/* LEFT HAND */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Left Hand</span>
          <svg width="120" height="120" viewBox="0 0 120 120" className="transform -scale-x-100">
            {/* Wrist / Palm Base */}
            <path d="M40 120 C 40 102, 34 82, 44 65 C 50 62, 70 62, 76 65 C 80 82, 80 102, 80 120 Z" className="fill-slate-900/90 stroke-slate-800" />
            
            {/* Thumb */}
            <path d="M34 82 C 20 80, 12 66, 17 56 C 21 48, 28 56, 32 64 C 36 72, 38 76, 42 78 Z" className={getFingerClass('left', 'thumb')} />
            
            {/* Index Finger */}
            <path d="M44 64 C 42 48, 41 22, 45 14 C 47 10, 52 10, 53 14 C 55 22, 53 48, 51 64 Z" className={getFingerClass('left', 'index')} />
            
            {/* Middle Finger */}
            <path d="M52 62 C 51 44, 52 14, 56 6 C 58 2, 62 2, 63 6 C 65 14, 64 44, 62 62 Z" className={getFingerClass('left', 'middle')} />
            
            {/* Ring Finger */}
            <path d="M62 63 C 61 48, 63 18, 67 10 C 69 6, 73 6, 74 10 C 76 18, 75 48, 72 64 Z" className={getFingerClass('left', 'ring')} />
            
            {/* Pinky Finger */}
            <path d="M72 67 C 71 52, 74 30, 78 22 C 80 18, 84 18, 85 24 C 86 32, 83 52, 80 72 Z" className={getFingerClass('left', 'pinky')} />
          </svg>
        </div>

        {/* RIGHT HAND */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Right Hand</span>
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Wrist / Palm Base */}
            <path d="M40 120 C 40 102, 34 82, 44 65 C 50 62, 70 62, 76 65 C 80 82, 80 102, 80 120 Z" className="fill-slate-900/90 stroke-slate-800" />
            
            {/* Thumb */}
            <path d="M34 82 C 20 80, 12 66, 17 56 C 21 48, 28 56, 32 64 C 36 72, 38 76, 42 78 Z" className={getFingerClass('right', 'thumb')} />
            
            {/* Index Finger */}
            <path d="M44 64 C 42 48, 41 22, 45 14 C 47 10, 52 10, 53 14 C 55 22, 53 48, 51 64 Z" className={getFingerClass('right', 'index')} />
            
            {/* Middle Finger */}
            <path d="M52 62 C 51 44, 52 14, 56 6 C 58 2, 62 2, 63 6 C 65 14, 64 44, 62 62 Z" className={getFingerClass('right', 'middle')} />
            
            {/* Ring Finger */}
            <path d="M62 63 C 61 48, 63 18, 67 10 C 69 6, 73 6, 74 10 C 76 18, 75 48, 72 64 Z" className={getFingerClass('right', 'ring')} />
            
            {/* Pinky Finger */}
            <path d="M72 67 C 71 52, 74 30, 78 22 C 80 18, 84 18, 85 24 C 86 32, 83 52, 80 72 Z" className={getFingerClass('right', 'pinky')} />
          </svg>
        </div>
      </div>
    </div>
  );
};
