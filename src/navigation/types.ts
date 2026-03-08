// src/navigation/types.ts
// Centralised route param types for the whole app.

// ── Auth stack ────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ── Bottom-tab navigator inside the app ──────────────────────────────────────
export type AppTabParamList = {
  HomeStack: undefined;
  LibraryStack: undefined;
  FriendsStack: undefined;
  ProfileStack: undefined;
};

// ── Home stack ────────────────────────────────────────────────────────────────
export type HomeStackParamList = {
  Home: undefined;
  TitleDetail: {
    platform: string;
    title: string;
    contentType: 'movie' | 'show';
  };
  ActorDetail: { personId: number; name: string };
  People: undefined;
};

// ── Library stack ─────────────────────────────────────────────────────────────
export type LibraryStackParamList = {
  Library: undefined;
  TitleDetail: {
    platform: string;
    title: string;
    contentType: 'movie' | 'show';
  };
};

// ── Friends stack ─────────────────────────────────────────────────────────────
export type FriendsStackParamList = {
  Friends: undefined;
  Notifications: undefined;
  FriendProfile: { userId: number; displayName: string };
  FriendLibrary: { userId: number; displayName: string };
  SearchUsers: undefined;
};

// ── Profile stack ─────────────────────────────────────────────────────────────
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Upcoming: undefined;
};
