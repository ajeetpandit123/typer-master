'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { saveSession, incrementPracticeTime } from '@/lib/services/db';
import { 
  FileText, Play, RotateCcw, Target, Hourglass, ArrowRight,
  TrendingUp, Award, Clock, Sparkles, CheckCircle2, XCircle, ChevronRight,
  HelpCircle, UserCheck, PlayCircle
} from 'lucide-react';

interface ExamPreset {
  id: string;
  name: string;
  description: string;
  targetWords: number;
  timeLimit: number; // in seconds
  targetWpm: number;
}

const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'support-agent',
    name: 'IT Customer Support Chat Agent',
    description: 'Common entry exam for voice/chat support roles. Focuses on customer communication with standard punctuation.',
    targetWords: 300,
    timeLimit: 15 * 60, // 15 minutes (900 seconds)
    targetWpm: 20
  },
  {
    id: 'civil-service',
    name: 'Civil Service Typist Exam',
    description: 'Standard typing assessment required for administrative positions in the public sector and civil services.',
    targetWords: 400,
    timeLimit: 10 * 60, // 10 minutes (600 seconds)
    targetWpm: 40
  },
  {
    id: 'transcriptionist',
    name: 'Professional Transcriptionist',
    description: 'Advanced speed and formatting simulation for legal, medical, or administrative transcription roles.',
    targetWords: 500,
    timeLimit: 10 * 60, // 10 minutes (600 seconds)
    targetWpm: 50
  }
];

const EXAM_PARAGRAPHS = [
  "Hello! Thank you for contacting customer support. I understand you are experiencing issues accessing your subscription billing profile. To resolve this, please sign out of your account, clear your browser cookies and history cache, and attempt to log back in. If the payment portal is still locked, please confirm the last four digits of your credit card and we will manually verify your subscription status. We appreciate your patience and apologize for any convenience caused.",
  "Dear customer, this is an automated confirmation of your request ticket #88921. Our technical systems administration team is currently researching a localized server outage affecting authentication responses in your area. We expect services to return to full functionality within the next twelve hours. No action is required on your part. We will send you an email notification as soon as the problem is fully resolved. Thank you for your partnership.",
  "Thank you for reaching out to technical support today. I would be happy to assist you with setting up your new office router. First, ensure the power cord is securely plugged into the wall and the status indicator light is glowing solid green. Next, connect the ethernet cable from the modem to the port labeled WAN on the back of your router. Once connected, open a web browser and navigate to the default administration address.",
  "Hi, I have reviewed your request regarding product returns and refunds. According to our corporate policy guidelines, items returned within thirty calendar days of purchase are eligible for a full refund to the original payment method, provided they are in their original packaging. Please print the shipping label attached to this ticket and drop the package off at any authorized shipping carrier center. Let us know if you have questions.",
  "Greetings! I would be glad to guide you through the process of updating your employee profile information. Log into the corporate directory database portal using your secure single sign-on credentials. Select the profile settings tab in the upper-right corner and input your updated phone number and mailing address details. Once you click save, our human resources database will update automatically. Have a great day!",
  "Hello! I am writing to follow up on our previous conversation regarding the database migration project. The transition to the new secure cloud server is scheduled for this Friday at midnight. During this time, the production environment will be set to read-only mode to prevent any database write conflicts. Please save all active project files and close your database connections before ten PM. Thank you for your cooperation.",
  "Good morning! Thank you for contacting our customer service department. I would be glad to help you resolve your billing inquiry. After checking your account ledger, I found that you were charged twice for your annual subscription due to a system transaction processing glitch. I have processed a full reversal refund for the second transaction, which should appear in your bank account in three days. Let us know if you need assistance.",
  "Welcome to the technical service hotline. If you are experiencing slow wireless connectivity in your workspace, it may be due to frequency channel interference from nearby electrical equipment. We suggest logging into the access point setup screen and changing the channel settings from automatic selection to static channel eleven or six. This adjustment often improves signal stability and transfer speeds for remote devices."
];

