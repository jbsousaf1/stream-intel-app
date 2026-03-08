# StreamIntel – React Native Android App

A full React Native port of the StreamIntel web PWA, targeting Android.
The existing Python/Flask backend on Railway is **unchanged** — this app is purely a client.

## Prerequisites

| Tool | Version |
|------|---------|
| Node | ≥ 18 |
| JDK | 17 |
| Android Studio | Hedgehog or later |
| React Native CLI | 0.75.x |

## Quick Start

```bash
# 1. Install dependencies
yarn install   # or: npm install

# 2. Add placeholder images (see src/assets/README.md)
#    Copy three PNG files into src/assets/:
#      placeholder_poster.png   (185×278 px)
#      placeholder_actor.png    (185×278 px)
#      placeholder_avatar.png   (200×200 px)

# 3. Run Metro bundler
yarn start

# 4. Build & deploy to connected device / emulator
yarn android
```

## Project Structure

```
StreamIntelApp/
├── App.tsx                         # Root component
├── index.js                        # AppRegistry entry
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── app.json
├── android/
│   └── app/src/main/
│       └── AndroidManifest.xml
└── src/
    ├── assets/                     # Placeholder images (add before building)
    ├── constants/
    │   ├── api.ts                  # BASE_URL, TMDB image paths
    │   └── theme.ts                # Colors, spacing, typography
    ├── services/                   # Pure API wrappers (no UI)
    │   ├── api.ts                  # fetch wrapper, token helpers
    │   ├── authService.ts
    │   ├── titlesService.ts
    │   ├── libraryService.ts
    │   ├── profileService.ts
    │   └── friendsService.ts       # Friends + notifications + actors
    ├── store/                      # Zustand global state
    │   ├── authStore.ts
    │   ├── libraryStore.ts
    │   └── titlesStore.ts
    ├── hooks/                      # Custom React hooks
    │   ├── useAuth.ts
    │   ├── useTitles.ts
    │   ├── useLibrary.ts
    │   ├── useFriends.ts
    │   ├── useNotifications.ts
    │   └── useProfile.ts
    ├── navigation/
    │   ├── types.ts                # All ParamList types
    │   ├── RootNavigator.tsx       # Auth check → AuthStack | AppTabs
    │   └── AppTabNavigator.tsx     # Bottom tabs + sub-stacks
    ├── components/
    │   ├── TitleCard.tsx
    │   ├── PlatformBadge.tsx
    │   ├── ScoreBlock.tsx
    │   └── FilterSheet.tsx         # @gorhom/bottom-sheet filter panel
    └── screens/
        ├── LoginScreen.tsx
        ├── RegisterScreen.tsx
        ├── HomeScreen.tsx
        ├── TitleDetailScreen.tsx
        ├── LibraryScreen.tsx
        ├── FriendsScreen.tsx
        ├── SearchUsersScreen.tsx
        ├── NotificationsScreen.tsx
        ├── FriendProfileScreen.tsx
        ├── FriendLibraryScreen.tsx
        ├── ProfileScreen.tsx
        ├── EditProfileScreen.tsx
        ├── UpcomingScreen.tsx
        ├── PeopleScreen.tsx
        └── ActorDetailScreen.tsx
```

## Backend

All data lives at `https://stream-intel.up.railway.app` (Railway).  
No local database — every read/write goes through the existing REST API.

Auth token stored in `AsyncStorage` as `si_token`; sent as `Authorization: Bearer <token>` on every request.

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@react-navigation/native-stack` | Screen navigation |
| `@react-navigation/bottom-tabs` | Bottom tab bar |
| `zustand` | Global state management |
| `react-native-fast-image` | Cached poster / actor images |
| `@gorhom/bottom-sheet` | Filter sheet |
| `react-native-reanimated` | Animation (required by bottom-sheet) |
| `react-native-gesture-handler` | Gesture support |
| `@react-native-async-storage/async-storage` | Token persistence |
| `react-native-vector-icons` | MaterialIcons |

## Notes

- **Push notifications**: The web app uses Web Push (VAPID). Native push requires FCM — a small backend addition (add an endpoint to store the FCM token) and adding `@react-native-firebase/messaging`. This is a follow-up step.
- **Google OAuth**: The `googleLoginInit` endpoint redirects to a web page. For native you'd integrate `@react-native-google-signin/google-signin` and swap the flow. Not implemented here.
- All three placeholder PNG assets **must** be added to `src/assets/` before the Metro bundler will start successfully (static `require()` calls).
