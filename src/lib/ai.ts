import Anthropic from '@anthropic-ai/sdk';
import { supabase } from './supabase';

const anthropic = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || 'placeholder',
});

const STARTER_PROMPTS = [
  "What surprised you about today?",
  "What felt difficult today, and how did you carry it?",
  "Who did you feel most connected to today, and why?",
  "What did you learn about yourself today?",
  "What is a small moment you want to remember from today?",
];

export async function getReflectionPrompt(userId: string): Promise<string> {
  try {
    // Fetch user's last 7 posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('content_text, post_date')
      .eq('user_id', userId)
      .order('post_date', { ascending: false })
      .limit(7);

    if (error) throw error;

    if (!posts || posts.length === 0) {
      // Fallback to starter prompt if no posts
      return STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)];
    }

    const pastPostsText = posts
      .filter(p => p.content_text)
      .map(p => `[${p.post_date}]: ${p.content_text}`)
      .join('\n');

    if (!pastPostsText) {
      return STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)];
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      system: "You are a warm, perceptive growth companion. Based on the user's recent honest posts, generate a single reflection prompt for today. The prompt should be specific to their patterns — not generic. It should feel like it came from someone who has been paying close attention. Keep it under 40 words. Do not use hollow phrases like 'reflect on' or 'think about'. Ask something concrete.",
      messages: [
        {
          role: 'user',
          content: `Here are my recent posts:\n${pastPostsText}\n\nProvide my reflection prompt for today.`
        }
      ]
    });

    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    
    return STARTER_PROMPTS[0];
  } catch (err) {
    // Silently fallback on any error
    return STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)];
  }
}
