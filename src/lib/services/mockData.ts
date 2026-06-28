import { CODING_LESSONS_DATA } from './lessons/codingData';
import { QUOTES_DATA } from './lessons/quotesData';

export interface CodingLesson {
  id: string;
  level: number;
  language: 'javascript' | 'java' | 'cpp';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  description: string;
  code: string;
}

export interface Challenge {
  id: string;
  level: number;
  title: string;
  description: string;
  text: string;
  targetWpm: number;
  targetAccuracy: number;
  timeLimit: number; // in seconds
  focusType: 'standard' | 'accuracy' | 'speed' | 'endurance';
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'motivation' | 'business' | 'technology' | 'leadership' | 'education' | 'philosophy';
  lengthCategory: 'short' | 'medium' | 'long';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  conditionType: 'first_lesson' | 'wpm_50' | 'wpm_100' | 'streak_7' | 'streak_30' | 'challenge_20' | 'battle_win';
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_lesson', title: 'First Steps', description: 'Complete your first letter lesson', icon: 'BookOpen', xpReward: 100, conditionType: 'first_lesson' },
  { id: 'wpm_50', title: 'Speed Demon', description: 'Achieve 50 Words Per Minute in a test', icon: 'Zap', xpReward: 250, conditionType: 'wpm_50' },
  { id: 'wpm_100', title: 'Hyper Sonic', description: 'Achieve 100 Words Per Minute in a test', icon: 'Flame', xpReward: 500, conditionType: 'wpm_100' },
  { id: 'streak_7', title: 'Consistent Typist', description: 'Maintain a 7-day practice streak', icon: 'CalendarDays', xpReward: 300, conditionType: 'streak_7' },
  { id: 'streak_30', title: 'Unstoppable Force', description: 'Maintain a 30-day practice streak', icon: 'Trophy', xpReward: 1000, conditionType: 'streak_30' },
  { id: 'challenge_20', title: 'Grandmaster', description: 'Unlock and complete Challenge Level 20', icon: 'ShieldAlert', xpReward: 800, conditionType: 'challenge_20' },
  { id: 'battle_win', title: 'Arena Champion', description: 'Win a multiplayer typing battle', icon: 'Sword', xpReward: 400, conditionType: 'battle_win' },
];

export const CODING_LESSONS: CodingLesson[] = CODING_LESSONS_DATA;
export const QUOTES: Quote[] = QUOTES_DATA;

