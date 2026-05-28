import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { supabase } from '../../lib/supabase';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !displayName) return;
    setLoading(true);
    
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

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Check your email', 'We sent you a magic link to complete sign up.');
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
          
          <Button 
            title={loading ? "Creating..." : "Create Account"} 
            onPress={handleSignUp} 
            disabled={loading || !email || !displayName}
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
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
