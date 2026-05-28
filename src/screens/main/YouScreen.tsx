import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';

export const YouScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [streak, setStreak] = useState(0);
  const [memberSince, setMemberSince] = useState('');

  // Dummy data for heatmap - 52 columns, 7 rows
  const heatmapData = Array.from({ length: 52 }, () =>
    Array.from({ length: 7 }, () => Math.random() > 0.7) // 30% chance to have posted
  );

  useEffect(() => {
    if (user?.created_at) {
      const date = new Date(user.created_at);
      setMemberSince(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
    // Simulate calculating streak
    setStreak(12);
  }, [user]);

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : '?';
  };

  const getMilestoneCallout = () => {
    if (streak >= 100) return 'Centurion';
    if (streak >= 30) return 'One Month Strong';
    if (streak >= 7) return 'Building the Habit';
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.header}>
          <Text style={styles.title}>You</Text>
          <TouchableOpacity onPress={() => supabase.auth.signOut()}>
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.user_metadata?.display_name)}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.user_metadata?.display_name || 'User'}</Text>
            <Text style={styles.memberSince}>Member since {memberSince}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.streakCard}>
            <Text style={styles.streakCount}>{streak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
            {getMilestoneCallout() && (
              <View style={styles.milestoneBadge}>
                <Text style={styles.milestoneText}>{getMilestoneCallout()}</Text>
              </View>
            )}
          </View>

          <View style={styles.heatmapCard}>
            <Text style={styles.heatmapTitle}>Your Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heatmapGrid}>
              {heatmapData.map((week, wIndex) => (
                <View key={wIndex} style={styles.heatmapCol}>
                  {week.map((posted, dIndex) => (
                    <View 
                      key={dIndex} 
                      style={[
                        styles.heatmapCell, 
                        posted ? styles.heatmapCellActive : styles.heatmapCellInactive
                      ]} 
                    />
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.passportSection}>
          <Text style={styles.sectionTitle}>Growth Passport</Text>
          <Text style={styles.sectionSubtitle}>AI-generated themes from your reflections</Text>
          
          <View style={styles.themeCard}>
            <Text style={styles.themeLabel}>Seeking Stillness</Text>
            <Text style={styles.themeDesc}>You've been navigating a noisy season by intentionally creating quiet moments. This theme appears strongly in your weekend reflections.</Text>
          </View>

          <View style={styles.themeCard}>
            <Text style={styles.themeLabel}>Relational Depth</Text>
            <Text style={styles.themeDesc}>There is a recurring focus on moving past surface-level interactions. You're craving authenticity in your friendships.</Text>
          </View>

          <View style={styles.themeCard}>
            <Text style={styles.themeLabel}>Embracing Uncertainty</Text>
            <Text style={styles.themeDesc}>You are learning to sit with unanswered questions rather than rushing to solve them. This shows immense personal growth.</Text>
          </View>
        </View>

      </ScrollView>
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
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    fontFamily: typography.post.fontFamily,
    fontSize: 28,
    color: colors.primary,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    color: colors.white,
    fontFamily: typography.ui.fontFamily,
    fontWeight: '600',
    fontSize: 24,
  },
  name: {
    fontFamily: typography.post.fontFamily,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  memberSince: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsSection: {
    marginBottom: spacing.xxl,
  },
  streakCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakCount: {
    fontFamily: typography.post.fontFamily,
    fontSize: 48,
    color: colors.primary,
  },
  streakLabel: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  milestoneBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.small,
  },
  milestoneText: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  heatmapCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heatmapTitle: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  heatmapCol: {
    gap: 4,
  },
  heatmapCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  heatmapCellActive: {
    backgroundColor: colors.primary,
  },
  heatmapCellInactive: {
    backgroundColor: colors.background, // cream
  },
  passportSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.post.fontFamily,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  themeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeLabel: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  themeDesc: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
