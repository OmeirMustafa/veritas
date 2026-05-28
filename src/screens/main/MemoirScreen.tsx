import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography, spacing, radius } from '../../theme';
import { generateAnnualMemoir } from '../../lib/ai';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Memoir'>;

export const MemoirScreen: React.FC<Props> = ({ route, navigation }) => {
  const { year } = route.params;
  const { user } = useAuthStore();
  const [memoir, setMemoir] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMemoir();
    }
  }, [user, year]);

  const loadMemoir = async () => {
    setLoading(true);
    if (!user) return;
    const result = await generateAnnualMemoir(user.id, year);
    setMemoir(result);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{year} Memoir</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Writing your story...</Text>
          </View>
        ) : (
          <View style={styles.memoirCard}>
            <Text style={styles.memoirText}>{memoir}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.post.fontFamily,
    fontSize: 20,
    color: colors.primary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontFamily: typography.ui.fontFamily,
    fontSize: 16,
    color: colors.textSecondary,
  },
  memoirCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memoirText: {
    fontFamily: typography.post.fontFamily,
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 32,
  },
});
