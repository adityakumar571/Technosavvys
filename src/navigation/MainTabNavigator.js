import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { COLORS } from '../constants/colors';

// Tab Screens
import HomeScreen from '../screens/home/HomeScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import LiveScreen from '../screens/live/LiveScreen';
import TestsScreen from '../screens/tests/TestsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Stack Screens
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import BatchDetailScreen from '../screens/batches/BatchDetailScreen';
import VideoPlayerScreen from '../screens/videos/VideoPlayerScreen';
import LiveClassScreen from '../screens/live/LiveClassScreen';
import TestScreen from '../screens/tests/TestScreen';
import TestResultScreen from '../screens/tests/TestResultScreen';
import LeaderboardScreen from '../screens/tests/LeaderboardScreen';
import NotesScreen from '../screens/notes/NotesScreen';
import NoteViewerScreen from '../screens/notes/NoteViewerScreen';
import DoubtsScreen from '../screens/doubts/DoubtsScreen';
import DoubtDetailScreen from '../screens/doubts/DoubtDetailScreen';
import CreateDoubtScreen from '../screens/doubts/CreateDoubtScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import SearchScreen from '../screens/search/SearchScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import WatchHistoryScreen from '../screens/profile/WatchHistoryScreen';
import BookmarksScreen from '../screens/profile/BookmarksScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import DashboardScreen from '../screens/home/DashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
    <Stack.Screen name="BatchDetail" component={BatchDetailScreen} />
    <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
    <Stack.Screen name="LiveClass" component={LiveClassScreen} />
    <Stack.Screen name="Notes" component={NotesScreen} />
    <Stack.Screen name="NoteViewer" component={NoteViewerScreen} />
    <Stack.Screen name="Doubts" component={DoubtsScreen} />
    <Stack.Screen name="DoubtDetail" component={DoubtDetailScreen} />
    <Stack.Screen name="CreateDoubt" component={CreateDoubtScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
  </Stack.Navigator>
);

const CoursesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CoursesMain" component={CoursesScreen} />
    <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
    <Stack.Screen name="BatchDetail" component={BatchDetailScreen} />
    <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
    <Stack.Screen name="Notes" component={NotesScreen} />
    <Stack.Screen name="NoteViewer" component={NoteViewerScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
  </Stack.Navigator>
);

const LiveStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LiveMain" component={LiveScreen} />
    <Stack.Screen name="LiveClass" component={LiveClassScreen} />
  </Stack.Navigator>
);

const TestsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TestsMain" component={TestsScreen} />
    <Stack.Screen name="Test" component={TestScreen} />
    <Stack.Screen name="TestResult" component={TestResultScreen} />
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="WatchHistory" component={WatchHistoryScreen} />
    <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="PaymentHistory" component={PaymentScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => {
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Courses: focused ? 'book-open' : 'book-open-outline',
            Live: focused ? 'video' : 'video-outline',
            Tests: focused ? 'clipboard-text' : 'clipboard-text-outline',
            Profile: focused ? 'account' : 'account-outline',
          };
          return <Icon name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Courses" component={CoursesStack} />
      <Tab.Screen
        name="Live"
        component={LiveStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.liveIconContainer}>
              <Icon name={focused ? 'video' : 'video-outline'} size={24} color={focused ? COLORS.white : color} />
              {focused && <View style={styles.liveDot} />}
            </View>
          ),
          tabBarLabel: 'Live',
        }}
      />
      <Tab.Screen name="Tests" component={TestsStack} />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  liveIconContainer: {
    backgroundColor: COLORS.live,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
  liveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
});

export default MainTabNavigator;
