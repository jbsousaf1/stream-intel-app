// src/services/friendsService.ts
import { api } from './api';
import type { ProfileStats } from './profileService';

export interface FriendUser {
  id: number;
  username: string;
  display_name: string;
  profile_pic: string;
}

export interface UserSearchResult extends FriendUser {
  friendship_status: 'friends' | 'request_sent' | 'request_received' | null;
}

export interface FriendRequest extends FriendUser {
  created_at: string;
}

export interface Notification {
  id: number;
  type: 'friend_request' | 'friend_accepted' | 'shared_action' | 'title_message';
  actor_id: number;
  actor_name: string;
  actor_username: string;
  actor_pic: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread: number;
  has_more: boolean;
  offset: number;
}

export interface FriendProfile extends FriendUser {
  library_public: boolean;
  stats: ProfileStats | null;
}

export interface FriendLibraryEntry {
  platform: string;
  title: string;
  is_fav: boolean;
  status: string;
  content_type: string;
  release_year: string;
  imdb_score: number;
  tomatometer: number;
  updated_at: string;
}

export interface ShareAction {
  type: 'shared_action' | 'title_message';
  title?: string;
  platform?: string;
  status?: string;
  is_fav?: boolean;
  message?: string;
}

// ── Friends list ──────────────────────────────────────────────────────────────

export async function getFriends(): Promise<FriendUser[]> {
  const data = await api<{ friends: FriendUser[] }>('/api/friends');
  return data.friends || [];
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchUsers(q: string): Promise<UserSearchResult[]> {
  if (q.length < 2) return [];
  const data = await api<{ users: UserSearchResult[] }>('/api/friends/search', {
    params: { q },
  });
  return data.users || [];
}

// ── Friend requests ───────────────────────────────────────────────────────────

export async function sendFriendRequest(userId: number): Promise<{ ok: boolean; status: string }> {
  return api('/api/friends/request', { method: 'POST', body: { user_id: userId } });
}

export async function acceptFriendRequest(userId: number): Promise<void> {
  await api('/api/friends/accept', { method: 'POST', body: { user_id: userId } });
}

export async function rejectFriendRequest(userId: number): Promise<void> {
  await api('/api/friends/reject', { method: 'POST', body: { user_id: userId } });
}

export async function removeFriend(userId: number): Promise<void> {
  await api('/api/friends/remove', { method: 'POST', body: { user_id: userId } });
}

export async function getPendingRequests(): Promise<FriendRequest[]> {
  const data = await api<{ requests: FriendRequest[] }>('/api/friends/requests');
  return data.requests || [];
}

export async function getSentRequests(): Promise<FriendRequest[]> {
  const data = await api<{ requests: FriendRequest[] }>('/api/friends/requests/sent');
  return data.requests || [];
}

export async function cancelFriendRequest(userId: number): Promise<void> {
  await api(`/api/friends/request/${userId}`, { method: 'DELETE' });
}

// ── Share ─────────────────────────────────────────────────────────────────────

export async function shareAction(
  friendIds: number[],
  action: ShareAction,
): Promise<{ ok: boolean; sent: number }> {
  return api('/api/friends/share', {
    method: 'POST',
    body: { friend_ids: friendIds, action },
  });
}

// ── Friend profiles ───────────────────────────────────────────────────────────

export async function getFriendProfile(userId: number): Promise<FriendProfile> {
  return api<FriendProfile>(`/api/friends/${userId}/profile`);
}

export async function getFriendWatched(userId: number): Promise<{ platform: string; title: string; content_type: string; release_year: string }[]> {
  const data = await api<{ titles: { platform: string; title: string; content_type: string; release_year: string }[] }>(`/api/friends/${userId}/watched`);
  return data.titles || [];
}

export async function getFriendLibrary(userId: number): Promise<FriendLibraryEntry[]> {
  const data = await api<{ library: FriendLibraryEntry[] }>(`/api/friends/${userId}/library`);
  return data.library || [];
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function getNotifications(offset = 0): Promise<NotificationsResponse> {
  return api<NotificationsResponse>('/api/notifications', {
    params: { offset },
  });
}

export async function markNotificationsRead(id?: number): Promise<void> {
  await api('/api/notifications/read', {
    method: 'POST',
    body: id ? { id } : {},
  });
}

// ── Actors (TMDB via proxy) ───────────────────────────────────────────────────

export interface Actor {
  id: number;
  name: string;
  known_for_department: string;
  profile_path: string | null;
  known_for: { title?: string; name?: string }[];
}

export interface ActorsResponse {
  results: Actor[];
  total_pages: number;
}

export async function getTrendingActors(page = 1): Promise<ActorsResponse> {
  return api<ActorsResponse>('/api/people/trending', { params: { page } });
}

export async function getPopularActors(page = 1): Promise<ActorsResponse> {
  return api<ActorsResponse>('/api/people/popular', { params: { page } });
}

export async function searchActors(q: string, page = 1): Promise<ActorsResponse> {
  return api<ActorsResponse>('/api/people/search', { params: { q, page } });
}

export interface ActorDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string | null;
  known_for_department: string;
  credits: {
    id: number;
    title?: string;
    name?: string;
    media_type: string;
    character?: string;
    job?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string;
    vote_average?: number;
  }[];
}

export async function getActorDetail(personId: number): Promise<ActorDetail> {
  return api<ActorDetail>(`/api/people/${personId}`);
}
