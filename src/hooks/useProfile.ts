// src/hooks/useProfile.ts
import { useState, useCallback } from 'react';
import {
  getProfile,
  updateProfile,
  getWatchtimeTitles,
} from '../services/profileService';
import type { Profile, UpdateProfileParams, WatchtimeTitle } from '../services/profileService';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [watchtimeTitles, setWatchtimeTitles] = useState<WatchtimeTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [p, w] = await Promise.all([getProfile(), getWatchtimeTitles()]);
      setProfile(p);
      setWatchtimeTitles(w);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (params: UpdateProfileParams) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateProfile(params);
      setProfile(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update profile');
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    profile,
    watchtimeTitles,
    isLoading,
    isSaving,
    error,
    load,
    save,
  };
}
