'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Sliders, Paintbrush, Volume2, Monitor, Layout, 
  Sparkles, Keyboard, Check, VolumeX, Eye
} from 'lucide-react';

const THEME_COLORS = [
  { id: 'cyan', name: 'Cyber Cyan', hex: '#00f2fe' },
  { id: 'green', name: 'Emerald Green', hex: '#10b981' },
  { id: 'purple', name: 'Violet Purple', hex: '#8b5cf6' },
  { id: 'pink', name: 'Hot Pink', hex: '#ec4899' },
  { id: 'orange', name: 'Sunset Orange', hex: '#f97316' },
  { id: 'amber', name: 'Amber Gold', hex: '#f59e0b' },
  { id: 'teal', name: 'Teal Horizon', hex: '#0d9488' },
  { id: 'indigo', name: 'Indigo Night', hex: '#4f46e5' },
  { id: 'red', name: 'Crimson Red', hex: '#ef4444' },
  { id: 'mint', name: 'Mint Fresh', hex: '#34d399' }
];

const FONTS_SANS = [
  'Outfit', 'Inter', 'Roboto', 'Poppins', 'Montserrat', 
  'Open Sans', 'Lato', 'Nunito', 'Raleway', 'Ubuntu'
];

const FONTS_MONO = [
  'Fira Code', 'JetBrains Mono', 'Inconsolata', 'Source Code Pro', 'Ubuntu Mono', 
  'Courier Prime', 'Anonymous Pro', 'IBM Plex Mono', 'Space Mono', 'DM Mono'
];

const SOUNDS = [
  { id: 'off', label: 'off' },
  { id: 'click', label: 'click' },
  { id: 'beep', label: 'beep' },
  { id: 'pop', label: 'pop' },
  { id: 'nk creams', label: 'nk creams' },
  { id: 'typewriter', label: 'typewriter' },
  { id: 'osu', label: 'osu' },
  { id: 'hitmarker', label: 'hitmarker' },
  { id: 'sine', label: 'sine' },
  { id: 'sawtooth', label: 'sawtooth' },
  { id: 'square', label: 'square' },
  { id: 'triangle', label: 'triangle' },
  { id: 'pentatonic', label: 'pentatonic' },
  { id: 'wholetone', label: 'wholetone' },
  { id: 'fist fight', label: 'fist fight' },
  { id: 'rubber keys', label: 'rubber keys' },
  { id: 'fart', label: 'fart' },
  { id: 'akko lavenders', label: 'akko lavenders' },
  { id: 'cherrymx black abs', label: 'cherrymx black abs' },
  { id: 'cherrymx black pbt', label: 'cherrymx black pbt' },
  { id: 'cherrymx blue abs', label: 'cherrymx blue abs' },
  { id: 'cherrymx blue pbt', label: 'cherrymx blue pbt' },
  { id: 'cherrymx brown pbt', label: 'cherrymx brown pbt' },
  { id: 'kalih box white', label: 'kalih box white' },
  { id: 'razer green', label: 'razer green' },
  { id: 'tealios v2', label: 'tealios v2' },
  { id: 'trust gxt', label: 'trust gxt' },
  { id: 'anvil', label: 'anvil' },
  { id: 'laser', label: 'laser' },
  { id: 'drum', label: 'drum' }
];

