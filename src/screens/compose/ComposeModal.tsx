import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput as RNTextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography, spacing, radius } from '../../theme';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { getReflectionPrompt } from '../../lib/ai';
import { Ionicons } from '@expo/vector-icons'; // Assuming expo vector icons are available

type ComposeModalNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Compose'>;

interface Props {
  navigation: ComposeModalNavigationProp;
}

export const ComposeModal: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [existingPostId, setExistingPostId] = useState<string | null>(null);
  const [circles, setCircles] = useState<{id: string, name: string}[]>([]);
  const [selectedCircles, setSelectedCircles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      checkExistingPost();
      loadPrompt();
      loadCircles();
    }
  }, [user]);

  const checkExistingPost = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('posts')
      .select('id, content_text')
      .eq('user_id', user.id)
      .eq('post_date', new Date().toISOString().split('T')[0])
      .single();

    if (data) {
      setExistingPostId(data.id);
      setContent(data.content_text || '');
    }
  };

  const loadPrompt = async () => {
    if (!user) return;
    const p = await getReflectionPrompt(user.id);
    setPrompt(p);
  };

  const loadCircles = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('circle_members')
      .select(`
        circle_id,
        circles ( id, name )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active');
      
    if (data) {
      const formatted = data.map(d => d.circles as unknown as { id: string, name: string });
      setCircles(formatted);
      setSelectedCircles(new Set(formatted.map(c => c.id)));
    }
  };

  const handleTextChange = (text: string) => {
    if (text.length <= 1200) {
      setContent(text);
    }
  };

  const toggleCircle = (id: string) => {
    const newSet = new Set(selectedCircles);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCircles(newSet);
  };

  const handlePost = async () => {
    if (!user || !content.trim()) return;
    setLoading(true);

    try {
      let postId = existingPostId;

      if (existingPostId) {
        // Edit
        await supabase
          .from('posts')
          .update({ content_text: content })
          .eq('id', existingPostId);
      } else {
        // Create
        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            content_text: content,
            post_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (error) throw error;
        if (data) postId = data.id;

        // Link to circles
        if (postId && selectedCircles.size > 0) {
          const links = Array.from(selectedCircles).map(cid => ({
            post_id: postId,
            circle_id: cid,
          }));
          await supabase.from('post_circles').insert(links);
        }
      }
      
      navigation.goBack();
    } catch (e) {
      console.error(e);
      // Fallback silent failure for UI, handle properly in production
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existingPostId ? 'Edit Post' : 'New Post'}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {showPrompt && prompt && (
            <TouchableOpacity 
              style={styles.promptCard} 
              onPress={() => setShowPrompt(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.promptText}>{prompt}</Text>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} style={styles.promptClose} />
            </TouchableOpacity>
          )}

          <RNTextInput
            style={styles.input}
            placeholder="Write your honest reflection..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={content}
            onChangeText={handleTextChange}
            autoFocus
          />

          {circles.length > 0 && (
            <View style={styles.circlesSection}>
              <Text style={styles.circlesLabel}>Share to:</Text>
              <View style={styles.circlesList}>
                {circles.map(c => {
                  const isSelected = selectedCircles.has(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.circlePill, isSelected && styles.circlePillSelected]}
                      onPress={() => toggleCircle(c.id)}
                    >
                      <Text style={[styles.circlePillText, isSelected && styles.circlePillTextSelected]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.formatSelector}>
            <TouchableOpacity style={styles.formatIcon}>
              <Ionicons name="text" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.formatIcon}>
              <Ionicons name="mic-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.formatIcon}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Button 
            title={loading ? 'Publishing...' : 'Publish'} 
            onPress={handlePost}
            disabled={!content.trim() || loading}
          />
        </View>
      </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  promptCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  promptText: {
    flex: 1,
    fontFamily: typography.post.fontFamily,
    fontSize: 16,
    color: colors.primary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  promptClose: {
    marginLeft: spacing.sm,
  },
  input: {
    fontFamily: typography.post.fontFamily,
    fontSize: 20,
    color: colors.textPrimary,
    minHeight: 200,
    textAlignVertical: 'top',
    lineHeight: 30,
  },
  circlesSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  circlesLabel: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  circlesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  circlePill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  circlePillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circlePillText: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
  },
  circlePillTextSelected: {
    color: colors.white,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  formatSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formatIcon: {
    padding: spacing.xs,
  },
});
