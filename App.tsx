import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { supabase } from './src/lib/supabase';
import { useAuthStore } from './src/store/authStore';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from './src/types/navigation';
import { colors } from './src/theme';

import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { SignUpScreen } from './src/screens/auth/SignUpScreen';
import { SignInScreen } from './src/screens/auth/SignInScreen';
import { OnboardingScreen } from './src/screens/auth/OnboardingScreen';

import { HomeScreen } from './src/screens/main/HomeScreen';
import { YouScreen } from './src/screens/main/YouScreen';
import { ComposeModal } from './src/screens/compose/ComposeModal';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AuthStack.Navigator>
  );
}

const DummyComponent = () => null;

function MainTabNavigator() {
  return (
    <MainTab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        }
      }}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Circle' }}
      />
      <MainTab.Screen 
        name="ComposeModal" 
        component={DummyComponent} 
        options={{ tabBarLabel: 'Post' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // Since Compose is at the root stack, we navigate to it directly
            navigation.navigate('Compose');
          },
        })}
      />
      <MainTab.Screen 
        name="You" 
        component={YouScreen} 
        options={{ tabBarLabel: 'You' }}
      />
    </MainTab.Navigator>
  );
}

export default function App() {
  const { session, isLoading, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen 
              name="Compose" 
              component={ComposeModal} 
              options={{ 
                presentation: 'fullScreenModal',
                animation: 'fade_from_bottom',
                animationDuration: 350,
              }} 
            />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
