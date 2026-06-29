'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getActiveUser, 
  getProfile, 
  UserProfile, 
  isLocalMode,
  getUserGlobalRank,
  syncLocalSessionsToSupabase
} from '@/lib/services/db';
import { supabase, isSupabaseConfigured } from '@/lib/services/supabaseClient';
import { playKeystrokeSound } from '@/lib/services/soundSynth';
import { Theme, PRESET_THEMES, hexToRgb } from '@/lib/services/themeColors';
import { APP_NAME } from '@/lib/config';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'error' | 'achievement';
}

interface AppContextType {
  user: any | null;
  profile: UserProfile | null;
  globalRank: number;
  loading: boolean;
  localMode: boolean;
  toasts: ToastMessage[];
  caretBlinking: boolean;
  setCaretBlinking: (val: boolean) => void;
  cursorStyle: 'cyber' | 'simple';
  setCursorStyle: (val: 'cyber' | 'simple') => void;
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  isResettingPassword: boolean;
  setIsResettingPassword: (val: boolean) => void;
  themeMode: 'dark' | 'light';
  setThemeMode: (val: 'dark' | 'light') => void;
  accentColor: string;
  setAccentColor: (val: string) => void;
  fontFamily: string;
  setFontFamily: (val: string) => void;
  soundName: string;
  setSoundName: (val: string) => void;
  soundVolume: number;
  setSoundVolume: (val: number) => void;
  playClickSound: (key: string) => void;
  addToast: (title: string, description: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  logInLocal: (username: string, email: string) => Promise<void>;
  signUpLocal: (username: string, email: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  currentTheme: Theme;
  setCurrentTheme: React.Dispatch<React.SetStateAction<Theme>>;
  customThemes: Theme[];
  setCustomThemes: React.Dispatch<React.SetStateAction<Theme[]>>;
}

const getSecureFlag = () => {
  if (typeof window === 'undefined') return '';
  return window.location.protocol === 'https:' ? '; Secure' : '';
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const secureFlag = getSecureFlag();
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [globalRank, setGlobalRank] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [localMode, setLocalMode] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);

  // Fetch global rank when profile changes
  useEffect(() => {
    const loadRank = async () => {
      if (profile && profile.id) {
        try {
          const rank = await getUserGlobalRank(profile.id, profile.wpm);
          setGlobalRank(rank);
        } catch (err) {
          console.error('Failed to load global rank:', err);
        }
      } else {
        setGlobalRank(0);
      }
    };
    loadRank();
  }, [profile, profile?.wpm]);

  // Monkeytype Theme Engine States
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('typemaster_custom_themes');
        return stored ? JSON.parse(stored) : [];
      } catch (err) {
        console.error('Error parsing custom themes:', err);
      }
    }
    return [];
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const presets = PRESET_THEMES;
    if (typeof window !== 'undefined') {
      try {
        const activeThemeId = localStorage.getItem('typemaster_active_theme_id') || 'classic-dark';
        const storedCustom = localStorage.getItem('typemaster_custom_themes');
        const parsedCustom: Theme[] = storedCustom ? JSON.parse(storedCustom) : [];
        const found = [...presets, ...parsedCustom].find(t => t.id === activeThemeId);
        return found || presets[0];
      } catch (err) {
        console.error('Error parsing active theme:', err);
      }
    }
    return presets[0];
  });

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

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('typemaster_theme_mode');
      return stored === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  });
  
  const [accentColor, setAccentColor] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('typemaster_accent_color') || '#00f2fe';
    }
    return '#00f2fe';
  });
  
  const [fontFamily, setFontFamily] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('typemaster_font_family') || 'Outfit';
    }
    return 'Outfit';
  });

  const [soundName, setSoundName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('typemaster_sound_name') || 'off';
    }
    return 'off';
  });

  const [soundVolume, setSoundVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('typemaster_sound_volume');
      return stored !== null ? Number(stored) : 0.5;
    }
    return 0.5;
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

  // Sync body and html overflow styles to prevent scrolling in Zen Mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isZenMode) {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100vh';
      } else {
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
      }
    }
  }, [isZenMode]);

  // Apply active theme colors to DOM CSS variables
  useEffect(() => {
    if (typeof window !== 'undefined' && currentTheme) {
      const root = document.documentElement;
      root.style.setProperty('--bg', currentTheme.bg);
      root.style.setProperty('--surface', currentTheme.surface);
      root.style.setProperty('--surface-2', currentTheme.surface2);
      root.style.setProperty('--text', currentTheme.text);
      root.style.setProperty('--text-muted', currentTheme.textMuted);
      root.style.setProperty('--accent', currentTheme.accent);
      const rgb = hexToRgb(currentTheme.accent);
      root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      root.style.setProperty('--error', currentTheme.error);
      root.style.setProperty('--success', currentTheme.success);
      root.style.setProperty('--caret', currentTheme.caret);
      root.style.setProperty('--border', currentTheme.border);
      root.style.setProperty('--selection', currentTheme.selection);
      
      // Keep accentColor synchronized for components relying on legacy settings
      setAccentColor(currentTheme.accent);
      
      localStorage.setItem('typemaster_active_theme_id', currentTheme.id);
    }
  }, [currentTheme]);

  // Keep favicon updated dynamically matching current theme, watching for Next.js metadata resets
  useEffect(() => {
    if (typeof window === 'undefined' || !currentTheme) return;

    const updateFavicon = () => {
      try {
        const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="7" fill="${currentTheme.bg}" /><path d="M5 8h22a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zm2 4v2h2v-2H7zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-16 5v2h2v-2H7zm4 0v2h10v-2H11zm12 0v2h2v-2h-2z" fill="${currentTheme.accent}" /></svg>`;
        const faviconDataUrl = `data:image/svg+xml;base64,${btoa(faviconSvg)}`;
        
        const existingLinks = document.querySelectorAll("link[rel~='icon']");
        if (existingLinks.length > 0) {
          existingLinks.forEach(link => {
            const linkElem = link as HTMLLinkElement;
            if (linkElem.href !== faviconDataUrl) {
              linkElem.href = faviconDataUrl;
              linkElem.type = 'image/svg+xml';
            }
          });
        } else {
          const faviconLink = document.createElement('link');
          faviconLink.rel = 'icon';
          faviconLink.type = 'image/svg+xml';
          faviconLink.href = faviconDataUrl;
          document.head.appendChild(faviconLink);
        }
      } catch (err) {
        console.error('Failed to update favicon dynamically:', err);
      }
    };

    // Run once on load/theme change
    updateFavicon();

    // Watch head element for changes to link tags
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName.toLowerCase() === 'link' && (node as HTMLLinkElement).rel.includes('icon')) {
              shouldUpdate = true;
            }
          });
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
          const target = mutation.target as HTMLLinkElement;
          if (target.nodeName.toLowerCase() === 'link' && target.rel.includes('icon')) {
            shouldUpdate = true;
          }
        }
      }
      if (shouldUpdate) {
        observer.disconnect();
        updateFavicon();
        observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'rel'] });
      }
    });

    observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'rel'] });

    return () => {
      observer.disconnect();
    };
  }, [currentTheme]);

  // Sync custom themes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typemaster_custom_themes', JSON.stringify(customThemes));
    }
  }, [customThemes]);

  // Synchronize dynamic styles: themeMode, accentColor, fontFamily, sound settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typemaster_theme_mode', themeMode);
      localStorage.setItem('typemaster_accent_color', accentColor);
      localStorage.setItem('typemaster_font_family', fontFamily);
      localStorage.setItem('typemaster_sound_name', soundName);
      localStorage.setItem('typemaster_sound_volume', String(soundVolume));

      if (themeMode === 'light') {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
      } else {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
      }

      document.documentElement.style.setProperty('--accent-color', accentColor);
      document.documentElement.style.setProperty('--font-current', `'${fontFamily}', sans-serif`);

      // Dynamically load font from Google Fonts if it's not a preloaded system/app font
      if (fontFamily !== 'Outfit' && fontFamily !== 'JetBrains Mono') {
        const linkId = `gfont-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
        if (!document.getElementById(linkId)) {
          const fontLink = document.createElement('link');
          fontLink.id = linkId;
          fontLink.rel = 'stylesheet';
          fontLink.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap`;
          document.head.appendChild(fontLink);
        }
      }
      
      const isMono = [
        'Fira Code', 'JetBrains Mono', 'Inconsolata', 'Source Code Pro', 
        'Ubuntu Mono', 'Courier Prime', 'Anonymous Pro', 'IBM Plex Mono', 
        'Space Mono', 'DM Mono', 'Major Mono Display', 'Share Tech Mono',
        'Cutive Mono', 'Nova Mono', 'Overpass Mono'
      ].includes(fontFamily);
      
      if (isMono) {
        document.documentElement.style.setProperty('--font-current-mono', `'${fontFamily}', monospace`);
      } else {
        document.documentElement.style.setProperty('--font-current-mono', `'Fira Code', 'JetBrains Mono', monospace`);
      }
    }
  }, [themeMode, accentColor, fontFamily, soundName, soundVolume]);

  const playClickSound = (key: string) => {
    if (!key) return;
    playKeystrokeSound(soundName, key, soundVolume);
  };

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
    let unsubscribeFn: (() => void) | undefined;
    const mode = isLocalMode();
    setLocalMode(mode);

    // Failsafe backup: Check if URL hash indicates we are returning from a password recovery link
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setIsResettingPassword(true);
    }

    if (mode) {
      // Local mode auth initialization
      const initLocalAuth = async () => {
        try {
          const currentUser = await getActiveUser();
          if (currentUser) {
            setUser(currentUser);
            const uProfile = await getProfile(currentUser.id);
            
            // Sync role based on user email
            const email = localStorage.getItem('typemaster_user_email') || 'guest@typemaster.pro';
            const role = email.toLowerCase() === 'kumarajeet19022004@gmail.com' ? 'admin' : 'user';
            uProfile.email = email;
            uProfile.role = role;
            localStorage.setItem('typemaster_profile', JSON.stringify(uProfile));
            setProfile(uProfile);

            if (typeof window !== 'undefined') {
              document.cookie = `local-user-role=${role}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
              document.cookie = `sb-access-token=local-mock-token; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
            }
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('Error initializing local auth:', err);
        } finally {
          setLoading(false);
        }
      };
      initLocalAuth();
    } else {
      // Online mode: register auth state change listener immediately (synchronously)
      // to avoid missing early hash events (like PASSWORD_RECOVERY) during async operations
      const { data: { subscription } } = supabase!.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (event === 'PASSWORD_RECOVERY') {
            setIsResettingPassword(true);
          }
          if (currentSession?.user) {
            setUser(currentSession.user);
            try {
              await syncLocalSessionsToSupabase(currentSession.user.id);
            } catch (syncErr) {
              console.error('Failed to sync local sessions on login:', syncErr);
            }
            const uProfile = await getProfile(currentSession.user.id);
            
            // Sync/heal role in context/cookie if logged in as admin email
            if (currentSession.user.email && currentSession.user.email.toLowerCase() === 'kumarajeet19022004@gmail.com') {
              uProfile.role = 'admin';
            }
            setProfile(uProfile);

            if (typeof window !== 'undefined' && currentSession.access_token) {
              const maxAge = currentSession.expires_in || 3600;
              document.cookie = `sb-access-token=${currentSession.access_token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
              document.cookie = `local-user-role=${uProfile.role}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
            }
          } else {
            setUser(null);
            setProfile(null);
            if (typeof window !== 'undefined') {
              document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
              document.cookie = `local-user-role=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
            }
          }
          setLoading(false);
        }
      );
      unsubscribeFn = () => subscription.unsubscribe();
    }

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  const logInLocal = async (username: string, email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typemaster_is_logged_in', 'true');
      localStorage.setItem('typemaster_user_email', email);
      localStorage.setItem('typemaster_username', username);
      
      const role = email.toLowerCase() === 'kumarajeet19022004@gmail.com' ? 'admin' : 'user';
      document.cookie = `local-user-role=${role}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
      document.cookie = `sb-access-token=local-mock-token; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;

      const mockUser = {
        id: 'guest-user-id',
        email,
        user_metadata: { username, avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + username }
      };
      
      setUser(mockUser);
      const uProfile = await getProfile(mockUser.id);
      uProfile.username = username;
      uProfile.avatarUrl = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + username;
      uProfile.email = email;
      uProfile.role = role;
      localStorage.setItem('typemaster_profile', JSON.stringify(uProfile));
      setProfile(uProfile);
      addToast('Welcome Back!', `Logged in as ${username}`, 'success');
    }
  };

  const signUpLocal = async (username: string, email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typemaster_is_logged_in', 'true');
      localStorage.setItem('typemaster_user_email', email);
      localStorage.setItem('typemaster_username', username);

      const role = email.toLowerCase() === 'kumarajeet19022004@gmail.com' ? 'admin' : 'user';
      document.cookie = `local-user-role=${role}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
      document.cookie = `sb-access-token=local-mock-token; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
      
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
        lastActive: new Date().toISOString(),
        email,
        role
      };
      
      localStorage.setItem('typemaster_profile', JSON.stringify(defaultProfile));
      
      const mockUser = {
        id: 'guest-user-id',
        email,
        user_metadata: { username, avatar_url: defaultProfile.avatarUrl }
      };
      
      setUser(mockUser);
      setProfile(defaultProfile);
      addToast('Account Created!', `Welcome to ${APP_NAME}, ${username}!`, 'success');
    }
  };

  const logOut = async () => {
    if (typeof window !== 'undefined') {
      document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      document.cookie = `local-user-role=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
    }

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
        globalRank,
        loading,
        localMode,
        toasts,
        caretBlinking,
        setCaretBlinking,
        cursorStyle,
        setCursorStyle,
        isZenMode,
        setIsZenMode,
        isResettingPassword,
        setIsResettingPassword,
        themeMode,
        setThemeMode,
        accentColor,
        setAccentColor,
        fontFamily,
        setFontFamily,
        soundName,
        setSoundName,
        soundVolume,
        setSoundVolume,
        playClickSound,
        addToast,
        removeToast,
        logInLocal,
        signUpLocal,
        logOut,
        refreshProfile,
        currentTheme,
        setCurrentTheme,
        customThemes,
        setCustomThemes
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
