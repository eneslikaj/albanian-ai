import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SubscriptionTier, TIER_LIMITS } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  register: (email: string, password: string, name: string) => void;
  logout: () => void;
  incrementUsage: () => void;
  upgradeTier: (tier: SubscriptionTier) => void;
  canGenerate: boolean;
  remainingGenerations: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'albanian_ai_user_data';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsedUser = JSON.parse(stored);
      // Reset daily usage if it's a new day
      const today = new Date().toISOString().split('T')[0];
      if (parsedUser.lastUsageDate !== today) {
        parsedUser.dailyUsage = 0;
        parsedUser.lastUsageDate = today;
      }
      // Ensure timestamps exist for legacy data
      if (!parsedUser.createdAt) parsedUser.createdAt = new Date().toISOString();
      if (!parsedUser.lastLoginAt) parsedUser.lastLoginAt = new Date().toISOString();

      // Save back potential updates
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedUser));
      setUser(parsedUser);
    }
  }, []);

  const login = (email: string, pass: string) => {
    // Mock login - in a real app, this hits an API
    // We try to find existing user or just create a mock session
    // For this demo, we just simulate a successful login with a dummy ID
    const now = new Date().toISOString();
    const mockUser: User = {
      id: email.split('@')[0] + '-id',
      email,
      name: email.split('@')[0],
      tier: SubscriptionTier.FREE,
      dailyUsage: 0,
      lastUsageDate: now.split('T')[0],
      createdAt: now,
      lastLoginAt: now
    };
    
    // Check if we have this user stored already to preserve tier
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY + '_' + email);
    const finalUser = stored ? JSON.parse(stored) : mockUser;
    
    // Ensure usage reset on login if needed
    const today = now.split('T')[0];
    if (finalUser.lastUsageDate !== today) {
        finalUser.dailyUsage = 0;
        finalUser.lastUsageDate = today;
    }

    // Update login time
    finalUser.lastLoginAt = now;
    // Backfill creation time if missing
    if (!finalUser.createdAt) finalUser.createdAt = now;

    setUser(finalUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalUser));
    // Update the persistent record
    localStorage.setItem(LOCAL_STORAGE_KEY + '_' + email, JSON.stringify(finalUser));
  };

  const register = (email: string, pass: string, name: string) => {
    const now = new Date().toISOString();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      tier: SubscriptionTier.FREE,
      dailyUsage: 0,
      lastUsageDate: now.split('T')[0],
      createdAt: now,
      lastLoginAt: now
    };
    setUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
    // Save persistent record for "login" simulation
    localStorage.setItem(LOCAL_STORAGE_KEY + '_' + email, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const incrementUsage = () => {
    if (!user) return;
    const updatedUser = { ...user, dailyUsage: user.dailyUsage + 1 };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
    localStorage.setItem(LOCAL_STORAGE_KEY + '_' + user.email, JSON.stringify(updatedUser));
  };

  const upgradeTier = (tier: SubscriptionTier) => {
    if (!user) return;
    const updatedUser = { ...user, tier };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
    localStorage.setItem(LOCAL_STORAGE_KEY + '_' + user.email, JSON.stringify(updatedUser));
  };

  const limit = user ? TIER_LIMITS[user.tier] : 0;
  const remainingGenerations = user ? Math.max(0, limit - user.dailyUsage) : 0;
  const canGenerate = remainingGenerations > 0;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      incrementUsage,
      upgradeTier,
      canGenerate,
      remainingGenerations
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};