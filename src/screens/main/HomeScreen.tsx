import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { PostCard, Post } from '../../components/feed/PostCard';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetchPosts();

    // Set up realtime subscription
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        // In a real app we'd verify the post is in one of our circles,
        // but for now we just refetch or append if it matches.
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;
    // We are simulating fetching posts from circles.
    // In actual implementation, we join with post_circles and circle_members
    // and filter for last 24 hours: `created_at > now() - interval '24 hours'`
    // Sorted chronological: `.order('created_at', { ascending: true })`
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users ( id, display_name, avatar_url )
      `)
      .order('created_at', { ascending: true })
      .limit(20);

    if (!error && data) {
      setPosts(data as unknown as Post[]);
    }
    setLoading(false);
  };

  const handleReact = async (postId: string, reactionType: string) => {
    if (!user) return;
    // Fire and forget reaction
    await supabase.from('reactions').insert({
      post_id: postId,
      reactor_user_id: user.id,
      reaction_type: reactionType,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false} // No pull to refresh affordance
      >
        <View style={styles.header}>
          <Text style={styles.title}>Today</Text>
        </View>

        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUserId={user?.id || ''} 
            onReact={handleReact} 
          />
        ))}

        {!loading && (
          <View style={styles.endState}>
            {/* Simple centered illustration (placeholder for SVG) */}
            <View style={styles.illustrationPlaceholder} />
            <Text style={styles.endStateText}>You've witnessed everyone today.</Text>
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
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2, // Space for bottom tab nav
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    fontFamily: typography.post.fontFamily,
    fontSize: 28,
    color: colors.primary,
  },
  endState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    marginTop: spacing.xl,
  },
  illustrationPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  endStateText: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
