import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type SignInScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignIn = async () => {
    if (!email) return;

    if (!isSupabaseConfigured()) {
      setErrorMessage('App is not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create on signin, use signup screen for new users
        }
      });

      if (error) {
        if (error.message.includes('Signups not allowed')) {
          setErrorMessage('No account found with this email. Redirecting to sign up...');
          setTimeout(() => navigation.navigate('SignUp'), 1500);
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setSuccessMessage('We sent you a magic link! Check your email to sign in.');
      }
    } catch (err: any) {
      const message = err?.message === 'Failed to fetch'
        ? 'Could not connect to server. Please check your internet connection and try again.'
        : (err?.message || 'An unexpected error occurred.');
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
          
          <Button 
            title={loading ? "Sending..." : "Send Magic Link"} 
            onPress={handleSignIn} 
            disabled={loading || !email}
            style={styles.button}
          />
          
          <Button 
            title="Create an account instead" 
            variant="secondary"
            onPress={() => navigation.navigate('SignUp')} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.post.fontFamily,
    fontSize: 28,
    color: colors.primary,
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: spacing.md,
    fontSize: 14,
  },
  successText: {
    color: '#27ae60',
    marginBottom: spacing.md,
    fontSize: 14,
  },
});
