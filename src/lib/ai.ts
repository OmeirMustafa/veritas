import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback prompts if API fails
const STARTER_PROMPTS = [
  "What is something you changed your mind about recently?",
  "Describe a moment today where you felt completely at peace.",
  "What is a hard conversation you've been avoiding?",
  "When did you last feel proud of yourself?",
  "What boundary do you need to set right now?"
];

// Helper to get from cache
async function getCached<T>(key: string, ttlMs: number): Promise<T | null> {
  try {
    const item = await AsyncStorage.getItem(key);
    if (!item) return null;
    const { value, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > ttlMs) return null; // expired
    return value as T;
  } catch {
    return null;
  }
}

// Helper to set cache
async function setCached(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch {
    // ignore
  }
}

export async function getReflectionPrompt(userId: string): Promise<string> {
  const cacheKey = `prompt_${userId}_${new Date().toISOString().split('T')[0]}`;
  const cached = await getCached<string>(cacheKey, 24 * 60 * 60 * 1000); // 24 hours
  if (cached) return cached;

  try {
    const { data, error } = await supabase.functions.invoke('ai-generate', {
      body: { action: 'prompt', userId }
    });

    if (error || !data?.result) throw error || new Error("No result");

    await setCached(cacheKey, data.result);
    return data.result;
  } catch (err) {
    console.warn("Edge function prompt error:", err);
    return STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)];
  }
}

export interface GrowthTheme {
  label: string;
  description: string;
}

export async function generateGrowthPassport(userId: string): Promise<GrowthTheme[]> {
  const cacheKey = `passport_${userId}_${new Date().toISOString().split('T')[0]}`;
  const cached = await getCached<GrowthTheme[]>(cacheKey, 24 * 60 * 60 * 1000); // 24 hours
  if (cached) return cached;

  try {
    const { data, error } = await supabase.functions.invoke('ai-generate', {
      body: { action: 'passport', userId }
    });

    if (error) throw error;
    
    if (data?.result && Array.isArray(data.result)) {
      await setCached(cacheKey, data.result);
      return data.result;
    }
    return [];
  } catch (err) {
    console.warn("Edge function passport error:", err);
    return [];
  }
}

export async function generateAnnualMemoir(userId: string, year: number): Promise<string> {
  const cacheKey = `memoir_${userId}_${year}`;
  const cached = await getCached<string>(cacheKey, 7 * 24 * 60 * 60 * 1000); // 7 days
  if (cached) return cached;

  try {
    const { data, error } = await supabase.functions.invoke('ai-generate', {
      body: { action: 'memoir', userId, year }
    });

    if (error || !data?.result) throw error || new Error("No result");

    await setCached(cacheKey, data.result);
    return data.result;
  } catch (err) {
    console.warn("Edge function memoir error:", err);
    return "There was an error generating your memoir.";
  }
}
