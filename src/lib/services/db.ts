import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  wpm: number;
  accuracy: number;
  practiceTime: number; // in seconds
  streak: number;
  lastActive: string;
  email?: string;
  role: 'user' | 'admin';
}

export interface TypingSession {
  id: string;
  userId: string;
  wpm: number;
  accuracy: number;
  levelType: 'beginner' | 'intermediate' | 'advanced' | 'quote' | 'coding' | 'battle' | 'exam' | 'my_words';
  duration: number; // seconds
  errors: number;
  charsTyped: number;
  createdAt: string;
}

export interface ChallengeProgress {
  id: string;
  userId: string;
  challengeLevel: number;
  wpm: number;
  accuracy: number;
  completedAt: string;
}

// Check if we are running in Local Storage or Supabase
export const isLocalMode = (): boolean => {
  return !isSupabaseConfigured();
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest-user-id',
  username: 'GuestTypist',
  avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Guest',
  level: 1,
  xp: 0,
  wpm: 0,
  accuracy: 0,
  practiceTime: 0,
  streak: 1,
  lastActive: new Date().toISOString(),
  email: 'guest@typemaster.pro',
  role: 'user'
};

// ---------------- LOCAL STORAGE DATA HELPERS ----------------
const getLocalData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(`typemaster_${key}`);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocalData = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`typemaster_${key}`, JSON.stringify(value));
};