// List of 60 unique texts for levels, custom selected to match standard, accuracy, speed, and endurance focus types.
const CHALLENGE_TEXTS = [
  // 1-15: Standard Levels
  "A simple beginning to test your alignment. Place your index fingers on J and F keys.",
  "Slow and steady wins the race. Maintain high focus on typing letters correctly before gaining speed.",
  "Moving up! Let's practice simple words such as standard home row letters: asdf, jkl; and short words.",
  "To reach success, consistency is essential. Build the habit of practicing typing routines daily.",
  "Typing speed increases naturally as finger memory develops. Never look down at the keyboard keys while practicing.",
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter in the alphabet.",
  "Intermediate typing requires utilizing capitalization. Hold the Shift key with your opposite hand.",
  "Numbers are positioned on the top row. Try typing: 12345, 67890. Keep your wrists hovering comfortably.",
  "Punctuation adds clarity. Use commas, periods, and semicolons correctly: let's do this, okay?",
  "Software engineers type special characters often. Parentheses (like these) and braces {like this} are common.",
  "Excellent speed is achieved through muscle memory. Let the hands flow over the keyboard without thinking.",
  "Advanced typing requires speed, precision, and endurance. Keep your target accuracy high above ninety percent.",
  "Look ahead at the next word! While typing the current word, your eyes should already scan the upcoming characters.",
  "Challenge your limits! Focus on the rhythm of your typing rather than the speed. Smooth is fast, and fast is smooth.",
  "Programmers need to master symbols: &&, ||, ++, --, ==, !=, +=, -=, *=, /=. Practice these double combinations.",

  // 16-30: Accuracy Trials
  "flawless execution requires deliberate focus. typing with absolute precision builds clean muscle memory.",
  "quick steps lead to slips. slow down your fingers and ensure every keycap is struck cleanly and correctly.",
  "correcting errors drags down your words per minute. typing without mistakes is the ultimate speed hack.",
  "concentrate on the letters. block out all distractions and flow smoothly from key to key without hesitation.",
  "accuracy is the foundation. speed is merely the structure built upon it. get the base right first.",
  "each letter must be typed in its exact sequence. do not let your hands rush ahead of your visual reading speed.",
  "a single mistake fails this level. type with a relaxed posture and press each key deliberately.",
  "double check your spacing. the spacebar is a key just like any other and deserves the same steady timing.",
  "patience is key. do not get frustrated by difficult letter combinations. take them slow and steady.",
  "focus on your weak fingers. the pinky and ring fingers require extra attention to build identical strength.",
  "rhythmic typing sounds like a steady drumbeat. avoid typing in fast erratic bursts and keep a steady flow.",
  "watch your accuracy meter. keep it green and do not let it drop even for a single key combination.",
  "maintain absolute concentration. your mind must guide your fingers to the center of each keycap cleanly.",
  "perfect practice makes perfect. typing with mistakes only trains your hands to make more mistakes.",
  "zero typos allowed. prove your mastery by finishing this final extreme precision training module.",

  // 31-45: Speed Blitzes
  "Zooming fast! Speed is the name of this game. Push your fingers to the limits of muscle memory.",
  "Go go go! Do not hesitate for a second. Tap the keys as fast as you can read them.",
  "Blitz mode activated! Keep your fingers moving in a continuous stream of rapid taps.",
  "Adrenaline rush! Speed typing requires lightning reflexes and absolute confidence in layout.",
  "Tap tap tap! Let the letters flow from your fingers without conscious thought or block.",
  "Unleash the speed! Push through your previous limits and type this passage with maximum velocity.",
  "Fast fingers win the battle. Build high speed by group-reading entire words ahead.",
  "Sprint to the finish! This short blitz is designed to test your maximum typing speed capability.",
  "Rapid fire! Keep a light touch on the keycaps to allow your fingers to float effortlessly.",
  "Turbo speed! Do not look back or hesitate. Keep pushing the tempo faster and faster.",
  "Break the sound barrier! Speed typing requires a relaxed hand and direct finger movements.",
  "Maximum output! Type this sentence with high speed and let muscle memory guide your hands.",
  "Lightning fast! Focus on high velocity and let the layout guide your fingers automatically.",
  "Hyper drive! Tap the keys with a quick, springy motion to release them instantly.",
  "Speed champion! Finish this final blitz with extreme velocity to unlock the next category.",

  // 46-60: Endurance Marathons
  "To type for long periods without fatigue, you must maintain excellent ergonomics. Keep your back straight, your feet flat on the floor, and your wrists hovering slightly above the keyboard. Let your arms relax from the shoulders, and use a light touch to strike the center of each keycap. Rhythmic breathing and a relaxed mindset will help you maintain high speed and precision over long, demanding typing runs.",
  "Consistency is the difference between a good typist and a master. Anyone can type a short sentence at a hundred words per minute, but maintaining that speed over a multi-paragraph document requires intense concentration and muscle endurance. Pace yourself at the beginning of long tests, find a comfortable, steady rhythm, and focus on typing clean words. Speed will naturally compound as you build endurance.",
  "When typing complex documentation or writing long emails, your brain is working in tandem with your motor cortex. It reads words ahead, plans the muscle contractions for each finger, and verifies the output on the screen. To optimize this pipeline, train yourself to read entire phrases rather than individual letters. This group-reading habit reduces cognitive load and allows your hands to flow smoothly.",
  "Developing muscle memory is a physiological process that takes time and regular sleep. When you practice typing drills, you are building myelin sheaths around the neural pathways in your brain, making the electrical signals travel faster and more automatically. This is why short daily practice sessions are infinitely more effective than a single weekly marathon. Remain consistent, and progress is guaranteed.",
  "Ergonomic keyboards, mechanical switches, and custom keycap profiles are excellent tools, but they cannot replace proper typing form. Avoid resting your wrists on the desk or the wrist rest while typing, as this puts pressure on the carpal tunnel and limits your hand movement. Hovering your hands allows your fingers to reach the top and bottom rows naturally, reducing strain and increasing speed.",
  "Writing code involves a high density of special characters, capitalization changes, and indentation spaces. To maintain high coding productivity, programmers must master typing symbols without looking down. Practice finding keys like brackets, braces, parentheses, semicolons, and operators using standard fingering. This muscle memory bridges the gap between software design and computer execution.",
  "The history of the keyboard layout is a story of constraints and path dependency. The QWERTY layout was originally designed in the nineteenth century for mechanical typewriters, arranging common letter pairs apart to prevent the physical typebars from jamming. Despite the invention of electronic keyboards and more ergonomic layouts like Dvorak or Colemak, QWERTY remains the global digital standard.",
  "A classy user interface is built on solid design principles: consistent spacing, readable typography, functional color palettes, and interactive micro-animations. When we construct interfaces that react to user inputs with subtle, elegant transitions, we elevate the experience from a simple tool to a premium platform. This attention to detail wows users at first glance and encourages daily engagement.",
  "Maintaining focus under pressure is a critical skill for multiplayer typing battles. When you see your opponent's progress bar moving ahead, it is easy to panic and rush, which leads to typos that drag your speed down. Train your mind to ignore the competition, focus entirely on your own text, and maintain your natural typing rhythm. Smoothness is the absolute key to victory in speed contests.",
  "In typing, as in software development, the secret to mastering complex actions is decomposition. Break down long words into syllables, difficult combinations into simple reaches, and complex coding structures into modular blocks. By mastering each small element individually, you build a cohesive, reliable skill set that allows you to execute complex tasks with minimal effort and maximum precision.",
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Sphinx of black quartz, judge my vow. Five quacking zephyrs jolt my wax bed. Cozy lummox gives smart squid job pen. These sentences are pangrams, meaning they contain every letter of the English alphabet. Practicing them regularly ensures all fingers get equal training across the entire keyboard layout.",
  "When you reach a speed plateau, it is often because of tense muscles or suboptimal fingering. Analyze your movements to see if you are using the correct fingers for outer keys like Q, P, Z, and punctuation marks. Using the wrong fingers causes awkward hand shifts, which break your typing flow and introduce typos. Slow down, correct your technique, and you will quickly break through your speed ceiling.",
  "A healthy lifestyle supports high cognitive and motor performance. Drinking enough water, taking regular breaks, and stretching your hands prevent repetitive strain injuries and keep your joints flexible. If you feel pain or numbness in your wrists, stop typing immediately and rest. Longevity in typing, coding, and any digital career requires taking proactive care of your physical body.",
  "Typing is a direct reflection of your mental state. If your mind is cluttered and rushed, your typing will be chaotic and full of errors. Before starting an assessment, take a deep breath, clear your mind, and commit to typing with calm, steady precision. Let your hands follow the path they know, and trust your muscle memory to handle the details while you guide the overall speed and rhythm.",
  "Congratulations on reaching the final level of the typing challenge! You have proven your speed, precision, and endurance across sixty progressive modules. You have mastered home row alignment, number keys, complex symbols, extreme accuracy limits, lightning-fast blitzes, and long endurance tests. Continue practicing daily to maintain this elite level and remain a true TypeMaster!"
];

