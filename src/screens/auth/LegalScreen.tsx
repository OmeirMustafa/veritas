import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';

type LegalScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Legal'>;

interface Props {
  navigation: LegalScreenNavigationProp;
}

export const LegalScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'community'>('terms');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Legal & Privacy</Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
            onPress={() => setActiveTab('terms')}
          >
            <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
            onPress={() => setActiveTab('privacy')}
          >
            <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'community' && styles.activeTab]}
            onPress={() => setActiveTab('community')}
          >
            <Text style={[styles.tabText, activeTab === 'community' && styles.activeTabText]}>Community</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'terms' && (
            <>
              <Text style={styles.heading}>Terms of Service</Text>
              <Text style={styles.paragraph}>
                Welcome to Veritas. By using our application, you agree to post one honest reflection per day to your private circle. Veritas is a platform for personal growth and authentic connection.
              </Text>
              
              <Text style={styles.heading}>Age Requirement</Text>
              <Text style={styles.paragraph}>
                You must be at least 13 years old to use Veritas. By creating an account, you confirm that you meet this age requirement.
              </Text>

              <Text style={styles.heading}>No Medical Claims</Text>
              <Text style={styles.paragraph}>
                Veritas is a journaling tool, not a substitute for professional therapy, counseling, or medical advice. We make no guarantees regarding mental health outcomes.
              </Text>

              <Text style={styles.heading}>Account Termination</Text>
              <Text style={styles.paragraph}>
                We reserve the right to suspend or terminate accounts that violate our community guidelines, including posting illegal, abusive, or harmful content.
              </Text>
            </>
          )}

          {activeTab === 'privacy' && (
            <>
              <Text style={styles.heading}>Privacy Policy</Text>
              <Text style={styles.paragraph}>
                Your privacy is our core principle. Your daily posts are visible ONLY to the members of your private circle. We do not sell your data or display public metrics like followers or likes.
              </Text>
              
              <Text style={styles.heading}>AI Processing & Consent</Text>
              <Text style={styles.paragraph}>
                Veritas uses advanced artificial intelligence (Google Gemini) to generate personalized daily reflection prompts, your 30-day Growth Passport, and your Annual Memoir. By using the app, you explicitly consent to having your journal entries processed securely by these AI models. Your data is sent via a secure server-side connection and is NOT used to train public global AI models.
              </Text>

              <Text style={styles.heading}>Data Deletion & Export</Text>
              <Text style={styles.paragraph}>
                You own your data. You can request a full export of your journal entries or permanently delete your account and all associated data at any time from the Settings menu.
              </Text>
            </>
          )}

          {activeTab === 'community' && (
            <>
              <Text style={styles.heading}>Community Guidelines</Text>
              <Text style={styles.paragraph}>
                Veritas is built on trust and vulnerability. To protect this space, all users must adhere to the following rules:
              </Text>
              
              <Text style={styles.heading}>Prohibited Content</Text>
              <Text style={styles.paragraph}>
                - No harassment, bullying, or hate speech.{"\n"}
                - No promotion or glorification of self-harm.{"\n"}
                - No illegal content or non-consensual sharing of private information.{"\n"}
                - No spam or commercial solicitation.
              </Text>

              <Text style={styles.heading}>Reporting & Moderation</Text>
              <Text style={styles.paragraph}>
                If you encounter content that violates these guidelines, use the "Report" button on the post. Our moderation team reviews all reports within 24 hours. Violations will result in content removal and potential account suspension.
              </Text>

              <Text style={styles.heading}>Copyright & DMCA</Text>
              <Text style={styles.paragraph}>
                We respect intellectual property. If you believe your copyrighted work has been posted without permission, please contact our support team to submit a DMCA takedown request.
              </Text>
            </>
          )}

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
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.post.fontFamily,
    fontSize: 28,
    color: colors.primary,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
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
    color: colors.textPrimary,
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
