// src/navigation/AppTabNavigator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../constants/theme';
import { useNotifications } from '../hooks/useNotifications';

// Screens (imported lazily to keep this file thin)
import HomeScreen from '../screens/HomeScreen';
import TitleDetailScreen from '../screens/TitleDetailScreen';
import ActorDetailScreen from '../screens/ActorDetailScreen';
import PeopleScreen from '../screens/PeopleScreen';

import LibraryScreen from '../screens/LibraryScreen';

import FriendsScreen from '../screens/FriendsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import FriendProfileScreen from '../screens/FriendProfileScreen';
import FriendLibraryScreen from '../screens/FriendLibraryScreen';
import SearchUsersScreen from '../screens/SearchUsersScreen';

import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UpcomingScreen from '../screens/UpcomingScreen';

import type {
  AppTabParamList,
  HomeStackParamList,
  LibraryStackParamList,
  FriendsStackParamList,
  ProfileStackParamList,
} from './types';

// ── Sub-stacks ────────────────────────────────────────────────────────────────
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'StreamIntel' }} />
      <HomeStack.Screen name="TitleDetail" component={TitleDetailScreen} options={{ title: '' }} />
      <HomeStack.Screen name="ActorDetail" component={ActorDetailScreen} options={{ title: '' }} />
      <HomeStack.Screen name="People" component={PeopleScreen} options={{ title: 'People' }} />
    </HomeStack.Navigator>
  );
}

const LibStack = createNativeStackNavigator<LibraryStackParamList>();
function LibraryStackScreen() {
  return (
    <LibStack.Navigator screenOptions={stackOptions}>
      <LibStack.Screen name="Library" component={LibraryScreen} options={{ title: 'My Library' }} />
      <LibStack.Screen name="TitleDetail" component={TitleDetailScreen} options={{ title: '' }} />
    </LibStack.Navigator>
  );
}

const FriendsStackNav = createNativeStackNavigator<FriendsStackParamList>();
function FriendsStackScreen() {
  return (
    <FriendsStackNav.Navigator screenOptions={stackOptions}>
      <FriendsStackNav.Screen name="Friends" component={FriendsScreen} options={{ title: 'Friends' }} />
      <FriendsStackNav.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <FriendsStackNav.Screen name="FriendProfile" component={FriendProfileScreen} options={{ title: '' }} />
      <FriendsStackNav.Screen name="FriendLibrary" component={FriendLibraryScreen} options={{ title: '' }} />
      <FriendsStackNav.Screen name="SearchUsers" component={SearchUsersScreen} options={{ title: 'Find People' }} />
    </FriendsStackNav.Navigator>
  );
}

const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackScreen() {
  return (
    <ProfileStackNav.Navigator screenOptions={stackOptions}>
      <ProfileStackNav.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStackNav.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <ProfileStackNav.Screen name="Upcoming" component={UpcomingScreen} options={{ title: 'Upcoming' }} />
    </ProfileStackNav.Navigator>
  );
}

// ── Bottom tab navigator ──────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppTabNavigator() {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            HomeStack: 'home',
            LibraryStack: 'video-library',
            FriendsStack: 'people',
            ProfileStack: 'person',
          };
          return <MaterialIcons name={icons[route.name] ?? 'circle'} size={size} color={color} />;
        },
        tabBarLabel: ({ color }) => {
          const labels: Record<string, string> = {
            HomeStack: 'Home',
            LibraryStack: 'Library',
            FriendsStack: 'Friends',
            ProfileStack: 'Profile',
          };
          return <Text style={{ color, fontSize: 10 }}>{labels[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeStackScreen} />
      <Tab.Screen name="LibraryStack" component={LibraryStackScreen} />
      <Tab.Screen
        name="FriendsStack"
        component={FriendsStackScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent2 },
        }}
      />
      <Tab.Screen name="ProfileStack" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

// ── Shared stack screen options ───────────────────────────────────────────────
const stackOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerTitleStyle: { color: colors.text, fontWeight: '600' as const },
  contentStyle: { backgroundColor: colors.bg },
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
