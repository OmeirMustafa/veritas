import type { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  Onboarding: undefined;
};

// Main App Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  ComposeModal: undefined; // Not a real tab, handled via listener or stack
  You: undefined;
};

// Root Stack that wraps Tabs and Modals
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Compose: undefined; // Full screen modal
  Memoir: { year: number };
};
