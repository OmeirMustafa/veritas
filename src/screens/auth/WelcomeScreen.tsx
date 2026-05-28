import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>VERITAS</Text>
          <Text style={styles.subtitle}>
            One honest post per day.{"\n"}
            Shared to a private circle.{"\n"}
            Witnessed, not liked.
          </Text>
        </View>
        <View style={styles.footer}>
          <Button 
            title="Continue" 
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
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.post.fontFamily,
    fontSize: 32,
    color: colors.primary,
    marginBottom: spacing.lg,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