export const CHALLENGES: Challenge[] = Array.from({ length: 60 }, (_, index) => {
  const level = index + 1;
  let focusType: 'standard' | 'accuracy' | 'speed' | 'endurance' = 'standard';
  let speedTarget = 20;
  let accuracyTarget = 80;
  let timeLimit = 60;
  let title = '';
  let description = '';

  if (level <= 15) {
    // 1-15: Standard Levels
    focusType = 'standard';
    speedTarget = 20 + level * 3; // Level 1: 23 WPM, Level 15: 65 WPM
    accuracyTarget = 80 + Math.min(10, Math.floor(level / 1.5)); // Level 1: 80%, Level 15: 90%
    timeLimit = Math.max(30, 90 - level * 3); // Level 1: 87s, Level 15: 45s
    title = `Level ${level}: Apprentice Run`;
    description = `Achieve ${speedTarget} WPM and ${accuracyTarget}% accuracy in ${timeLimit}s.`;
  } else if (level <= 30) {
    // 16-30: Accuracy Trials
    focusType = 'accuracy';
    const subIdx = level - 15;
    speedTarget = 30 + subIdx * 2; // Level 16: 32 WPM, Level 30: 60 WPM
    accuracyTarget = 97 + Math.min(3, Math.floor(subIdx / 5)); // Level 16: 97%, Level 30: 100%
    timeLimit = Math.max(45, 90 - subIdx * 2); 
    title = `Level ${level}: Precision Trial`;
    description = `Requires ${accuracyTarget}% Accuracy and ${speedTarget} WPM. No room for typos!`;
  } else if (level <= 45) {
    // 31-45: Speed Blitzes
    focusType = 'speed';
    const subIdx = level - 30;
    speedTarget = 65 + subIdx * 3; // Level 31: 68 WPM, Level 45: 110 WPM
    accuracyTarget = 85 + Math.min(7, Math.floor(subIdx / 3)); // Level 31: 85%, Level 45: 90%
    timeLimit = Math.max(15, 35 - subIdx * 1); // Fast blitzes: 35s down to 20s
    title = `Level ${level}: Speed Blitz`;
    description = `Hit a rapid ${speedTarget} WPM target with ${accuracyTarget}% accuracy in ${timeLimit}s!`;
  } else {
    // 46-60: Endurance Marathons
    focusType = 'endurance';
    const subIdx = level - 45;
    speedTarget = 50 + subIdx * 3; // Level 46: 53 WPM, Level 60: 95 WPM
    accuracyTarget = 92 + Math.min(6, Math.floor(subIdx / 3)); // Level 46: 92%, Level 60: 97%
    timeLimit = 90 + subIdx * 5; // Long tests: 95s up to 170s
    title = `Level ${level}: Endurance Run`;
    description = `Type a long, detailed passage at ${speedTarget} WPM and ${accuracyTarget}% accuracy.`;
  }

  return {
    id: `challenge-${level}`,
    level,
    title,
    description,
    text: CHALLENGE_TEXTS[index] || "Default typing challenge text.",
    targetWpm: speedTarget,
    targetAccuracy: accuracyTarget,
    timeLimit,
    focusType
  };
});
