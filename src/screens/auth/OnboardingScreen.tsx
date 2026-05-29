import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(1);

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>The Veritas Way.</Text>
      <Text style={styles.body}>
        We believe in consistency over performance.{"\n\n"}
        No likes. No follower counts. Just one honest reflection per day, shared with the people who matter most.
      </Text>
      <View style={styles.footer}>
        <Button title="I understand" onPress={() => setStep(2)} />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Your Circle.</Text>
      <Text style={styles.body}>
        Veritas is experienced in small, private circles. You can join an existing one with an invite link, or start your own.
      </Text>
      <View style={styles.footer}>
        <Button title="Create my first circle" onPress={() => setStep(3)} style={{ marginBottom: spacing.md }} />
        <Button title="I have an invite link" variant="secondary" onPress={() => setStep(3)} />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Daily Rhythm.</Text>
      <Text style={styles.body}>
        We limit notifications to one per day to protect your attention. When would you like to be reminded to post?
      </Text>
      <View style={styles.timePickerContainer}>
        <Text style={styles.timePlaceholder}>8:00 PM</Text>
      </View>
      <View style={styles.footer}>
        <Button title="Complete Setup" onPress={() => navigation.navigate('SignUp')} />
        <Button title="Skip notifications" variant="secondary" onPress={() => navigation.navigate('SignUp')} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
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
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.post.fontFamily,
    fontSize: 32,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 28,
  },
  timePickerContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    alignItems: 'center',
  },
  timePlaceholder: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 24,
    color: colors.textPrimary,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
});
