'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getActiveUser, 
  getProfile, 
  UserProfile, 
  isLocalMode
} from '@/lib/services/db';
import { supabase, isSupabaseConfigured } from '@/lib/services/supabaseClient';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'error' | 'achievement';
}

interface AppContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  localMode: boolean;
  toasts: ToastMessage[];
  caretBlinking: boolean;
  setCaretBlinking: (val: boolean) => void;
  cursorStyle: 'cyber' | 'simple';
  setCursorStyle: (val: 'cyber' | 'simple') => void;
  addToast: (title: string, description: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  logInLocal: (username: string, email: string) => Promise<void>;
  signUpLocal: (username: string, email: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [localMode, setLocalMode] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [caretBlinking, setCaretBlinking] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('typemaster_caret_blinking');
      return stored !== null ? stored === 'true' : false;
    }
    return false;
  });
  const [cursorStyle, setCursorStyle] = useState<'cyber' | 'simple'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('typemaster_cursor_style');
      return (stored === 'cyber' || stored === 'simple') ? stored : 'simple';
    }
    return 'simple';
  });

  // Update body classes when caretBlinking or cursorStyle changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typemaster_caret_blinking', String(caretBlinking));
      localStorage.setItem('typemaster_cursor_style', cursorStyle);

      if (caretBlinking) {
        document.body.classList.remove('no-blink');
      } else {
        document.body.classList.add('no-blink');
      }

      if (cursorStyle === 'cyber') {
        document.body.classList.remove('cursor-simple');
        document.body.classList.add('cursor-cyber');
      } else {
        document.body.classList.remove('cursor-cyber');
        document.body.classList.add('cursor-simple');
      }
    }
  }, [caretBlinking, cursorStyle]);

  const addToast = (title: string, description: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const uProfile = await getProfile(user.id);
        setProfile(uProfile);
      } catch (err) {
        console.error('Failed to reload user profile:', err);
      }
    }
  };

  // Sync auth state
  useEffect(() => {
    const initAuth = async () => {
      const mode = isLocalMode();
      setLocalMode(mode);

      if (mode) {
        // Local Mode Auth Check
        const guestUser = await getActiveUser();
        if (guestUser) {
          setUser(guestUser);
          const uProfile = await getProfile(guestUser.id);
          setProfile(uProfile);
        }
        setLoading(false);
      } else {
        // Supabase Auth Check
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const uProfile = await getProfile(session.user.id);
          setProfile(uProfile);
        }
        
        // Listen for changes
        const { data: { subscription } } = supabase!.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (currentSession?.user) {
              setUser(currentSession.user);
              const uProfile = await getProfile(currentSession.user.id);
              setProfile(uProfile);
            } else {
              setUser(null);
              setProfile(null);
            }
            setLoading(false);
          }
        );

        setLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      }
    };

    initAuth();
  }, []);

  const logInLocal = async (username: string, email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typemaster_is_logged_in', 'true');
      localStorage.setItem('typemaster_user_email', email);
      localStorage.setItem('typemaster_username', username);
      
      const mockUser = {
        id: 'guest-user-id',
        email,
        user_metadata: { username, avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + username }
      };
      
      setUser(mockUser);
      const uProfile = await getProfile(mockUser.id);
      // Synchronize with updated username
      if (uProfile.username !== username) {
        uProfile.username = username;
        uProfile.avatarUrl = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + username;
        localStorage.setItem('typemaster_profile', JSON.stringify(uProfile));
      }
      setProfile(uProfile);
      addToast('Welcome Back!', `Logged in as ${username}`, 'success');
    }
  };

  const signUpLocal = async (username: string, email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typemaster_is_logged_in', 'true');
      localStorage.setItem('typemaster_user_email', email);
      localStorage.setItem('typemaster_username', username);
      
      const defaultProfile: UserProfile = {
        id: 'guest-user-id',
        username,
        avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + username,
        level: 1,
        xp: 0,
        wpm: 0,
        accuracy: 0,
        practiceTime: 0,
        streak: 1,
        lastActive: new Date().toISOString()
      };
      
      localStorage.setItem('typemaster_profile', JSON.stringify(defaultProfile));
      
      const mockUser = {
        id: 'guest-user-id',
        email,
        user_metadata: { username, avatar_url: defaultProfile.avatarUrl }
      };
      
      setUser(mockUser);
      setProfile(defaultProfile);
      addToast('Account Created!', `Welcome to TypeMaster Pro, ${username}!`, 'success');
    }
  };

  const logOut = async () => {
    if (localMode) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('typemaster_is_logged_in');
        localStorage.removeItem('typemaster_user_email');
        localStorage.removeItem('typemaster_username');
      }
      setUser(null);
      setProfile(null);
      addToast('Logged Out', 'Successfully logged out.', 'info');
    } else {
      const { error } = await supabase!.auth.signOut();
      if (error) {
        addToast('Error logging out', error.message, 'error');
      } else {
        setUser(null);
        setProfile(null);
        addToast('Logged Out', 'Successfully logged out.', 'info');
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        loading,
        localMode,
        toasts,
        caretBlinking,
        setCaretBlinking,
        cursorStyle,
        setCursorStyle,
        addToast,
        removeToast,
        logInLocal,
        signUpLocal,
        logOut,
        refreshProfile
      }}
    >
      {children}
      
      {/* Dynamic Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`cursor-pointer p-4 rounded-xl border glass-panel transition-all shadow-lg flex flex-col translate-y-0 opacity-100 hover:scale-[1.02] active:scale-[0.98] ${
              toast.type === 'success' ? 'border-cyber-green/50 bg-cyber-green/5' :
              toast.type === 'error' ? 'border-cyber-red/50 bg-cyber-red/5' :
              toast.type === 'achievement' ? 'border-cyber-amber/60 bg-cyber-amber/10 border-2 animate-bounce' :
              'border-cyber-blue/50 bg-cyber-blue/5'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'achievement' && <span className="text-xl">🏆</span>}
              <h4 className={`font-semibold ${
                toast.type === 'success' ? 'text-cyber-green' :
                toast.type === 'error' ? 'text-cyber-red' :
                toast.type === 'achievement' ? 'text-cyber-amber font-extrabold text-glow-purple' :
                'text-cyber-blue'
              }`}>
                {toast.title}
              </h4>
            </div>
            <p className="text-sm text-slate-300 mt-1">{toast.description}</p>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
