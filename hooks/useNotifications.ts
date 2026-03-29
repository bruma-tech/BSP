import { useState, useEffect, useCallback, useRef } from 'react';

export interface Notification {
  id: string;
  type: 'new_requirement' | 'deadline_approaching' | 'review_decision' | 'feedback_received';
  title: string;
  message: string;
  actionRequired: boolean;
  read: boolean;
  createdAt: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clear: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
        setUnreadCount(json.unreadCount);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  const prependNotification = useCallback((n: Notification) => {
    setNotifications((prev) => {
      if (prev.some((x) => x.id === n.id)) return prev;
      return [n, ...prev];
    });
    setUnreadCount((c) => c + 1);
  }, []);

  const connectSSE = useCallback(() => {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }

    const es = new EventSource('/api/notifications/stream', { withCredentials: true });
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as { type: string; payload?: Notification };
        if (msg.type === 'connected') setLoading(false);
        if (msg.type === 'notification' && msg.payload) prependNotification(msg.payload);
      } catch { /* ignore */ }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      reconnectTimer.current = setTimeout(() => connectSSE(), 5_000);
    };
  }, [prependNotification]);

  useEffect(() => {
    fetchNotifications();
    connectSSE();
    return () => {
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [fetchNotifications, connectSSE]);

  const patch = useCallback(async (body: object) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  }, []);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
    await patch({ action: 'mark_read', id });
  }, [patch]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await patch({ action: 'mark_all_read' });
  }, [patch]);

  const clear = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.read) setUnreadCount((c) => Math.max(0, c - 1));
    await patch({ action: 'clear', id });
  }, [notifications, patch]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    await patch({ action: 'clear_all' });
  }, [patch]);

  return { notifications, unreadCount, loading, markRead, markAllRead, clear, clearAll, refetch: fetchNotifications };
}