export const SettingsView: React.FC = () => {
  const {
    themeMode, setThemeMode,
    accentColor, setAccentColor,
    fontFamily, setFontFamily,
    soundName, setSoundName,
    soundVolume, setSoundVolume,
    playClickSound,
    caretBlinking, setCaretBlinking,
    cursorStyle, setCursorStyle
  } = useApp();

  const [testText, setTestText] = useState('');

  const handleSoundSelect = (soundId: string) => {
    setSoundName(soundId);
    // Play a quick test sound
    if (soundId !== 'off') {
      setTimeout(() => {
        playClickSound('a');
      }, 50);
    }
  };

  const handleTestTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTestText(val);
    if (val.length > testText.length) {
      const typedChar = val[val.length - 1];
      playClickSound(typedChar);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue">
            <Sliders size={20} />
          </div>
          <div>
            <span className="text-[10px] text-cyber-blue font-bold uppercase tracking-wider">Preferences Panel</span>
            <h2 className="text-lg font-bold text-white leading-tight">Personalize Your Typing Space</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Columns - Customization Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. Theme and Aesthetics */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Paintbrush size={16} className="text-cyber-blue" />
              Theme & Colors
            </h3>

            {/* Dark/Light mode toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <h4 className="text-xs font-bold text-white">Interface Mode</h4>
                <p className="text-[10px] text-slate-400">Toggle light theme or dark theme</p>
              </div>
              <div className="flex bg-slate-900 border border-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setThemeMode('dark')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    themeMode === 'dark' ? 'bg-cyber-blue text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dark Mode
                </button>
                <button
                  onClick={() => setThemeMode('light')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    themeMode === 'light' ? 'bg-cyber-blue text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Light Mode
                </button>
              </div>
            </div>

            {/* Theme color customizer */}
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-bold text-white">Accent Theme Color</h4>
                <p className="text-[10px] text-slate-400">Choose custom accents for cursors, borders, and buttons</p>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 pt-1.5">
                {THEME_COLORS.map((color) => {
                  const isActive = accentColor === color.hex;
                  return (
                    <button
                      key={color.id}
                      onClick={() => setAccentColor(color.hex)}
                      className={`w-9 h-9 rounded-full relative flex items-center justify-center transition border ${
                        isActive ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isActive && <Check size={14} className="text-slate-950 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Fonts selector */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Layout size={16} className="text-cyber-blue" />
              Typography Fonts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Sans-serif */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest text-[9px]">Sans-Serif (General UI)</h4>
                <div className="flex flex-col gap-1 bg-slate-950/40 p-2 rounded-xl border border-white/5 max-h-48 overflow-y-auto">
                  {FONTS_SANS.map((font) => (
                    <button
                      key={font}
                      onClick={() => setFontFamily(font)}
                      className={`px-3 py-2 text-left rounded-lg text-xs font-semibold transition ${
                        fontFamily === font 
                          ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monospaced */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest text-[9px]">Monospace (Typing Text)</h4>
                <div className="flex flex-col gap-1 bg-slate-950/40 p-2 rounded-xl border border-white/5 max-h-48 overflow-y-auto">
                  {FONTS_MONO.map((font) => (
                    <button
                      key={font}
                      onClick={() => setFontFamily(font)}
                      className={`px-3 py-2 text-left rounded-lg text-xs font-mono font-semibold transition ${
                        fontFamily === font 
                          ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Typography Preview box */}
            <div className="p-4 bg-slate-950/50 border border-white/5 rounded-xl space-y-1.5">
              <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Eye size={10} /> Live Font Preview
              </span>
              <p 
                className="text-sm font-semibold text-white leading-relaxed"
                style={{ fontFamily: fontFamily }}
              >
                The quick brown fox jumps over the lazy dog. 1234567890 &ldquo;Success is not final, failure is not fatal: it is the courage to continue that counts.&rdquo;
              </p>
            </div>
          </div>

          {/* 3. Keypress Audio Feedback */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Keyboard size={16} className="text-cyber-blue" />
                Keypress Audio Feedback
              </h3>
              {soundName === 'off' ? (
                <span className="text-[10px] font-bold text-cyber-red bg-cyber-red/10 border border-cyber-red/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <VolumeX size={10} /> Muted
                </span>
              ) : (
                <span className="text-[10px] font-bold text-cyber-green bg-cyber-green/10 border border-cyber-green/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <Volume2 size={10} /> Active
                </span>
              )}
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-4 bg-slate-950/30 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 font-bold min-w-16">Volume: {Math.round(soundVolume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={soundVolume * 100}
                onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
                className="flex-1 accent-cyber-blue h-1.5 rounded-lg bg-slate-900 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Sounds buttons grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SOUNDS.map((sound) => {
                const isActive = soundName === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleSoundSelect(sound.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-center truncate border transition cursor-pointer select-none ${
                      isActive 
                        ? 'bg-cyber-blue text-slate-950 font-bold border-white shadow-[0_0_10px_rgba(0,242,254,0.3)]' 
                        : 'bg-slate-950/40 hover:bg-slate-900 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sound.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Cursor Preferences & Testing Area */}
        <div className="space-y-6">
          
          {/* Caret Styling preferences */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Monitor size={16} className="text-cyber-blue" />
              Caret Styles
            </h3>

            {/* Cursor Theme */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Caret Design Accent</h4>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => setCursorStyle('cyber')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                    cursorStyle === 'cyber' ? 'bg-cyber-blue text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cyber Glowing
                </button>
                <button
                  onClick={() => setCursorStyle('simple')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                    cursorStyle === 'simple' ? 'bg-cyber-blue text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Simple Line
                </button>
              </div>
            </div>

            {/* Caret Blinking */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Caret Animation</h4>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => setCaretBlinking(true)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                    caretBlinking ? 'bg-cyber-blue text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Blinking
                </button>
                <button
                  onClick={() => setCaretBlinking(false)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                    !caretBlinking ? 'bg-cyber-blue text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Steady
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Sound Playground */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Sparkles size={16} className="text-cyber-blue" />
              Keystroke Playground
            </h3>
            
            <p className="text-[10px] text-slate-400 leading-normal">
              Test your configuration instantly. Focus on the input box below and start typing to sample the chosen sound and font!
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={testText}
                onChange={handleTestTyping}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-blue font-bold transition shadow-inner placeholder-slate-600"
                placeholder="Type here to test..."
                style={{ fontFamily: fontFamily }}
              />
              <button
                onClick={() => setTestText('')}
                className="w-full py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 font-bold transition"
              >
                Clear Sandbox
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