// ---------------- TIMEZONE-SAFE DATE & STREAK HELPERS ----------------
const getLocalDateString = (dateOrStr: Date | string): string => {
  const d = new Date(dateOrStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const calculateStreakFromSessions = (sessions: TypingSession[]): number => {
  if (sessions.length === 0) return 0;

  // Extract local date strings and get unique sorted days (descending)
  const uniqueDays = Array.from(new Set(sessions.map(s => getLocalDateString(s.createdAt))))
    .sort((a, b) => b.localeCompare(a));

  if (uniqueDays.length === 0) return 0;

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const mostRecentDay = uniqueDays[0];

  // If the most recent practice day is neither today nor yesterday, streak is 0
  if (mostRecentDay !== todayStr && mostRecentDay !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  const currentCheckDate = parseLocalDate(mostRecentDay);

  while (true) {
    const checkStr = getLocalDateString(currentCheckDate);
    if (uniqueDays.includes(checkStr)) {
      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// ---------------- USER AUTHENTICATION & PROFILE ----------------
export const getActiveUser = async () => {
  if (isLocalMode()) {
    const isLoggedIn = getLocalData<boolean>('is_logged_in', false);
    if (!isLoggedIn) return null;
    return {
      id: 'guest-user-id',
      email: getLocalData<string>('user_email', 'guest@typemaster.pro'),
      user_metadata: {
        username: getLocalData<string>('username', 'GuestTypist'),
        avatar_url: getLocalData<string>('avatar_url', 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Guest')
      }
    };
  }

  const { data: { user }, error } = await supabase!.auth.getUser();
  if (error || !user) return null;
  return user;
};

export const getProfile = async (userId: string): Promise<UserProfile> => {
  let profile: UserProfile;
  
  const isUuid = (val: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  };

  if (isLocalMode() || !isUuid(userId)) {
    profile = getLocalData<UserProfile>('profile', DEFAULT_PROFILE);
    
    // Auto-heal missing role or email properties from previous sessions
    const storedEmail = typeof window !== 'undefined' 
      ? (localStorage.getItem('typemaster_user_email') || 'guest@typemaster.pro') 
      : 'guest@typemaster.pro';
      
    if (!profile.role || !profile.email) {
      profile.email = storedEmail;
      profile.role = storedEmail === 'kumarajeet19022004@gmail.com' ? 'admin' : 'user';
      if (typeof window !== 'undefined') {
        localStorage.setItem('typemaster_profile', JSON.stringify(profile));
      }
    }
  } else {
    const { data, error } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        try {
          const { data: { user: authUser } } = await supabase!.auth.getUser();
          let username = authUser?.user_metadata?.username || authUser?.email?.split('@')[0] || 'NewTypist';
          
          // Make sure username is unique in profiles table
          let isUnique = false;
          let attempts = 0;
          let checkUsername = username;
          while (!isUnique && attempts < 10) {
            const { data: existingUser, error: checkErr } = await supabase!
              .from('profiles')
              .select('username')
              .eq('username', checkUsername)
              .maybeSingle();
            
            if (!checkErr && !existingUser) {
              isUnique = true;
              username = checkUsername;
            } else {
              // Append a random 3-digit suffix to differentiate
              checkUsername = `${username}${Math.floor(100 + Math.random() * 900)}`;
              attempts++;
            }
          }

          const avatarUrl = authUser?.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + username;
          const userEmail = authUser?.email || '';
          const userRole = userEmail === 'kumarajeet19022004@gmail.com' ? 'admin' : 'user';

          const newProfileData = {
            id: userId,
            email: userEmail,
            role: userRole,
            username,
            avatar_url: avatarUrl,
            level: 1,
            xp: 0,
            wpm: 0,
            accuracy: 0.00,
            practice_time: 0,
            streak: 1,
            last_active: new Date().toISOString()
          };

          const { data: inserted, error: insertErr } = await supabase!
            .from('profiles')
            .insert(newProfileData)
            .select()
            .single();

          if (insertErr) {
            console.error('Failed to auto-create profile:', insertErr);
            profile = { ...DEFAULT_PROFILE, id: userId, email: userEmail, role: userRole };
          } else {
            profile = {
              id: inserted.id,
              username: inserted.username,
              avatarUrl: inserted.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + inserted.username,
              level: inserted.level,
              xp: inserted.xp,
              wpm: inserted.wpm,
              accuracy: Number(inserted.accuracy),
              practiceTime: inserted.practice_time,
              streak: inserted.streak,
              lastActive: inserted.last_active,
              email: inserted.email || '',
              role: (inserted.role as 'user' | 'admin') || 'user'
            };
          }
        } catch (authErr) {
          console.error('Failed auth metadata check for profile auto-create:', authErr);
          profile = { ...DEFAULT_PROFILE, id: userId };
        }
      } else {
        console.error('Error fetching profile:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        profile = { ...DEFAULT_PROFILE, id: userId };
      }
    } else {
      profile = {
        id: data.id,
        username: data.username,
        avatarUrl: data.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + data.username,
        level: data.level,
        xp: data.xp,
        wpm: data.wpm,
        accuracy: Number(data.accuracy),
        practiceTime: data.practice_time,
        streak: data.streak,
        lastActive: data.last_active,
        email: data.email || '',
        role: (data.role as 'user' | 'admin') || 'user'
      };
    }
  }

  // Calculate and sync daily streak dynamically from sessions history
  const sessions = await getSessions(userId);
  const calculatedStreak = calculateStreakFromSessions(sessions);

  if (profile.streak !== calculatedStreak) {
    profile.streak = calculatedStreak;
    if (isLocalMode()) {
      setLocalData('profile', profile);
    } else {
      await supabase!
        .from('profiles')
        .update({ streak: calculatedStreak })
        .eq('id', userId);
    }
  }

  return profile;
};

export const updateProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  if (isLocalMode()) {
    const current = getLocalData<UserProfile>('profile', DEFAULT_PROFILE);
    const updated = { ...current, ...updates, lastActive: new Date().toISOString() };
    setLocalData('profile', updated);
    return updated;
  }

  const mappedUpdates: any = {};
  if (updates.username !== undefined) mappedUpdates.username = updates.username;
  if (updates.avatarUrl !== undefined) mappedUpdates.avatar_url = updates.avatarUrl;
  if (updates.level !== undefined) mappedUpdates.level = updates.level;
  if (updates.xp !== undefined) mappedUpdates.xp = updates.xp;
  if (updates.wpm !== undefined) mappedUpdates.wpm = updates.wpm;
  if (updates.accuracy !== undefined) mappedUpdates.accuracy = updates.accuracy;
  if (updates.practiceTime !== undefined) mappedUpdates.practice_time = updates.practiceTime;
  if (updates.streak !== undefined) mappedUpdates.streak = updates.streak;
  if (updates.email !== undefined) mappedUpdates.email = updates.email;
  if (updates.role !== undefined) mappedUpdates.role = updates.role;
  mappedUpdates.last_active = new Date().toISOString();

  const { data, error } = await supabase!
    .from('profiles')
    .update(mappedUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return {
    id: data.id,
    username: data.username,
    avatarUrl: data.avatar_url,
    level: data.level,
    xp: data.xp,
    wpm: data.wpm,
    accuracy: Number(data.accuracy),
    practiceTime: data.practice_time,
    streak: data.streak,
    lastActive: data.last_active,
    email: data.email || '',
    role: (data.role as 'user' | 'admin') || 'user'
  };
};

export const incrementPracticeTime = async (userId: string, seconds: number): Promise<void> => {
  if (seconds <= 0) return;
  try {
    const profile = await getProfile(userId);
    await updateProfile(userId, {
      practiceTime: profile.practiceTime + seconds
    });
  } catch (err) {
    console.error('Failed to increment practice time:', err);
  }
};

export const grantXp = async (userId: string, xpAmount: number): Promise<{ levelUp: boolean, currentLevel: number, newXp: number }> => {
  const profile = await getProfile(userId);
  let newXp = profile.xp + xpAmount;
  let level = profile.level;
  let levelUp = false;

  // Level up curve: Level * 500 XP required per level
  while (newXp >= level * 500) {
    newXp -= level * 500;
    level += 1;
    levelUp = true;
  }

  await updateProfile(userId, { level, xp: newXp });
  return { levelUp, currentLevel: level, newXp };
};

// ---------------- TYPING SESSIONS ----------------
export const getSessions = async (userId: string): Promise<TypingSession[]> => {
  if (isLocalMode()) {
    return getLocalData<TypingSession[]>('sessions', []);
  }

  const { data, error } = await supabase!
    .from('typing_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    userId: d.user_id,
    wpm: d.wpm,
    accuracy: Number(d.accuracy),
    levelType: d.level_type,
    duration: d.duration,
    errors: d.errors,
    charsTyped: d.chars_typed,
    createdAt: d.created_at
  }));
};

export const saveSession = async (
  userId: string, 
  session: Omit<TypingSession, 'id' | 'userId' | 'createdAt'>
): Promise<TypingSession> => {
  const newSession: TypingSession = {
    ...session,
    id: Math.random().toString(36).substring(7),
    userId,
    createdAt: new Date().toISOString()
  };

  // 1. Save Session
  if (isLocalMode()) {
    const list = getLocalData<TypingSession[]>('sessions', []);
    list.unshift(newSession);
    setLocalData('sessions', list);
  } else {
    const { error } = await supabase!
      .from('typing_sessions')
      .insert([{
        user_id: userId,
        wpm: session.wpm,
        accuracy: session.accuracy,
        level_type: session.levelType,
        duration: session.duration,
        errors: session.errors,
        chars_typed: session.charsTyped
      }]);
    if (error) console.error('Error saving session:', error);
  }

  // 2. Update Stats in User Profile
  const profile = await getProfile(userId);
  const currentSessions = await getSessions(userId);
  const count = currentSessions.length;
  
  // Calculate rolling accuracy
  const totalAcc = currentSessions.reduce((sum, s) => sum + s.accuracy, 0);
  const newAvgAccuracy = Math.round((totalAcc / (count || 1)) * 100) / 100;
  
  // Max WPM (only update if accuracy is >= 75%)
  const maxWpm = session.accuracy >= 75 ? Math.max(profile.wpm, session.wpm) : profile.wpm;
  
  await updateProfile(userId, {
    wpm: maxWpm,
    accuracy: newAvgAccuracy,
    practiceTime: profile.practiceTime + session.duration,
    streak: profile.streak
  });

  // 3. Grant XP: 1 XP per word typed correctly, plus bonus if accuracy > 95%
  const wordsTyped = Math.round((session.charsTyped - session.errors) / 5);
  const xpReward = Math.max(10, wordsTyped) + (session.accuracy >= 95 ? 50 : 0);
  await grantXp(userId, xpReward);

  // 4. Check and unlock streak achievements
  if (profile.streak >= 7) {
    await unlockAchievement(userId, 'streak_7');
  }
  if (profile.streak >= 30) {
    await unlockAchievement(userId, 'streak_30');
  }

  return newSession;
};

// ---------------- CHALLENGE PROGRESS ----------------
export const getChallengeProgress = async (userId: string): Promise<Record<number, ChallengeProgress>> => {
  if (isLocalMode()) {
    const list = getLocalData<ChallengeProgress[]>('challenges', []);
    const mapping: Record<number, ChallengeProgress> = {};
    list.forEach(c => {
      mapping[c.challengeLevel] = c;
    });
    return mapping;
  }

  const { data, error } = await supabase!
    .from('challenge_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching challenge progress:', error);
    return {};
  }

  const mapping: Record<number, ChallengeProgress> = {};
  data.forEach((d: any) => {
    mapping[d.challenge_level] = {
      id: d.id,
      userId: d.user_id,
      challengeLevel: d.challenge_level,
      wpm: d.wpm,
      accuracy: Number(d.accuracy),
      completedAt: d.completed_at
    };
  });
  return mapping;
};

export const saveChallengeCompletion = async (
  userId: string,
  level: number,
  wpm: number,
  accuracy: number
): Promise<void> => {
  const newProgress: ChallengeProgress = {
    id: Math.random().toString(36).substring(7),
    userId,
    challengeLevel: level,
    wpm,
    accuracy,
    completedAt: new Date().toISOString()
  };

  if (isLocalMode()) {
    const list = getLocalData<ChallengeProgress[]>('challenges', []);
    const filtered = list.filter(c => c.challengeLevel !== level);
    filtered.push(newProgress);
    setLocalData('challenges', filtered);
  } else {
    const { error } = await supabase!
      .from('challenge_progress')
      .upsert({
        user_id: userId,
        challenge_level: level,
        wpm,
        accuracy
      }, { onConflict: 'user_id, challenge_level' });
    if (error) console.error('Error saving challenge progress:', error);
  }

  // Grant XP: 100 XP per level completed
  await grantXp(userId, 150);
  
  // Check level 20 for Grandmaster badge
  if (level === 20) {
    await unlockAchievement(userId, 'challenge_20');
  }
};

// ---------------- ACHIEVEMENTS SYSTEM ----------------
export const getUnlockedAchievements = async (userId: string): Promise<string[]> => {
  if (isLocalMode()) {
    return getLocalData<string[]>('unlocked_achievements', []);
  }

  const { data, error } = await supabase!
    .from('achievements_unlocked')
    .select('achievement_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching unlocked achievements:', error);
    return [];
  }

  return data.map((d: any) => d.achievement_id);
};

export const unlockAchievement = async (userId: string, achievementId: string): Promise<boolean> => {
  const unlocked = await getUnlockedAchievements(userId);
  if (unlocked.includes(achievementId)) return false; // Already unlocked

  if (isLocalMode()) {
    unlocked.push(achievementId);
    setLocalData('unlocked_achievements', unlocked);
  } else {
    const { error } = await supabase!
      .from('achievements_unlocked')
      .insert([{ user_id: userId, achievement_id: achievementId }]);
    if (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  // Grant achievement XP Reward
  const reward = {
    'first_lesson': 100,
    'wpm_50': 250,
    'wpm_100': 500,
    'streak_7': 300,
    'streak_30': 1000,
    'challenge_20': 800,
    'battle_win': 400
  }[achievementId] || 100;

  await grantXp(userId, reward);
  return true;
};

// ---------------- GLOBAL LEADERBOARD ----------------
export interface LeaderboardEntry {
  username: string;
  avatarUrl: string;
  wpm: number;
  accuracy: number;
  level: number;
  wins: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { username: 'TypeSpeedDemon', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Demon', wpm: 124, accuracy: 99.4, level: 48, wins: 142 },
  { username: 'KeyboardCat', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Cat', wpm: 112, accuracy: 98.1, level: 36, wins: 95 },
  { username: 'CodingNinja', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ninja', wpm: 104, accuracy: 97.8, level: 29, wins: 64 },
  { username: 'FingerMemory', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Finger', wpm: 96, accuracy: 98.9, level: 25, wins: 41 },
  { username: 'WpmWizard', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Wizard', wpm: 88, accuracy: 96.5, level: 22, wins: 33 },
];

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  if (isLocalMode()) {
    // Add current user to leaderboard dynamically if their stats are present
    const profile = getLocalData<UserProfile>('profile', DEFAULT_PROFILE);
    const hasStats = profile.wpm > 0;
    
    let baseList = [...MOCK_LEADERBOARD];
    
    // Check if user is already in the mock list (to prevent duplication)
    const existingIdx = baseList.findIndex(e => e.username.toLowerCase() === profile.username.toLowerCase());
    
    const userWins = getLocalData<number>('battle_wins', 0);
    const userEntry: LeaderboardEntry = {
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      wpm: profile.wpm,
      accuracy: profile.accuracy,
      level: profile.level,
      wins: userWins
    };
    
    if (existingIdx >= 0) {
      if (hasStats) {
        baseList[existingIdx] = userEntry;
      }
    } else if (hasStats) {
      baseList.push(userEntry);
    }
    
    return baseList.sort((a, b) => b.wpm - a.wpm);
  }

  // For Supabase, query all profiles sorted by max WPM
  const { data, error } = await supabase!
    .from('profiles')
    .select('id, username, avatar_url, wpm, accuracy, level')
    .order('wpm', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return MOCK_LEADERBOARD;
  }

  // Fetch battle victory counts for these profiles
  const profileIds = data.map((d: any) => d.id).filter(Boolean);
  let winsMap: Record<string, number> = {};
  if (profileIds.length > 0) {
    const { data: winsData, error: winsError } = await supabase!
      .from('room_players')
      .select('user_id')
      .in('user_id', profileIds)
      .eq('is_winner', true);

    if (!winsError && winsData) {
      winsData.forEach((w: any) => {
        if (w.user_id) {
          winsMap[w.user_id] = (winsMap[w.user_id] || 0) + 1;
        }
      });
    }
  }

  return data.map((d: any) => ({
    username: d.username,
    avatarUrl: d.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + d.username,
    wpm: d.wpm,
    accuracy: Number(d.accuracy),
    level: d.level,
    wins: winsMap[d.id] || 0
  }));
};
