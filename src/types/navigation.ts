import type { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  Onboarding: undefined;
  Legal: undefined;
};

// Main App Tab Navigator
export type MainTabParamList = {
  Home: { token?: string };
  ComposeModal: undefined;
  You: undefined;
};

// Root Stack that wraps Tabs and Modals
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Compose: undefined; // Full screen modal
  Memoir: { year: number };
  Settings: undefined;
  NotFound: undefined;
};
