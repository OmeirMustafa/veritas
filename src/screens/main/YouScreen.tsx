import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { generateGrowthPassport, GrowthTheme } from '../../lib/ai';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';

export const YouScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [streak, setStreak] = useState(0);
  const [memberSince, setMemberSince] = useState('');
  const [themes, setThemes] = useState<GrowthTheme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(false);

  // Dummy data for heatmap - 52 columns, 7 rows
  const heatmapData = Array.from({ length: 52 }, () =>
    Array.from({ length: 7 }, () => Math.random() > 0.7) // 30% chance to have posted
  );

  useEffect(() => {
    if (user?.created_at) {
      const date = new Date(user.created_at);
      setMemberSince(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
    if (user?.id) {
      loadThemes(user.id);
      calculateStreak(user.id);
    }
  }, [user]);

  const calculateStreak = async (userId: string) => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('post_date')
        .eq('user_id', userId)
        .order('post_date', { ascending: false });

      if (error || !posts) {
        setStreak(0);
        return;
      }

      let currentStreak = 0;
      let checkDate = new Date(); // Start with today

      // We only consider dates in YYYY-MM-DD format
      const dateStrings = new Set(posts.map(p => p.post_date));

      // If they haven't posted today, check if they posted yesterday
      const todayStr = checkDate.toISOString().split('T')[0];
      const yesterday = new Date(checkDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (!dateStrings.has(todayStr) && !dateStrings.has(yesterdayStr)) {
        setStreak(0);
        return;
      }

      // If they haven't posted today, but did yesterday, start counting from yesterday
      if (!dateStrings.has(todayStr) && dateStrings.has(yesterdayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Traverse backwards day by day
      while (true) {
        const currentStr = checkDate.toISOString().split('T')[0];
        if (dateStrings.has(currentStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1); // move back one day
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (e) {
      console.error(e);
      setStreak(0);
    }
  };

  const loadThemes = async (userId: string) => {
    setLoadingThemes(true);
    const generatedThemes = await generateGrowthPassport(userId);
    setThemes(generatedThemes);
    setLoadingThemes(false);
  };

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
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
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
          
          {loadingThemes ? (
            <Text style={styles.themeDesc}>Analyzing your recent reflections...</Text>
          ) : themes.length > 0 ? (
            themes.map((theme, index) => (
              <View key={index} style={styles.themeCard}>
                <Text style={styles.themeLabel}>{theme.label}</Text>
                <Text style={styles.themeDesc}>{theme.description}</Text>
              </View>
            ))
          ) : (
            <View style={styles.themeCard}>
              <Text style={styles.themeLabel}>Keep Posting</Text>
              <Text style={styles.themeDesc}>We need a few more daily reflections to generate your unique growth themes. Keep showing up.</Text>
            </View>
          )}
        </View>

        <View style={styles.memoirSection}>
          <Text style={styles.sectionTitle}>Your Narrative</Text>
          <Text style={styles.sectionSubtitle}>Looking back at your journey</Text>
          <Button 
            title={`Read ${new Date().getFullYear()} Memoir`}
            onPress={() => navigation.navigate('Memoir', { year: new Date().getFullYear() })}
            variant="outline"
          />
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
  memoirSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
});
