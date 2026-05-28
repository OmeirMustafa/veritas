import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../theme';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
}

export interface Post {
  id: string;
  user_id: string;
  content_text?: string;
  voice_url?: string;
  photo_url?: string;
  created_at: string;
  users: User;
}

interface Props {
  post: Post;
  currentUserId: string;
  onReact: (postId: string, type: string) => void;
  // in a real app, we'd pass reaction counts if we are the author
  // and whether we've reacted
}

const REACTIONS = [
  { id: 'see_you', label: 'See you' },
  { id: 'resonated', label: 'Resonated' },
  { id: 'rooting', label: 'Rooting' },
  { id: 'needed_this', label: 'Needed this' },
  { id: 'brave', label: 'Brave' },
];

export const PostCard: React.FC<Props> = ({ post, currentUserId, onReact }) => {
  const isAuthor = post.user_id === currentUserId;

  const handleReact = (reactionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReact(post.id, reactionId);
  };

  const getTimeElapsed = (dateString: string) => {
    const elapsed = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(post.users?.display_name || '?')}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{post.users?.display_name}</Text>
          <Text style={styles.time}>{getTimeElapsed(post.created_at)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {post.content_text && (
          <Text style={styles.textContent}>{post.content_text}</Text>
        )}
        {/* We would render photo or voice player here if they exist */}
      </View>

      {!isAuthor && (
        <View style={styles.reactionStrip}>
          {REACTIONS.map((r) => (
            <TouchableOpacity 
              key={r.id} 
              style={styles.reactionButton}
              onPress={() => handleReact(r.id)}
            >
              <Text style={styles.reactionText}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isAuthor && (
        <View style={styles.authorStats}>
          <Text style={styles.statsText}>Reaction counts visible only to you (Mock)</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontFamily: typography.ui.fontFamily,
    fontWeight: '600',
    fontSize: 16,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: typography.ui.fontFamily,
    fontWeight: '600',
    fontSize: 16,
    color: colors.textPrimary,
  },
  time: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    marginBottom: spacing.lg,
  },
  textContent: {
    fontFamily: typography.post.fontFamily,
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  reactionStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  reactionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.small,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionText: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
  },
  authorStats: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statsText: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
