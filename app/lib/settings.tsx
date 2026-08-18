import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';
import { Profile, WeekStartDay, UserMode, ThemePreference, NotificationPreferences } from './types';

interface SettingsContextType {
  profile: Profile | null;
  weekStartsOn: WeekStartDay;
  mode: UserMode;
  loading: boolean;
  updateWeekStartsOn: (value: WeekStartDay) => Promise<void>;
  updateMode: (value: UserMode) => Promise<void>;
  updateProfile: (fields: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'timezone' | 'daily_goal'>>) => Promise<void>;
  updateThemePreference: (value: ThemePreference) => Promise<void>;
  updateNotificationPreferences: (value: Partial<NotificationPreferences>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!session?.user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session?.user?.id]);

  const updateWeekStartsOn = async (value: WeekStartDay) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ week_starts_on: value })
        .eq('id', session.user.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, week_starts_on: value } : null);
    } catch (error) {
      console.error('Error updating week_starts_on:', error);
      throw error;
    }
  };

  const updateMode = async (value: UserMode) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ mode: value })
        .eq('id', session.user.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, mode: value } : null);
    } catch (error) {
      console.error('Error updating mode:', error);
      throw error;
    }
  };

  const updateProfile = async (fields: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'timezone' | 'daily_goal'>>) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', session.user.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, ...fields } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateThemePreference = async (value: ThemePreference) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme_preference: value })
        .eq('id', session.user.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, theme_preference: value } : null);
    } catch (error) {
      console.error('Error updating theme preference:', error);
      throw error;
    }
  };

  const updateNotificationPreferences = async (value: Partial<NotificationPreferences>) => {
    if (!session?.user?.id || !profile) return;

    const merged = {
      ...profile.notification_preferences,
      ...value,
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: merged })
        .eq('id', session.user.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, notification_preferences: merged } : null);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    await fetchProfile();
  };

  const value: SettingsContextType = {
    profile,
    weekStartsOn: profile?.week_starts_on || 'sunday',
    mode: profile?.mode || 'personal',
    loading,
    updateWeekStartsOn,
    updateMode,
    updateProfile,
    updateThemePreference,
    updateNotificationPreferences,
    refreshProfile,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
