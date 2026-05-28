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

export interface GrowthTheme {
  label: string;
  description: string;
}

export async function generateGrowthPassport(userId: string): Promise<GrowthTheme[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: posts, error } = await supabase
      .from('posts')
      .select('content_text, post_date')
      .eq('user_id', userId)
      .gte('post_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('post_date', { ascending: false });

    if (error) throw error;

    if (!posts || posts.length < 3) {
      return []; // Not enough data to generate themes
    }

    const pastPostsText = posts
      .filter(p => p.content_text)
      .map(p => `[${p.post_date}]: ${p.content_text}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system: "You are a perceptive growth companion analyzing the user's journal entries from the last 30 days. Identify exactly 3 overarching personal growth themes. Format your response strictly as a JSON array of objects with 'label' (short title) and 'description' (2 warm, insightful sentences). Do not include any other text.",
      messages: [
        {
          role: 'user',
          content: `Here are my recent posts:\n${pastPostsText}\n\nGenerate my 3 growth themes as JSON.`
        }
      ]
    });

    if (response.content[0].type === 'text') {
      try {
        const jsonMatch = response.content[0].text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const themes = JSON.parse(jsonMatch[0]);
          return themes.slice(0, 3) as GrowthTheme[];
        }
      } catch (parseError) {
        console.error("Failed to parse Claude JSON response", parseError);
      }
    }
    return [];
  } catch (err) {
    console.error("Failed to generate passport", err);
    return [];
  }
}

export async function generateAnnualMemoir(userId: string, year: number): Promise<string> {
  try {
    const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
    const endDate = new Date(year, 11, 31).toISOString().split('T')[0];

    const { data: posts, error } = await supabase
      .from('posts')
      .select('content_text, post_date')
      .eq('user_id', userId)
      .gte('post_date', startDate)
      .lte('post_date', endDate)
      .order('post_date', { ascending: true });

    if (error) throw error;

    if (!posts || posts.length === 0) {
      return "It looks like you didn't record any reflections this year. Your story awaits in the next chapter.";
    }

    const pastPostsText = posts
      .filter(p => p.content_text)
      .map(p => `[${p.post_date}]: ${p.content_text}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: "You are a warm, eloquent author writing the user's annual memoir. Based on their journal entries from the entire year, write a beautiful, cohesive narrative summarizing their journey, struggles, and growth. Use a compassionate, warm tone. Format it as 3 to 4 short paragraphs. Do not use generic phrases; root your writing strictly in the concrete details they shared.",
      messages: [
        {
          role: 'user',
          content: `Here are my posts for the year ${year}:\n${pastPostsText}\n\nWrite my annual memoir.`
        }
      ]
    });

    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    
    return "Your memoir could not be written at this time.";
  } catch (err) {
    console.error("Failed to generate memoir", err);
    return "There was an error generating your memoir.";
  }
}