export const ExamPractice: React.FC = () => {
  const { user, addToast, refreshProfile, isZenMode, setIsZenMode } = useApp();

  // Mode settings
  const [selectedPresetId, setSelectedPresetId] = useState<string>('support-agent');
  const [customWords, setCustomWords] = useState<number>(300);
  const [customMinutes, setCustomMinutes] = useState<number>(15);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Active exam configurations
  const [activeWords, setActiveWords] = useState<number>(300);
  const [activeTimeLimit, setActiveTimeLimit] = useState<number>(900);
  const [activePresetName, setActivePresetName] = useState<string>('');

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [targetText, setTargetText] = useState('');
  const [rawTypedText, setRawTypedText] = useState('');

  // Timers and metrics
  const [timeLeft, setTimeLeft] = useState(900);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [passed, setPassed] = useState(false);
  const [failReason, setFailReason] = useState('');

  useEffect(() => {
    if (isPlaying && !showResults) {
      setIsZenMode(true);
    } else {
      setIsZenMode(false);
    }
    return () => {
      setIsZenMode(false);
    };
  }, [isPlaying, showResults, setIsZenMode]);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);
  const elapsedTimeRef = useRef(0);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Clean timer on unmount and save practice time
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isPlayingRef.current && elapsedTimeRef.current > 0 && user) {
        incrementPracticeTime(user.id, elapsedTimeRef.current);
      }
    };
  }, [user]);

  // Generate test paragraphs based on word goal
  const generateExamText = (wordGoal: number): string => {
    let resultParagraphs: string[] = [];
    let currentWords = 0;
    
    // Keep adding random support paragraphs until we hit or exceed the word target
    const pool = [...EXAM_PARAGRAPHS];
    while (currentWords < wordGoal) {
      if (pool.length === 0) {
        pool.push(...EXAM_PARAGRAPHS);
      }
      const idx = Math.floor(Math.random() * pool.length);
      const chosen = pool.splice(idx, 1)[0];
      resultParagraphs.push(chosen);
      currentWords += chosen.split(/\s+/).length;
    }

    const merged = resultParagraphs.join(' ');
    // Slice exactly to match word target or let them type the paragraphs in full.
    // In professional tests, you type paragraphs in full. We'll slice it to approximately the target.
    const wordsArray = merged.split(/\s+/);
    return wordsArray.slice(0, wordGoal).join(' ');
  };

  const handleLaunchExam = () => {
    let targetW = 300;
    let limitS = 900;
    let name = '';

    if (isCustomMode) {
      targetW = customWords;
      limitS = customMinutes * 60;
      name = 'Custom Exam Simulation';
    } else {
      const preset = EXAM_PRESETS.find(p => p.id === selectedPresetId) || EXAM_PRESETS[0];
      targetW = preset.targetWords;
      limitS = preset.timeLimit;
      name = preset.name;
    }

    // Save previous active session practice time if unmounting/starting new
    if (isPlaying && elapsedTime > 0 && user) {
      incrementPracticeTime(user.id, elapsedTime);
    }

    const generatedText = generateExamText(targetW);

    setActiveWords(targetW);
    setActiveTimeLimit(limitS);
    setActivePresetName(name);

    setTargetText(generatedText);
    setRawTypedText('');
    setElapsedTime(0);
    setTimeLeft(limitS);
    setIsPlaying(true);
    setIsStarted(false);
    setShowResults(false);
    setPassed(false);
    setFailReason('');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setTimeout(() => {
      if (textInputRef.current) textInputRef.current.focus();
    }, 50);
  };

  const tick = () => {
    setElapsedTime(prev => prev + 1);
    setTimeLeft(prev => Math.max(0, prev - 1));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPlaying) return;

    const val = e.target.value;
    
    // Start timer on first keypress
    if (!isStarted && val.length === 1) {
      setIsStarted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        tick();
      }, 1000);
    }

    setRawTypedText(val);

    // Check if the user completed the full text
    if (val.length >= targetText.length) {
      handleFinished(elapsedTime + 1, false);
    }
  };

  const handleFinished = async (finalSeconds: number, isTimeout: boolean) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setShowResults(true);

    const cleanTyped = rawTypedText.trim();
    const cleanTarget = targetText.slice(0, cleanTyped.length);

    let errors = 0;
    for (let i = 0; i < cleanTyped.length; i++) {
      if (cleanTyped[i] !== cleanTarget[i]) {
        errors++;
      }
    }

    const accuracy = cleanTyped.length > 0
      ? Math.max(0, Math.round(((cleanTyped.length - errors) / cleanTyped.length) * 100))
      : 0;

    const wordsTyped = Math.floor(cleanTyped.length / 5);
    const finalWpm = Math.round(wordsTyped / ((finalSeconds || 1) / 60));

    // Passing conditions: Must type all target words within the limit with >= 90% accuracy
    let isPass = true;
    let reason = '';

    if (isTimeout && wordsTyped < activeWords) {
      isPass = false;
      reason = `Target not met: You typed ${wordsTyped} of ${activeWords} words before time ran out.`;
    } else if (accuracy < 90) {
      isPass = false;
      reason = `Accuracy too low: You achieved ${accuracy}% accuracy, but the exam requires at least 90%.`;
    }

    setPassed(isPass);
    setFailReason(reason);

    if (user && finalWpm > 0) {
      try {
        await saveSession(user.id, {
          wpm: finalWpm,
          accuracy,
          levelType: 'exam',
          duration: finalSeconds,
          errors,
          charsTyped: cleanTyped.length
        });
        
        if (isPass) {
          addToast('Exam Simulation Passed!', `${activePresetName} completed!`, 'success');
        } else {
          addToast('Exam Attempt Finished', 'Did not meet requirements.', 'info');
        }
        refreshProfile();
      } catch (err) {
        console.error('Failed to save exam session:', err);
      }
    }
  };

  // Effect to handle time expiration
  useEffect(() => {
    if (isPlaying && isStarted && timeLeft <= 0) {
      handleFinished(activeTimeLimit, true);
    }
  }, [timeLeft, isPlaying, isStarted]);

  // Dynamic metrics
  const wordsTyped = Math.floor(rawTypedText.length / 5);
  const accuracy = rawTypedText.length > 0
    ? Math.max(0, Math.round((targetText.split('').filter((c, i) => rawTypedText[i] === c).length / rawTypedText.length) * 100))
    : 100;

  const currentWpm = Math.round(wordsTyped / ((elapsedTime || 1) / 60));

  // Live Pacing calculations
  // Pace diff compares words typed against expected words at this time fraction
  const expectedPaceWords = (elapsedTime / activeTimeLimit) * activeWords;
  const paceDiff = isStarted ? wordsTyped - expectedPaceWords : 0;
  
  const getPaceStatus = () => {
    if (!isStarted) return { text: 'Exam Pending', color: 'text-slate-400', bg: 'bg-slate-900/30' };
    if (paceDiff > 2) return { text: `${paceDiff.toFixed(1)} words ahead`, color: 'text-cyber-green', bg: 'bg-cyber-green/10 border-cyber-green/20' };
    if (paceDiff < -2) return { text: `${Math.abs(paceDiff).toFixed(1)} words behind`, color: 'text-cyber-red', bg: 'bg-cyber-red/10 border-cyber-red/20' };
    return { text: 'On pace', color: 'text-cyber-blue', bg: 'bg-cyber-blue/10 border-cyber-blue/20' };
  };

  const pace = getPaceStatus();

  // Formatting seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const renderTextHighlights = () => {
    return targetText.split('').map((char, index) => {
      const typedChar = rawTypedText[index];
      
      let charClass = 'text-slate-500'; // Default untyped
      if (typedChar !== undefined) {
        charClass = typedChar === char ? 'text-white' : 'bg-cyber-red/35 text-cyber-red border-b border-cyber-red';
      }
      
      const isActive = index === rawTypedText.length;
      const activeClass = isActive ? 'typing-caret-active animate-caret' : '';

      return (
        <span key={index} className={`${charClass} ${activeClass} transition-all duration-100 font-mono tracking-wide`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className={`transition-all duration-500 ${isZenMode ? 'w-full h-full min-h-[90vh] flex flex-col justify-center max-w-5xl mx-auto px-6 pb-0' : 'space-y-6 max-w-4xl mx-auto pb-10'}`}>
      {/* 1. Header Information */}
      {!isZenMode && (
        <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">Exam Simulation Module</span>
              <h2 className="text-lg font-bold text-white leading-tight">Professional Assessment Simulator</h2>
            </div>
          </div>

          {/* Configuration tab styles (only visible when not active) */}
          {!isPlaying && !showResults && (
            <div className="flex bg-slate-900 border border-white/5 p-1 rounded-lg">
              <button
                onClick={() => setIsCustomMode(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  !isCustomMode ? 'bg-cyber-purple text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sim Presets
              </button>
              <button
                onClick={() => setIsCustomMode(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  isCustomMode ? 'bg-cyber-purple text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom Exam
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Main Practice Panel */}
      <div className={`relative overflow-hidden flex flex-col transition-all duration-500 ${isZenMode ? 'border-0 bg-transparent shadow-none p-0 w-full' : 'glass-card p-6 rounded-2xl'}`}>
        {showResults ? (
          /* Results Certificate View */
          <div className="py-6 flex flex-col items-center text-center max-w-lg mx-auto w-full space-y-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
              passed 
                ? 'bg-cyber-green/10 border-cyber-green/40 text-cyber-green shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-cyber-red/10 border-cyber-red/40 text-cyber-red shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}>
              {passed ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                {passed ? 'Exam Completed Successfully!' : 'Requirements Not Met'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">
                {activePresetName}
              </p>
              {!passed && (
                <p className="text-xs text-cyber-red font-semibold bg-cyber-red/5 border border-cyber-red/20 px-3 py-2 rounded-lg mt-3">
                  {failReason}
                </p>
              )}
            </div>

            {/* Metric breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full bg-slate-950/40 p-5 border border-white/5 rounded-xl">
              <div className="text-center p-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Speed Achieved</span>
                <span className={`text-2xl font-extrabold mt-1 block ${passed ? 'text-cyber-blue text-glow-cyan' : 'text-slate-300'}`}>
                  {currentWpm} WPM
                </span>
              </div>
              <div className="text-center p-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Accuracy</span>
                <span className={`text-2xl font-extrabold mt-1 block ${accuracy >= 90 ? 'text-cyber-green' : 'text-cyber-amber'}`}>
                  {accuracy}%
                </span>
                <span className="text-[8px] text-slate-500">Req: 90%</span>
              </div>
              <div className="text-center p-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Words Typed</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">
                  {wordsTyped} / {activeWords}
                </span>
                <span className="text-[8px] text-slate-500">5 chars = 1 word</span>
              </div>
              <div className="text-center p-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Time Spent</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">
                  {formatTime(elapsedTime)}
                </span>
                <span className="text-[8px] text-slate-500">Limit: {formatTime(activeTimeLimit)}</span>
              </div>
            </div>

            <button
              onClick={handleLaunchExam}
              className="w-full py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_12px_rgba(0,242,254,0.25)]"
            >
              <RotateCcw size={16} />
              Attempt Another Exam
            </button>
          </div>
        ) : !isPlaying ? (
          /* Selection Landing Screen */
          <div className="py-6 space-y-6">
            {!isCustomMode ? (
              /* Preset Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EXAM_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`glass-card p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-48 hover:scale-[1.02] ${
                        isSelected 
                          ? 'border-cyber-blue/40 bg-cyber-blue/5' 
                          : 'border-white/5 bg-slate-900/30'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Job Preset</span>
                          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-cyber-blue animate-pulse" />}
                        </div>
                        <h4 className="text-sm font-extrabold text-white">{preset.name}</h4>
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-3">
                          {preset.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[10px] text-slate-400 font-mono">
                        <span>Goal: <strong>{preset.targetWords}w</strong></span>
                        <span>Limit: <strong>{preset.timeLimit / 60}m</strong></span>
                        <span className="text-cyber-blue font-bold">~{preset.targetWpm} WPM</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Custom Exam Configurator Form */
              <div className="glass-card bg-slate-950/40 p-6 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
                <h4 className="text-sm font-bold text-white border-b border-white/5 pb-2">Custom Exam Target builder</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold">Word Goal (words)</label>
                    <select
                      value={customWords}
                      onChange={(e) => setCustomWords(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold p-2.5 text-slate-300 focus:outline-none focus:border-cyber-blue"
                    >
                      {[100, 200, 300, 400, 500, 600, 700, 800].map(w => (
                        <option key={w} value={w}>{w} words</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold">Time Limit (minutes)</label>
                    <select
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold p-2.5 text-slate-300 focus:outline-none focus:border-cyber-blue"
                    >
                      {[1, 2, 5, 10, 15, 20, 25, 30].map(m => (
                        <option key={m} value={m}>{m} minutes</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 leading-relaxed font-mono">
                  Calculated Minimum Typing Speed: <strong>{Math.round(customWords / customMinutes)} WPM</strong>. You must achieve this speed with at least 90% accuracy to pass your simulation.
                </div>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                onClick={handleLaunchExam}
                className="px-8 py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-[0.98]"
              >
                <Play size={16} fill="white" />
                Launch Exam Simulation
              </button>
            </div>
          </div>
        ) : (
          /* Active Typing Engine */
          <div className={`relative transition-all duration-500 ${isZenMode ? 'space-y-12 w-full font-mono' : 'space-y-6'}`}>
            {/* Live Metrics HUD */}
            <div className={`flex justify-between items-center transition-all duration-300 w-full ${isZenMode ? 'px-0 py-0 border-0 bg-transparent text-slate-500 text-lg' : 'bg-slate-950/30 px-4 py-2 border border-white/5 rounded-xl text-xs select-none'}`}>
              <div className="flex items-center gap-2">
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-slate-400'}>Goal:</span>
                <span className={isZenMode ? 'text-2xl font-black text-white' : 'font-bold text-white'}>{wordsTyped} / {activeWords}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-slate-400'}>Time Left:</span>
                <span className={isZenMode ? 'text-2xl font-black text-white font-mono' : 'font-bold text-white font-mono'}>{formatTime(timeLeft)}</span>
              </div>
              
              {/* Pacing Capsule */}
              <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-all ${pace.bg}`}>
                <TrendingUp size={11} className={pace.color} />
                <span className={`font-bold font-mono text-[10px] uppercase tracking-wider ${pace.color}`}>
                  {pace.text}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-slate-400 font-medium'}>WPM:</span>
                <span className={isZenMode ? 'text-3xl font-black text-cyber-blue text-glow-cyan' : 'font-bold text-cyber-blue'}>{currentWpm}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-slate-400 font-medium'}>Accuracy:</span>
                <span className={isZenMode ? 'text-3xl font-black text-cyber-green' : 'font-bold text-cyber-green'}>{accuracy}%</span>
              </div>
            </div>

            {/* Display Text panel */}
            <div 
              onClick={() => { if (textInputRef.current) textInputRef.current.focus(); }}
              className={`w-full transition-all duration-500 select-none cursor-text overflow-hidden relative whitespace-pre-wrap ${
                isZenMode 
                  ? 'border-0 bg-transparent p-0 min-h-48 max-h-96 text-2xl md:text-3xl leading-loose font-mono' 
                  : 'border border-white/10 rounded-2xl bg-slate-950/50 p-8 min-h-36 max-h-56 overflow-y-auto text-lg leading-relaxed'
              }`}
            >
              {renderTextHighlights()}

              {!isStarted && (
                <div className={`absolute flex items-center gap-1.5 text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1.5 rounded-lg animate-pulse select-none pointer-events-none ${
                  isZenMode ? 'right-0 bottom-0 text-xs' : 'right-3 bottom-3 text-[10px]'
                }`}>
                  <Sparkles size={12} className="text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                  Start typing to begin exam timer
                </div>
              )}
            </div>

            {/* Ghost input area */}
            <textarea
              ref={textInputRef}
              value={rawTypedText}
              onChange={handleTextChange}
              className="absolute w-0 h-0 opacity-0 pointer-events-none"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />

            {/* Control buttons */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex gap-2">
                <button
                  onClick={handleLaunchExam}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyber-red/20 text-white rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Restart Exam
                </button>
                <button
                  onClick={() => setIsZenMode(!isZenMode)}
                  className="px-4 py-2 bg-white/5 border border-cyber-blue/30 hover:bg-cyber-blue/10 text-cyber-blue rounded-lg font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Toggle distraction-free full-screen layout"
                >
                  {isZenMode ? 'Exit Full Screen' : 'Full Screen Mode'}
                </button>
              </div>

              <button
                onClick={() => {
                  if (isPlaying && elapsedTime > 0 && user) {
                    incrementPracticeTime(user.id, elapsedTime);
                  }
                  setIsPlaying(false);
                  setShowResults(false);
                  if (timerRef.current) clearInterval(timerRef.current);
                }}
                className="text-slate-500 hover:text-slate-300 font-semibold"
              >
                Exit Simulation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
