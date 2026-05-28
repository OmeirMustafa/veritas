import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { supabase } from '../../lib/supabase';

type SignInScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create on signin, use signup screen for new users
      }
    });

    setLoading(false);
    if (error) {
      if (error.message.includes('Signups not allowed')) {
        Alert.alert('Account not found', 'Please sign up first.');
        navigation.navigate('SignUp');
      } else {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Check your email', 'We sent you a magic link to sign in.');
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
});
