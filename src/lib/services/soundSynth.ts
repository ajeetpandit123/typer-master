/**
 * Sound Synthesis Engine using the Web Audio API.
 * Synthesizes clicking, typing, mechanical switches, and sound effects dynamically in-browser.
 */

let audioCtx: AudioContext | null = null;
let scaleIndex = 0;

// Pentatonic scale pitches (Hz) - C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6
const PENTATONIC_SCALE = [
  261.63, 293.66, 329.63, 392.00, 440.00, 
  523.25, 587.33, 659.25, 783.99, 880.00, 1046.50
];

// Whole Tone scale pitches (Hz) - C4, D4, E4, F#4, G#4, A#4, C5, D5, E5, F#5, G#5, A#5, C6
const WHOLETONE_SCALE = [
  261.63, 293.66, 329.63, 369.99, 415.30, 466.16,
  523.25, 587.33, 659.26, 739.99, 830.61, 932.33, 1046.50
];

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate a brief white noise buffer
function createNoiseBuffer(ctx: AudioContext, duration: number = 0.1): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Play a synthesized sound on keystroke
 */
export function playKeystrokeSound(soundName: string, key: string, volume: number = 0.5) {
  if (typeof window === 'undefined') return;
  if (soundName === 'off') return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Master volume controller
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    // Is it Space or Enter? Use special return ding or heavy bottom-out
    const isBigKey = key === ' ' || key === 'Enter';

    switch (soundName.toLowerCase()) {
      case 'beep': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isBigKey ? 600 : 800, now);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'sine': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isBigKey ? 300 : 400, now);
        
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'sawtooth': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(isBigKey ? 100 : 150, now);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.07);
        break;
      }

      case 'square': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(isBigKey ? 100 : 150, now);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.07);
        break;
      }

      case 'triangle': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isBigKey ? 220 : 300, now);
        
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'pop': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(isBigKey ? 600 : 800, now + 0.05);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.07);
        break;
      }

      case 'osu': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isBigKey ? 900 : 1200, now);
        
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'hitmarker': {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, 0.02);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2800, now);
        filter.Q.setValueAtTime(4, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        noise.start(now);
        noise.stop(now + 0.025);
        break;
      }

      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isBigKey ? 1200 : 1600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.02);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }

      case 'typewriter': {
        if (key === ' ' || key === 'Enter') {
          // Bell Ding!
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(2200, now);
          
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.45);
        } else {
          // Standard type clack
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(ctx, 0.04);
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1400, now);
          filter.Q.setValueAtTime(2, now);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          noise.start(now);
          noise.stop(now + 0.045);
        }
        break;
      }

      case 'fist fight': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isBigKey ? 140 : 180, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        // Add a noise crunch
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, 0.08);
        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(250, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(lpf);
        lpf.connect(noiseGain);
        noiseGain.connect(masterGain);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.2);
        noise.start(now);
        noise.stop(now + 0.09);
        break;
      }

      case 'fart': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(isBigKey ? 80 : 105, now);
        
        // Add frequency flutter/modulation
        osc.frequency.setValueAtTime(isBigKey ? 80 : 105, now + 0.02);
        osc.frequency.setValueAtTime(isBigKey ? 70 : 90, now + 0.05);
        osc.frequency.setValueAtTime(isBigKey ? 95 : 120, now + 0.09);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      case 'pentatonic': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        
        const note = PENTATONIC_SCALE[scaleIndex % PENTATONIC_SCALE.length];
        osc.frequency.setValueAtTime(note, now);
        scaleIndex++;

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.27);
        break;
      }

      case 'wholetone': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        
        const note = WHOLETONE_SCALE[scaleIndex % WHOLETONE_SCALE.length];
        osc.frequency.setValueAtTime(note, now);
        scaleIndex++;

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.27);
        break;
      }

      case 'anvil': {
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        gain.connect(masterGain);

        // Anvil clang requires multiple non-harmonic sine waves
        const frequencies = isBigKey ? [520, 770, 1140] : [976, 1240, 1720];
        frequencies.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.38);
        });
        break;
      }

      case 'laser': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(isBigKey ? 1000 : 1500, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'drum': {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, 0.05);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isBigKey ? 90 : 150, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(now);
        noise.stop(now + 0.06);
        break;
      }

      // Default switches synthesizer router
      default: {
        // Synthesizer setup for different switches
        let bottomOutFreq = 260; 
        let noiseFilterFreq = 1800;
        let decayTime = 0.045;
        let isClicky = false;
        let clickFrequency = 4000;
        let clickVolume = 0.0;
        let switchVolume = 0.8;

        const name = soundName.toLowerCase();
        
        if (name === 'nk creams') {
          bottomOutFreq = 160; 
          noiseFilterFreq = 1200;
          decayTime = 0.04;
          switchVolume = 0.85;
        } else if (name === 'akko lavenders') {
          bottomOutFreq = 220; 
          noiseFilterFreq = 1500;
          decayTime = 0.055;
          switchVolume = 0.75;
        } else if (name === 'rubber keys') {
          bottomOutFreq = 110; 
          noiseFilterFreq = 650;
          decayTime = 0.06;
          switchVolume = 0.6;
        } else if (name === 'cherrymx black abs') {
          bottomOutFreq = 290; 
          noiseFilterFreq = 2100;
          decayTime = 0.04;
          switchVolume = 0.8;
        } else if (name === 'cherrymx black pbt') {
          bottomOutFreq = 190; 
          noiseFilterFreq = 1350;
          decayTime = 0.04;
          switchVolume = 0.85;
        } else if (name === 'cherrymx blue abs') {
          bottomOutFreq = 290; 
          noiseFilterFreq = 2200;
          decayTime = 0.045;
          isClicky = true;
          clickFrequency = 4300;
          clickVolume = 0.55;
        } else if (name === 'cherrymx blue pbt') {
          bottomOutFreq = 210; 
          noiseFilterFreq = 1500;
          decayTime = 0.048;
          isClicky = true;
          clickFrequency = 3900;
          clickVolume = 0.45;
        } else if (name === 'cherrymx brown pbt') {
          bottomOutFreq = 220; 
          noiseFilterFreq = 1400;
          decayTime = 0.045;
          switchVolume = 0.65;
        } else if (name === 'kalih box white') {
          bottomOutFreq = 250; 
          noiseFilterFreq = 2400;
          decayTime = 0.035;
          isClicky = true;
          clickFrequency = 4600;
          clickVolume = 0.65;
        } else if (name === 'razer green') {
          bottomOutFreq = 310; 
          noiseFilterFreq = 2300;
          decayTime = 0.055;
          isClicky = true;
          clickFrequency = 4100;
          clickVolume = 0.6;
        } else if (name === 'tealios v2') {
          bottomOutFreq = 175; 
          noiseFilterFreq = 1250;
          decayTime = 0.042;
          switchVolume = 0.9;
        } else if (name === 'trust gxt') {
          bottomOutFreq = 330; 
          noiseFilterFreq = 2400;
          decayTime = 0.065;
          switchVolume = 0.7;
        }

        // Adjust parameters for spacebar / enter
        if (isBigKey) {
          bottomOutFreq *= 0.6;
          noiseFilterFreq *= 0.8;
          decayTime *= 1.5;
          clickVolume *= 0.5;
          switchVolume *= 1.1;
        }

        // Double click bottom-out synthesis
        // 1. Bottom out thock
        const thockOsc = ctx.createOscillator();
        const thockGain = ctx.createGain();
        thockOsc.type = 'triangle';
        thockOsc.frequency.setValueAtTime(bottomOutFreq * 1.4, now);
        thockOsc.frequency.exponentialRampToValueAtTime(bottomOutFreq * 0.9, now + 0.015);

        thockGain.gain.setValueAtTime(switchVolume * 0.45, now);
        thockGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

        thockOsc.connect(thockGain);
        thockGain.connect(masterGain);

        // 2. Sliding friction clack noise
        const clackNoise = ctx.createBufferSource();
        clackNoise.buffer = createNoiseBuffer(ctx, decayTime * 1.2);
        
        const clackFilter = ctx.createBiquadFilter();
        clackFilter.type = 'bandpass';
        clackFilter.frequency.setValueAtTime(noiseFilterFreq, now);
        clackFilter.Q.setValueAtTime(2.2, now);

        const clackGain = ctx.createGain();
        clackGain.gain.setValueAtTime(switchVolume * 0.5, now);
        clackGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime * 0.8);

        clackNoise.connect(clackFilter);
        clackFilter.connect(clackGain);
        clackGain.connect(masterGain);

        // Start primary switch audio nodes
        thockOsc.start(now);
        thockOsc.stop(now + decayTime + 0.01);
        clackNoise.start(now);
        clackNoise.stop(now + decayTime * 1.5);

        // 3. Crisp leaf clicks (for clicky switches like Razer Green / Blue MX / Kailh)
        if (isClicky) {
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          
          clickOsc.type = 'sine';
          clickOsc.frequency.setValueAtTime(clickFrequency, now);
          
          // Delayed slightly by 2ms for double-tap feel
          clickGain.gain.setValueAtTime(0, now);
          clickGain.gain.setValueAtTime(clickVolume, now + 0.002);
          clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.002 + 0.005);

          clickOsc.connect(clickGain);
          clickGain.connect(masterGain);
          
          clickOsc.start(now);
          clickOsc.stop(now + 0.01);
        }
        break;
      }
    }
  } catch (err) {
    console.error('Audio synthesis failed:', err);
  }
}
