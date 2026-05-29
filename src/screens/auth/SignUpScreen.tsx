import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignUp = async () => {
    if (!email || !displayName || !agreedToTerms) return;
    
    if (!isSupabaseConfigured()) {
      setErrorMessage('App is not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Using magic link for sign up as well
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            display_name: displayName,
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
        Alert.alert('Error', error.message);
      } else {
        setSuccessMessage('We sent you a magic link to complete sign up. Check your email!');
        Alert.alert('Check your email', 'We sent you a magic link to complete sign up.');
      }
    } catch (err: any) {
      const message = err?.message === 'Failed to fetch'
        ? 'Could not connect to server. Please check your internet connection and try again.'
        : (err?.message || 'An unexpected error occurred.');
      setErrorMessage(message);
      Alert.alert('Connection Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Join Veritas.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Display Name"
            placeholder="How should we call you?"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>
              I agree to the{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('Legal')}>
                Terms of Service & Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
          
          <Button 
            title={loading ? "Creating..." : "Create Account"} 
            onPress={handleSignUp} 
            disabled={loading || !email || !displayName || !agreedToTerms}
            style={styles.button}
          />
          
          <Button 
            title="Already have an account?" 
            variant="secondary"
            onPress={() => navigation.navigate('SignIn')} 
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
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
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
  }
});
