import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';

type LegalScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Legal'>;

interface Props {
  navigation: LegalScreenNavigationProp;
}

export const LegalScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Legal & Privacy</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Terms of Service</Text>
          <Text style={styles.paragraph}>
            Welcome to Veritas. By using our application, you agree to post one honest reflection per day to your private circle. Veritas is a platform for personal growth and authentic connection. You agree not to post illegal, abusive, or harmful content. We reserve the right to terminate accounts that violate these terms.
          </Text>

          <Text style={styles.heading}>Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Your privacy is our core principle. Your daily posts are visible ONLY to the members of your private circle. We do not sell your data or display public metrics like followers or likes. 
          </Text>
          
          <Text style={styles.heading}>AI Processing</Text>
          <Text style={styles.paragraph}>
            Veritas uses advanced artificial intelligence (Google Gemini) to generate personalized daily reflection prompts, your 30-day Growth Passport, and your Annual Memoir. By using the app, you consent to having your journal entries processed securely by these AI models for the sole purpose of generating these insights for your personal use. Your data is not used to train global public models.
          </Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
        
        <View style={styles.footer}>
          <Button 
            title="Go Back" 
            onPress={() => navigation.goBack()} 
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
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.post.fontFamily,
    fontSize: 28,
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  heading: {
    fontFamily: typography.post.fontFamily,
    fontSize: 20,
    color: colors.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  paragraph: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bottomSpacer: {
    height: 40,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }
});
