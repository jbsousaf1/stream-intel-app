// src/hooks/useFriends.ts
import { useState, useCallback } from 'react';
import {
  getFriends,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getPendingRequests,
  cancelFriendRequest,
  shareAction,
} from '../services/friendsService';
import type { FriendUser, UserSearchResult, FriendRequest, ShareAction } from '../services/friendsService';

export function useFriends() {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pending, setPending] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [f, p] = await Promise.all([getFriends(), getPendingRequests()]);
      setFriends(f);
      setPending(p);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const results = await searchUsers(q);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const sendRequest = useCallback(async (userId: number) => {
    await sendFriendRequest(userId);
    setSearchResults((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, friendship_status: 'request_sent' as const } : u,
      ),
    );
  }, []);

  const accept = useCallback(async (userId: number) => {
    await acceptFriendRequest(userId);
    setPending((prev) => prev.filter((r) => r.id !== userId));
    await load();
  }, [load]);

  const reject = useCallback(async (userId: number) => {
    await rejectFriendRequest(userId);
    setPending((prev) => prev.filter((r) => r.id !== userId));
  }, []);

  const remove = useCallback(async (userId: number) => {
    await removeFriend(userId);
    setFriends((prev) => prev.filter((f) => f.id !== userId));
  }, []);

  const cancel = useCallback(async (userId: number) => {
    await cancelFriendRequest(userId);
    setSearchResults((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, friendship_status: null as unknown as undefined } : u,
      ),
    );
  }, []);

  const share = useCallback(async (friendIds: number[], action: ShareAction) => {
    return shareAction(friendIds, action);
  }, []);

  return {
    friends,
    pending,
    searchResults,
    isLoading,
    error,
    load,
    search,
    sendRequest,
    accept,
    reject,
    remove,
    cancel,
    share,
  };
}
