// src/hooks/useNotifications.ts
import { useState, useCallback } from 'react';
import { getNotifications, markNotificationsRead } from '../services/friendsService';
import type { Notification } from '../services/friendsService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (reset = true) => {
    setIsLoading(true);
    const nextOffset = reset ? 0 : offset;
    try {
      const res = await getNotifications(nextOffset);
      if (reset) {
        setNotifications(res.notifications);
      } else {
        setNotifications((prev) => [...prev, ...res.notifications]);
      }
      setUnreadCount(res.unread);
      setHasMore(res.has_more);
      setOffset(nextOffset + res.notifications.length);
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  const loadMore = useCallback(() => load(false), [load]);

  const markRead = useCallback(async (id?: number) => {
    await markNotificationsRead(id);
    if (id != null) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    load,
    loadMore,
    markRead,
  };
}
