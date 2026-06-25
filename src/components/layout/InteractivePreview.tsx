'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Keyboard, Zap, Sparkles } from 'lucide-react';

interface KeycapState {
  [key: string]: boolean;
}

export const InteractivePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chart' | 'matrix'>('chart');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Key heatmap state
  const [pressedKeys, setPressedKeys] = useState<KeycapState>({});

  // Speed data representing a premium typist session
  const chartData = [
    { time: 0, wpm: 45, acc: 98, key: 'k' },
    { time: 2, wpm: 72, acc: 100, key: 'e' },
    { time: 4, wpm: 91, acc: 99, key: 'y' },
    { time: 6, wpm: 84, acc: 97, key: 's' },
    { time: 8, wpm: 108, acc: 98, key: 't' },
    { time: 10, wpm: 122, acc: 100, key: 'r' },
    { time: 12, wpm: 114, acc: 99, key: 'a' },
    { time: 14, wpm: 129, acc: 98, key: ' ' },
    { time: 16, wpm: 121, acc: 100, key: 'p' },
    { time: 18, wpm: 135, acc: 99, key: 'r' },
    { time: 20, wpm: 128, acc: 100, key: 'o' },
  ];

  // SVG Chart path calculation
  const svgWidth = 320;
  const svgHeight = 70;
  const paddingX = 10;
  const paddingY = 10;

  const points = chartData.map((d, index) => {
    const x = paddingX + (index / (chartData.length - 1)) * (svgWidth - paddingX * 2);
    // Scale WPM from 30 to 140
    const minWpm = 30;
    const maxWpm = 140;
    const y = svgHeight - paddingY - ((d.wpm - minWpm) / (maxWpm - minWpm)) * (svgHeight - paddingY * 2);
    return { x, y };
  });

  // Build SVG path d string
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Cubic bezier curve approximation for smooth path
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 3;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (2 * (p.x - prev.x)) / 3;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  // Fill path closing at bottom
  const fillD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Track global key presses to highlight virtual keyboard (ignoring sensitive fields)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.key) return;

      // Security check: Ignore keypresses inside password input
      const activeEl = document.activeElement;
      if (activeEl) {
        const type = activeEl.getAttribute('type');
        if (type === 'password') return;
      }

      let key = e.key.toUpperCase();
      // Remap some keys for simpler matching
      if (e.code === 'Space') key = 'SPACE';
      if (key === 'BACKSPACE') key = 'BSP';
      if (key === 'CONTROL') key = 'CTRL';

      setPressedKeys((prev) => ({ ...prev, [key]: true }));

      // Fade out keyboard outline light after a short delay
      setTimeout(() => {
        setPressedKeys((prev) => ({ ...prev, [key]: false }));
      }, 300);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - svgRect.left;
    
    // Find closest index based on X position
    const step = svgRect.width / chartData.length;
    const index = Math.max(0, Math.min(chartData.length - 1, Math.round(relativeX / step)));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Keyboard Rows config for rendering the response matrix (compact key names)
  const keyboardRows = [
    ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BSP'],
    ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '\\'],
    ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', 'ENT'],
    ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', 'SHIFT'],
    ['CTRL', 'ALT', 'SPACE', 'ALT', 'FN']
  ];

  return (
    <div 
      ref={containerRef}
      className="w-full bg-[#0c0d12]/50 border border-white/5 backdrop-blur-md rounded-2xl flex flex-col p-3 relative overflow-hidden group select-none transition-all duration-300 hover:border-white/10"
    >
      {/* Dynamic Background glow effects */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/15 transition-all duration-300" />
      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
        <div className="flex items-center gap-1">
          <Zap className="text-orange-500 animate-pulse animate-duration-1000" size={13} />
          <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">Live Arena Preview</span>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'chart' 
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <Activity size={10} />
            Speed Curve
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'matrix' 
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <Keyboard size={10} />
            Live Keys
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="h-[124px] relative flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'chart' ? (
            <motion.div
              key="chart-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full justify-between"
            >
              {/* SVG interactive chart */}
              <div className="relative w-full h-[70px] mt-1 bg-black/20 rounded-lg overflow-hidden border border-white/5">
                <svg
                  className="w-full h-full cursor-crosshair"
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  preserveAspectRatio="none"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Grid Lines */}
                  <line x1={0} y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="rgba(255,255,255,0.02)" strokeWidth={0.5} />
                  <line x1={0} y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="rgba(255,255,255,0.02)" strokeWidth={0.5} />
                  <line x1={0} y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="rgba(255,255,255,0.02)" strokeWidth={0.5} />
                  
                  {/* Spline Fill */}
                  <path d={fillD} fill="url(#chartGlow)" />
                  
                  {/* Spline Line */}
                  <path d={pathD} fill="none" stroke="#f97316" strokeWidth={1.5} className="drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]" />

                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Interactive Scrubber and Highlights */}
                  {hoverIndex !== null && (
                    <>
                      {/* Vertical line */}
                      <line
                        x1={points[hoverIndex].x}
                        y1={0}
                        x2={points[hoverIndex].x}
                        y2={svgHeight}
                        stroke="rgba(249,115,22,0.35)"
                        strokeWidth={1}
                        strokeDasharray="2,2"
                      />
                      
                      {/* Glow node circle */}
                      <circle
                        cx={points[hoverIndex].x}
                        cy={points[hoverIndex].y}
                        r={4}
                        fill="#f97316"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                      <circle
                        cx={points[hoverIndex].x}
                        cy={points[hoverIndex].y}
                        r={8}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth={1}
                        className="animate-ping opacity-60"
                      />
                    </>
                  )}
                </svg>
              </div>

              {/* Stats Panel */}
              <div className="grid grid-cols-4 gap-1 mt-2 bg-[#08090d]/60 border border-white/5 rounded-xl p-1">
                <div className="flex flex-col px-1 py-0.5 border-r border-white/5">
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Speed</span>
                  <span className="text-[10px] font-extrabold text-orange-500 tracking-tight">
                    {hoverIndex !== null ? `${chartData[hoverIndex].wpm} WPM` : '128 WPM'}
                  </span>
                </div>
                <div className="flex flex-col px-1 py-0.5 border-r border-white/5">
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Accuracy</span>
                  <span className="text-[10px] font-extrabold text-slate-200">
                    {hoverIndex !== null ? `${chartData[hoverIndex].acc}%` : '99.2%'}
                  </span>
                </div>
                <div className="flex flex-col px-1 py-0.5 border-r border-white/5">
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Last Key</span>
                  <span className="text-[10px] font-mono font-bold text-slate-200">
                    {hoverIndex !== null ? `'${chartData[hoverIndex].key}'` : "'o'"}
                  </span>
                </div>
                <div className="flex flex-col px-1 py-0.5">
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Rank</span>
                  <span className="text-[9px] font-extrabold text-orange-400/90 tracking-tight flex items-center gap-0.5">
                    <Sparkles size={8} /> Top 1.5%
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="matrix-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center h-full space-y-1 select-none"
            >
              <div className="w-full text-center text-[7px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                Type keys on your keyboard to test latency
              </div>
              <div className="flex flex-col gap-0.5 w-full items-center">
                {keyboardRows.map((row, rIndex) => (
                  <div key={rIndex} className="flex gap-0.5 justify-center w-full">
                    {row.map((keyLabel, kIndex) => {
                      const isPressed = pressedKeys[keyLabel];
                      const isSpace = keyLabel === 'SPACE';
                      const isShift = keyLabel === 'SHIFT';

                      let widthClass = 'w-[18px]';
                      if (isSpace) widthClass = 'w-[90px]';
                      else if (isShift) widthClass = 'w-[32px]';
                      else if (keyLabel === 'BSP' || keyLabel === 'TAB') widthClass = 'w-[24px]';
                      else if (keyLabel === 'CAPS' || keyLabel === 'ENT') widthClass = 'w-[28px]';

                      return (
                        <div
                          key={kIndex}
                          className={`h-4.5 rounded-[3px] border text-[7px] font-bold flex items-center justify-center transition-all duration-150 select-none ${widthClass} ${
                            isPressed
                              ? 'bg-orange-500 border-orange-500 text-white scale-[1.08] shadow-[0_0_8px_rgba(249,115,22,0.6)] z-10'
                              : 'bg-black/40 border-white/5 text-slate-400 hover:border-orange-500/20 hover:text-slate-200'
                          }`}
                        >
                          {keyLabel === 'SPACE' ? '' : keyLabel}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
