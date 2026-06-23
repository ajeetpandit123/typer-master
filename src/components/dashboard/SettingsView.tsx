'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Theme, 
  PRESET_THEMES, 
  deriveTokens, 
  getContrastRatio, 
  hexToHsl, 
  hslToHex 
} from '@/lib/services/themeColors';
import { 
  Sliders, Paintbrush, Volume2, Monitor, Layout, 
  Sparkles, Keyboard, Check, VolumeX, Eye,
  Palette, RefreshCw, Copy, Save, Edit3, Trash2, 
  Download, Upload, Info, AlertTriangle, Settings, Code, BookOpen
} from 'lucide-react';

const TEST_SENTENCES = [
  "the quick brown fox jumps over the lazy dog",
  "practice makes a typist perfect in speed and precision",
  "focus on accuracy and speed will naturally follow with time",
  "minimalism is not subtraction but focus on what is essential",
  "premium software design prioritizes readability and user experience"
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
    currentTheme, setCurrentTheme,
    customThemes, setCustomThemes,
    addToast,
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

  // Active theme editing states
  const [editingTheme, setEditingTheme] = useState<Theme>({ ...currentTheme });
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [themeNameInput, setThemeNameInput] = useState(editingTheme.name);
  const [isEditingName, setIsEditingName] = useState(false);

  // Tracks overridden keys
  const [overriddenKeys, setOverriddenKeys] = useState<Record<string, boolean>>({});

  // Typing demo states
  const [demoText, setDemoText] = useState(TEST_SENTENCES[0]);
  const [typedText, setTypedText] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const demoInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync editing theme when global theme changes
  useEffect(() => {
    setEditingTheme({ ...currentTheme });
    setThemeNameInput(currentTheme.name);
    setOverriddenKeys({});
  }, [currentTheme]);

  // Derived properties from base colors
  const derivedVals = deriveTokens(editingTheme.bg, editingTheme.text, editingTheme.accent);

  const handleBaseColorChange = (key: 'bg' | 'text' | 'accent', value: string) => {
    if (!/^#[0-9A-Fa-f]{0,6}$/.test(value)) return;
    
    setEditingTheme(prev => {
      const nextTheme = { ...prev, [key]: value };
      if (value.length === 7) {
        const derived = deriveTokens(
          key === 'bg' ? value : nextTheme.bg,
          key === 'text' ? value : nextTheme.text,
          key === 'accent' ? value : nextTheme.accent
        );

        Object.keys(derived).forEach(tokenKey => {
          const tKey = tokenKey as keyof typeof derived;
          if (!overriddenKeys[tKey]) {
            nextTheme[tKey] = derived[tKey];
          }
        });
      }
      return nextTheme;
    });
  };

  const handleOverrideColorChange = (key: keyof Omit<Theme, "id" | "name" | "isCustom">, value: string) => {
    if (!/^#[0-9A-Fa-f]{0,6}$/.test(value)) return;

    setEditingTheme(prev => ({ ...prev, [key]: value }));
    if (value.length === 7) {
      setOverriddenKeys(prev => ({ ...prev, [key]: true }));
    }
  };

  const resetTokenToDerived = (key: keyof typeof derivedVals) => {
    setOverriddenKeys(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    setEditingTheme(prev => ({
      ...prev,
      [key]: derivedVals[key]
    }));
    addToast("Token Reset", `Reset ${key} to derived value`, "info");
  };

  const resetAllOverrides = () => {
    setOverriddenKeys({});
    setEditingTheme(prev => ({
      ...prev,
      ...derivedVals
    }));
    addToast("Overrides Reset", "Reset all tokens to auto-derived values", "info");
  };

  const contrastRatio = getContrastRatio(editingTheme.bg, editingTheme.text);
  const contrastAccentRatio = getContrastRatio(editingTheme.bg, editingTheme.accent);

  const getContrastBadgeClass = (ratio: number) => {
    if (ratio >= 4.5) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (ratio >= 3.0) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  const getContrastStatus = (ratio: number) => {
    if (ratio >= 4.5) return "AAA Pass (Highly legible)";
    if (ratio >= 3.0) return "AA Pass (Fairly legible)";
    return "Caution: Low contrast (Hard to read)";
  };

  const applyActiveTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    addToast("Theme Applied", `Loaded theme: ${theme.name}`, "success");
  };

  const saveAsNewTheme = () => {
    const newId = `custom-${Date.now()}`;
    const name = themeNameInput.trim() || `Custom Theme ${customThemes.length + 1}`;
    
    const newTheme: Theme = {
      ...editingTheme,
      id: newId,
      name,
      isCustom: true
    };

    setCustomThemes(prev => [...prev, newTheme]);
    setCurrentTheme(newTheme);
    setIsEditingName(false);
    addToast("Theme Saved", `Created custom theme: ${name}`, "success");
  };

  const updateExistingTheme = () => {
    if (!editingTheme.isCustom) {
      saveAsNewTheme();
      return;
    }

    setCustomThemes(prev => prev.map(t => t.id === editingTheme.id ? { 
      ...editingTheme, 
      name: themeNameInput.trim() || editingTheme.name 
    } : t));

    const updatedTheme = { 
      ...editingTheme, 
      name: themeNameInput.trim() || editingTheme.name 
    };

    setCurrentTheme(updatedTheme);
    setIsEditingName(false);
    addToast("Theme Updated", `Saved changes to ${updatedTheme.name}`, "success");
  };

  const duplicateTheme = (theme: Theme) => {
    const duplicated: Theme = {
      ...theme,
      id: `custom-${Date.now()}`,
      name: `${theme.name} (Copy)`,
      isCustom: true
    };

    setCustomThemes(prev => [...prev, duplicated]);
    setCurrentTheme(duplicated);
    addToast("Theme Duplicated", `Copied theme to: ${duplicated.name}`, "success");
  };

  const deleteCustomTheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomThemes(prev => prev.filter(t => t.id !== id));
    if (currentTheme.id === id) {
      setCurrentTheme(PRESET_THEMES[0]);
    }
    addToast("Theme Deleted", "Custom theme removed", "info");
  };

  const exportThemeJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(editingTheme, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${editingTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast("JSON Exported", "Theme configuration downloaded", "success");
    } catch (err) {
      addToast("Export Failed", "Error creating JSON file", "error");
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.bg && parsed.text && parsed.accent && parsed.surface) {
          const importedTheme: Theme = {
            id: `custom-${Date.now()}`,
            name: parsed.name ? `${parsed.name} (Imported)` : `Imported Theme`,
            isCustom: true,
            bg: parsed.bg,
            surface: parsed.surface,
            surface2: parsed.surface2 || parsed.surface,
            text: parsed.text,
            textMuted: parsed.textMuted || parsed.text,
            accent: parsed.accent,
            error: parsed.error || "#ff5f5f",
            success: parsed.success || "#67c587",
            caret: parsed.caret || parsed.accent,
            border: parsed.border || parsed.surface,
            selection: parsed.selection || parsed.accent,
          };

          setCustomThemes(prev => [...prev, importedTheme]);
          setCurrentTheme(importedTheme);
          addToast("JSON Imported", `Loaded custom theme: ${importedTheme.name}`, "success");
        } else {
          addToast("Import Error", "Invalid theme schema structure", "error");
        }
      } catch (err) {
        addToast("Import Failed", "Failed to parse JSON file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const restartDemo = () => {
    const randomIdx = Math.floor(Math.random() * TEST_SENTENCES.length);
    setDemoText(TEST_SENTENCES[randomIdx]);
    setTypedText("");
    setMistakes(0);
    setIsFinished(false);
    setWpm(0);
    setStartTime(null);
    setTimeout(() => {
      if (demoInputRef.current) demoInputRef.current.focus();
    }, 20);
  };

  const handleTypingInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    const val = e.target.value;
    
    if (val.length > typedText.length) {
      const char = val[val.length - 1];
      playClickSound(char);
    }

    if (startTime === null) {
      setStartTime(Date.now());
    }

    setTypedText(val);

    let currentMistakes = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== demoText[i]) {
        currentMistakes++;
      }
    }
    setMistakes(currentMistakes);

    if (startTime !== null) {
      const minutes = (Date.now() - startTime) / 60000;
      const words = val.length / 5;
      if (minutes > 0.01) {
        setWpm(Math.round(words / minutes));
      }
    }

    if (val.length >= demoText.length) {
      setIsFinished(true);
      if (startTime !== null) {
        const totalMinutes = (Date.now() - startTime) / 60000;
        setWpm(Math.round((demoText.length / 5) / (totalMinutes || 0.01)));
      }
    }
  };

  const renderTypographyHighlights = () => {
    return demoText.split('').map((char, index) => {
      const typedChar = typedText[index];
      let charClass = "opacity-45";
      let charStyle: React.CSSProperties = { color: 'var(--text-muted)' };

      if (typedChar !== undefined) {
        if (typedChar === char) {
          charClass = "font-medium";
          charStyle = { color: 'var(--text)' };
        } else {
          charClass = "bg-rose-500/10 border-b border-rose-500 font-medium";
          charStyle = { color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderBottomColor: 'var(--error)' };
        }
      }

      const isActive = index === typedText.length;
      const activeClass = isActive ? "border-l-2 animate-caret relative" : "";
      const caretStyle: React.CSSProperties = isActive ? { borderLeftColor: 'var(--caret)' } : {};

      return (
        <span 
          key={index} 
          className={`${charClass} ${activeClass} transition-colors duration-100 font-mono`}
          style={{ ...charStyle, ...caretStyle }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  const handleSoundSelect = (soundId: string) => {
    setSoundName(soundId);
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
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      {/* 1. Header Banner */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between"
           style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
               style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
            <Sliders size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Preferences Panel</span>
            <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--text)' }}>Personalize Your Typing Space</h2>
          </div>
        </div>
      </div>

      {/* 2. Theme Customizer Section (Full Width Layout) */}
      <div className="space-y-6">
        
        {/* HUD Header Banner */}
        <div className="p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
             style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                 style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
              <Palette size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Custom Design Studio</span>
              <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--text)' }}>Monkeytype-Style Theme Engine</h2>
            </div>
          </div>

          {/* Theme select dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>Quick Select:</label>
            <select 
              value={editingTheme.id}
              onChange={(e) => {
                const theme = [...PRESET_THEMES, ...customThemes].find(t => t.id === e.target.value);
                if (theme) applyActiveTheme(theme);
              }}
              className="w-full sm:w-48 text-xs font-semibold px-3 py-2 rounded-lg border focus:outline-none transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--surface-2)', 
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}
            >
              <optgroup label="Presets">
                {PRESET_THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
              {customThemes.length > 0 && (
                <optgroup label="Custom Themes">
                  {customThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </optgroup>
              )}
            </select>
          </div>
        </div>

        {/* 5-column Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* LEFT: Sandbox & Presets (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Typing Sandbox */}
            <div className="p-6 rounded-2xl border flex flex-col space-y-6"
                 style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center border-b pb-3"
                   style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Interactive Typing Demo</h3>
                <div className="flex items-center gap-2">
                  {startTime !== null && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded border" 
                          style={{ color: 'var(--accent)', backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                      {wpm} WPM
                    </span>
                  )}
                  {mistakes > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded border" 
                          style={{ color: 'var(--error)', backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                      {mistakes} typos
                    </span>
                  )}
                </div>
              </div>

              {/* Text display panel */}
              <div 
                onClick={() => { if (demoInputRef.current) demoInputRef.current.focus(); }}
                className="w-full text-xl leading-relaxed select-none min-h-24 p-5 rounded-xl border cursor-text whitespace-pre-wrap font-mono transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                {renderTypographyHighlights()}
                {isFinished && (
                  <div className="text-xs font-semibold mt-4 flex items-center gap-2" style={{ color: 'var(--success)' }}>
                    <Sparkles size={12} /> Finished! Live assessment: {wpm} WPM and {mistakes} mistakes.
                  </div>
                )}
              </div>

              <textarea
                ref={demoInputRef}
                value={typedText}
                onChange={handleTypingInput}
                disabled={isFinished}
                className="absolute w-0 h-0 opacity-0 pointer-events-none"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Click text box to focus. Type normal letters to test colors.
                </span>
                <button 
                  onClick={restartDemo}
                  className="text-xs font-semibold flex items-center gap-1.5 transition underline cursor-pointer select-none"
                  style={{ color: 'var(--accent)' }}
                >
                  <RefreshCw size={12} /> Reset Sandbox
                </button>
              </div>
            </div>

            {/* Presets Library */}
            <div className="p-6 rounded-2xl border space-y-4"
                 style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center border-b pb-3"
                   style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Preset Theme Library</h3>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{PRESET_THEMES.length} high-legibility presets</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                {PRESET_THEMES.map((theme) => {
                  const isActive = currentTheme.id === theme.id;
                  const ratio = getContrastRatio(theme.bg, theme.text);
                  return (
                    <div 
                      key={theme.id}
                      onClick={() => applyActiveTheme(theme)}
                      className="p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition hover:scale-[1.01] active:scale-[0.99]"
                      style={{ 
                        backgroundColor: theme.surface, 
                        borderColor: isActive ? 'var(--accent)' : theme.border,
                        borderWidth: isActive ? '2px' : '1px'
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold truncate max-w-[80px]" style={{ color: theme.text }}>{theme.name}</span>
                        {isActive && (
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded"
                                style={{ backgroundColor: theme.selection, color: theme.accent }}>
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: theme.bg }} title="Background" />
                          <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: theme.text }} title="Text" />
                          <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: theme.accent }} title="Accent" />
                          <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: theme.border }} title="Border" />
                        </div>
                        <span className="text-[8px] font-semibold" style={{ color: theme.textMuted }}>
                          {ratio}:1
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: Editor Panel (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="p-6 rounded-2xl border space-y-5"
                 style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              
              <div className="flex justify-between items-center border-b pb-3"
                   style={{ borderColor: 'var(--border)' }}>
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={themeNameInput}
                      onChange={(e) => setThemeNameInput(e.target.value)}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg border w-full focus:outline-none"
                      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      placeholder="Enter theme name..."
                      autoFocus
                    />
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="p-1.5 rounded-lg border hover:opacity-85 cursor-pointer"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      title="Done"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{editingTheme.name}</h3>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="p-1 text-text-muted hover:text-text cursor-pointer"
                        title="Rename Theme"
                      >
                        <Edit3 size={12} />
                      </button>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border"
                          style={{ 
                            backgroundColor: 'var(--surface-2)', 
                            borderColor: 'var(--border)', 
                            color: editingTheme.isCustom ? 'var(--accent)' : 'var(--text-muted)' 
                          }}>
                      {editingTheme.isCustom ? "Custom" : "Preset"}
                    </span>
                  </div>
                )}
              </div>

              {/* Readability score */}
              <div className="p-4 rounded-xl border space-y-3"
                   style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>Readability Score</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getContrastBadgeClass(contrastRatio)}`}>
                    {contrastRatio}:1 ratio
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  {contrastRatio >= 4.5 ? (
                    <Info size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold" style={{ color: 'var(--text)' }}>
                      {getContrastStatus(contrastRatio)}
                    </p>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      Contrast recommended &ge; 4.5:1. Accent contrast is {contrastAccentRatio}:1.
                    </p>
                  </div>
                </div>
              </div>

              {/* Colors Pickers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold" style={{ color: 'var(--text)' }}>1. Page Background</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold font-mono" style={{ color: 'var(--text-muted)' }}>{editingTheme.bg}</span>
                    <input
                      type="color"
                      value={editingTheme.bg}
                      onChange={(e) => handleBaseColorChange('bg', e.target.value)}
                      className="w-5 h-5 rounded-md border-0 cursor-pointer p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold" style={{ color: 'var(--text)' }}>2. Main Text</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold font-mono" style={{ color: 'var(--text-muted)' }}>{editingTheme.text}</span>
                    <input
                      type="color"
                      value={editingTheme.text}
                      onChange={(e) => handleBaseColorChange('text', e.target.value)}
                      className="w-5 h-5 rounded-md border-0 cursor-pointer p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold" style={{ color: 'var(--text)' }}>3. Accent Highlights</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold font-mono" style={{ color: 'var(--text-muted)' }}>{editingTheme.accent}</span>
                    <input
                      type="color"
                      value={editingTheme.accent}
                      onChange={(e) => handleBaseColorChange('accent', e.target.value)}
                      className="w-5 h-5 rounded-md border-0 cursor-pointer p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Overrides */}
              <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setIsAdvanced(!isAdvanced)}
                  className="w-full flex justify-between items-center text-xs font-bold hover:opacity-85 select-none cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span className="flex items-center gap-1.5">
                    <Settings size={14} style={{ color: 'var(--accent)' }} /> Advanced Overrides
                  </span>
                  <span>{isAdvanced ? "[-]" : "[+]"}</span>
                </button>

                {isAdvanced && (
                  <div className="space-y-3 mt-4 max-h-60 overflow-y-auto pr-1">
                    {Object.keys(derivedVals).map((tokenKey) => {
                      const tKey = tokenKey as keyof typeof derivedVals;
                      const isOverridden = !!overriddenKeys[tKey];
                      return (
                        <div key={tKey} className="flex flex-col gap-1 border-b border-white/5 pb-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[11px] font-semibold capitalize" style={{ color: 'var(--text)' }}>
                              {tKey.replace(/([A-Z])/g, ' $1')}
                            </label>
                            <div className="flex items-center gap-1.5">
                              {isOverridden ? (
                                <button 
                                  onClick={() => resetTokenToDerived(tKey)}
                                  className="text-[8px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded hover:bg-amber-500/20 cursor-pointer"
                                  title="Click to restore auto-derivation"
                                >
                                  Override
                                </button>
                              ) : (
                                <span className="text-[8px] font-black uppercase tracking-wider text-text-muted bg-surface-2 border border-border px-1.5 py-0.5 rounded">
                                  Derived
                                </span>
                              )}
                              <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
                                {editingTheme[tKey]}
                              </span>
                              <input
                                type="color"
                                value={editingTheme[tKey]}
                                onChange={(e) => handleOverrideColorChange(tKey, e.target.value)}
                                className="w-4 h-4 rounded border-0 cursor-pointer p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {Object.keys(overriddenKeys).length > 0 && (
                      <button
                        onClick={resetAllOverrides}
                        className="w-full py-1.5 border rounded-lg text-[10px] font-bold hover:opacity-85 cursor-pointer"
                        style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      >
                        Clear All Manual Overrides
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={updateExistingTheme}
                  className="py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer shadow-sm hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' }}
                >
                  <Save size={14} /> {editingTheme.isCustom ? "Save Changes" : "Save as New"}
                </button>
                
                <button
                  onClick={() => duplicateTheme(editingTheme)}
                  className="py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <Copy size={14} /> Duplicate Theme
                </button>
              </div>
            </div>

            {/* Import / Export & Custom List */}
            <div className="p-6 rounded-2xl border space-y-4"
                 style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              
              <div className="flex justify-between items-center border-b pb-3"
                   style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Theme Configuration & Port</h3>
                <Code size={14} style={{ color: 'var(--accent)' }} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={exportThemeJson}
                  className="py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <Download size={14} /> Export JSON
                </button>

                <label className="py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                       style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <Upload size={14} /> Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJsonImport}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Custom Themes list */}
              {customThemes.length > 0 && (
                <div className="space-y-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Saved Custom Themes</h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {customThemes.map((theme) => {
                      const isSelected = currentTheme.id === theme.id;
                      return (
                        <div 
                          key={theme.id}
                          onClick={() => applyActiveTheme(theme)}
                          className="p-2.5 rounded-lg border flex justify-between items-center cursor-pointer transition"
                          style={{ 
                            backgroundColor: isSelected ? 'var(--selection)' : 'var(--surface-2)', 
                            borderColor: isSelected ? 'var(--accent)' : 'var(--border)' 
                          }}
                        >
                          <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{theme.name}</span>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={(e) => deleteCustomTheme(theme.id, e)}
                              className="p-1 hover:text-rose-500 rounded text-text-muted cursor-pointer transition-colors"
                              title="Delete Theme"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* 3. Other Settings Categories Grid (Fully Theme Aware) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans wide): Typography & Audio */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Typography Fonts Card */}
          <div className="p-6 rounded-2xl border space-y-5"
               style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-2.5"
                style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
              <Layout size={16} style={{ color: 'var(--accent)' }} />
              Typography Fonts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Sans-serif UI */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[9px]" style={{ color: 'var(--text-muted)' }}>Sans-Serif (General UI)</h4>
                <div className="flex flex-col gap-1 p-2 rounded-xl border max-h-48 overflow-y-auto"
                     style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                  {FONTS_SANS.map((font) => (
                    <button
                      key={font}
                      onClick={() => setFontFamily(font)}
                      className={`px-3 py-2 text-left rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
                        fontFamily === font 
                          ? 'border' 
                          : 'border border-transparent'
                      }`}
                      style={{ 
                        fontFamily: font,
                        backgroundColor: fontFamily === font ? 'var(--selection)' : 'transparent',
                        borderColor: fontFamily === font ? 'var(--accent)' : 'transparent',
                        color: fontFamily === font ? 'var(--accent)' : 'var(--text-muted)'
                      }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monospaced typing area */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[9px]" style={{ color: 'var(--text-muted)' }}>Monospace (Typing Text)</h4>
                <div className="flex flex-col gap-1 p-2 rounded-xl border max-h-48 overflow-y-auto"
                     style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                  {FONTS_MONO.map((font) => (
                    <button
                      key={font}
                      onClick={() => setFontFamily(font)}
                      className={`px-3 py-2 text-left rounded-lg text-xs font-mono font-semibold transition cursor-pointer select-none ${
                        fontFamily === font 
                          ? 'border' 
                          : 'border border-transparent'
                      }`}
                      style={{ 
                        fontFamily: font,
                        backgroundColor: fontFamily === font ? 'var(--selection)' : 'transparent',
                        borderColor: fontFamily === font ? 'var(--accent)' : 'transparent',
                        color: fontFamily === font ? 'var(--accent)' : 'var(--text-muted)'
                      }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Typography Preview box */}
            <div className="p-4 rounded-xl border space-y-1.5"
                 style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
              <span className="text-[9px] uppercase font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Eye size={10} /> Live Font Preview
              </span>
              <p 
                className="text-sm font-semibold leading-relaxed"
                style={{ fontFamily: fontFamily, color: 'var(--text)' }}
              >
                The quick brown fox jumps over the lazy dog. 1234567890 &ldquo;Success is not final, failure is not fatal: it is the courage to continue that counts.&rdquo;
              </p>
            </div>
          </div>

          {/* Keypress Audio Feedback Card */}
          <div className="p-6 rounded-2xl border space-y-5"
               style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between border-b pb-2.5"
                 style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: 'var(--text)' }}>
                <Keyboard size={16} style={{ color: 'var(--accent)' }} />
                Keypress Audio Feedback
              </h3>
              {soundName === 'off' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-rose-500/20 bg-rose-500/10 text-rose-500">
                  <VolumeX size={10} /> Muted
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                  <Volume2 size={10} /> Active
                </span>
              )}
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-4 p-3 rounded-xl border"
                 style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold min-w-16" style={{ color: 'var(--text-muted)' }}>Volume: {Math.round(soundVolume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={soundVolume * 100}
                onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
                className="flex-1 h-1.5 rounded-lg focus:outline-none cursor-pointer"
                style={{ 
                  accentColor: 'var(--accent)',
                  backgroundColor: 'var(--bg)'
                }}
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
                    className="py-2 px-3 rounded-lg text-xs font-semibold text-center truncate border transition cursor-pointer select-none"
                    style={{ 
                      backgroundColor: isActive ? 'var(--selection)' : 'var(--surface-2)', 
                      borderColor: isActive ? 'var(--accent)' : 'var(--border)', 
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      boxShadow: isActive ? '0 0 8px var(--selection)' : 'none'
                    }}
                  >
                    {sound.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (1 span wide): Caret & Playgrounds */}
        <div className="space-y-6">
          
          {/* Caret Styles preferences */}
          <div className="p-6 rounded-2xl border space-y-5"
               style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-2.5"
                style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
              <Monitor size={16} style={{ color: 'var(--accent)' }} />
              Caret Styles
            </h3>

            {/* Cursor Design */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Caret Design Accent</h4>
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl border"
                   style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setCursorStyle('cyber')}
                  className="py-1.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-300"
                  style={{
                    backgroundColor: cursorStyle === 'cyber' ? 'var(--selection)' : 'transparent',
                    borderColor: cursorStyle === 'cyber' ? 'var(--accent)' : 'transparent',
                    color: cursorStyle === 'cyber' ? 'var(--accent)' : 'var(--text-muted)',
                    borderWidth: cursorStyle === 'cyber' ? '1px' : '0px'
                  }}
                >
                  Cyber Glowing
                </button>
                <button
                  onClick={() => setCursorStyle('simple')}
                  className="py-1.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-300"
                  style={{
                    backgroundColor: cursorStyle === 'simple' ? 'var(--selection)' : 'transparent',
                    borderColor: cursorStyle === 'simple' ? 'var(--accent)' : 'transparent',
                    color: cursorStyle === 'simple' ? 'var(--accent)' : 'var(--text-muted)',
                    borderWidth: cursorStyle === 'simple' ? '1px' : '0px'
                  }}
                >
                  Simple Line
                </button>
              </div>
            </div>

            {/* Caret Blinking */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Caret Animation</h4>
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl border"
                   style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setCaretBlinking(true)}
                  className="py-1.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-300"
                  style={{
                    backgroundColor: caretBlinking ? 'var(--selection)' : 'transparent',
                    borderColor: caretBlinking ? 'var(--accent)' : 'transparent',
                    color: caretBlinking ? 'var(--accent)' : 'var(--text-muted)',
                    borderWidth: caretBlinking ? '1px' : '0px'
                  }}
                >
                  Blinking
                </button>
                <button
                  onClick={() => setCaretBlinking(false)}
                  className="py-1.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-300"
                  style={{
                    backgroundColor: !caretBlinking ? 'var(--selection)' : 'transparent',
                    borderColor: !caretBlinking ? 'var(--accent)' : 'transparent',
                    color: !caretBlinking ? 'var(--accent)' : 'var(--text-muted)',
                    borderWidth: !caretBlinking ? '1px' : '0px'
                  }}
                >
                  Steady
                </button>
              </div>
            </div>
          </div>

          {/* Keystroke Playground */}
          <div className="p-6 rounded-2xl border space-y-4"
               style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-2.5"
                style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              Keystroke Playground
            </h3>
            
            <p className="text-[10px] leading-normal animate-pulse" style={{ color: 'var(--text-muted)' }}>
              Test your configuration instantly. Focus on the input box below and start typing to sample the chosen sound and font!
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={testText}
                onChange={handleTestTyping}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none font-bold transition shadow-inner"
                style={{ 
                  fontFamily: fontFamily,
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
                placeholder="Type here to test..."
              />
              <button
                onClick={() => setTestText('')}
                className="w-full py-1.5 border rounded-lg text-[10px] font-bold transition cursor-pointer select-none"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)'
                }}
              >
                Clear Playground
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
