import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { PostCard, Post } from '../../components/feed/PostCard';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<MainTabParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ route }) => {
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

  useEffect(() => {
    // Handling invite token from deep link
    const token = route.params?.token;
    if (token && user) {
      handleInvite(token);
    }
  }, [route.params, user]);

  const handleInvite = async (token: string) => {
    try {
      const { data: invite } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .is('accepted_at', null)
        .single();
        
      if (invite && user?.id) {
        await supabase.from('circle_members').insert({
          circle_id: invite.circle_id,
          user_id: user.id,
          status: 'active'
        });
        
        await supabase.from('invitations').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id);
        alert('Successfully joined the circle!');
        fetchPosts();
      }
    } catch (e) {
      // Ignore invite errors in UI
    }
  };

  const fetchPosts = async () => {
    if (!user) return;
    
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
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            currentUserId={user?.id || ''} 
            onReact={handleReact} 
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Today</Text>
          </View>
        }
        ListFooterComponent={
          !loading ? (
            <View style={styles.endState}>
              <View style={styles.illustrationPlaceholder} />
              <Text style={styles.endStateText}>
                {posts.length === 0 ? "Your circle is quiet today." : "You've witnessed everyone today."}
              </Text>
            </View>
          ) : null
        }
      />
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
