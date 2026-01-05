import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useAppStore } from '../store/useAppStore';

// Screens
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import SentenceDetailScreen from '../screens/SentenceDetailScreen';
import ConversationScreen from '../screens/ConversationScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import MyPageScreen from '../screens/MyPageScreen';

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
  SentenceDetail: { id: string | number };
  Conversation: undefined;
};

export type TabParamList = {
  Home: undefined;
  Feedback: undefined;
  MyPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingTop: 8,
          paddingBottom: 24,
          height: 80,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Feedback') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'MyPage') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} options={{ tabBarLabel: '피드백' }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ tabBarLabel: '마이' }} />
    </Tab.Navigator>
  );
}

const linking = {
  prefixes: [Linking.createURL('/'), 'jptaku://'],
  config: {
    screens: {
      Login: 'login',
      Onboarding: 'onboarding',
      Main: '',
      SentenceDetail: 'sentence/:id',
      Conversation: 'chat',
    },
  },
};

export default function AppNavigator() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const isOnboarded = useAppStore((state) => state.isOnboarded);
  const setAuth = useAppStore((state) => state.setAuth);

  useEffect(() => {
    // Handle deep link for auth callback
    const handleDeepLink = (event: { url: string }) => {
      try {
        const url = new URL(event.url);
        if (url.pathname === '/auth/callback' || url.host === 'auth') {
          const accessToken = url.searchParams.get('access_token');
          if (accessToken) {
            setAuth(accessToken);
          }
        }
      } catch (e) {
        console.error('Deep link parsing error:', e);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [setAuth]);

  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!isLoggedIn) return 'Login';
    if (!isOnboarded) return 'Onboarding';
    return 'Main';
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="SentenceDetail"
          component={SentenceDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Conversation"
          component={ConversationScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
