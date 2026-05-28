import { supabase } from './supabase';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Fallback prompts if API fails
const STARTER_PROMPTS = [
  "What is something you changed your mind about recently?",
  "Describe a moment today where you felt completely at peace.",
  "What is a hard conversation you've been avoiding?",
  "When did you last feel proud of yourself?",
  "What boundary do you need to set right now?"
];

export async function getReflectionPrompt(userId: string): Promise<string> {
  try {
    if (!GEMINI_API_KEY) throw new Error("No Gemini API key");

    // Fetch user's recent posts to give Claude context
    const { data: recentPosts, error } = await supabase
      .from('posts')
      .select('content_text')
      .eq('user_id', userId)
      .order('post_date', { ascending: false })
      .limit(7);

    let promptContext = "";
    if (!error && recentPosts && recentPosts.length > 0) {
      promptContext = "Here are their recent journal entries to give you context:\n" + 
        recentPosts.map(p => `- ${p.content_text}`).join("\n");
    }

    const systemInstruction = "You are a thoughtful, empathetic journaling guide. Based on the user's recent posts, generate a single, deeply reflective question (under 20 words) for them to answer today. Do not be overly poetic or cheesy. Be direct and insightful. Return only the question text.";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: promptContext || "The user has no recent posts. Give them a powerful starter question." }] }]
      })
    });

    const json = await response.json();
    if (json.candidates && json.candidates.length > 0) {
      return json.candidates[0].content.parts[0].text.trim();
    }
    
    return STARTER_PROMPTS[0];
  } catch (err) {
    console.error("Gemini prompt error:", err);
    return STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)];
  }
}

export interface GrowthTheme {
  label: string;
  description: string;
}

export async function generateGrowthPassport(userId: string): Promise<GrowthTheme[]> {
  try {
    if (!GEMINI_API_KEY) throw new Error("No Gemini API key");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: posts, error } = await supabase
      .from('posts')
      .select('content_text, post_date')
      .eq('user_id', userId)
      .gte('post_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('post_date', { ascending: false });

    if (error || !posts || posts.length < 3) return [];

    const pastPostsText = posts.map(p => `[${p.post_date}]: ${p.content_text}`).join('\n');
    
    const systemInstruction = "You are a perceptive growth companion analyzing the user's journal entries from the last 30 days. Identify exactly 3 overarching personal growth themes. Format your response strictly as a JSON array of objects with 'label' (short title) and 'description' (2 warm, insightful sentences). Do not include any markdown formatting like ```json.";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: `Here are my recent posts:\n${pastPostsText}\n\nGenerate my 3 growth themes as JSON.` }] }]
      })
    });

    const json = await response.json();
    if (json.candidates && json.candidates.length > 0) {
      const text = json.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const themes = JSON.parse(jsonMatch[0]);
        return themes.slice(0, 3) as GrowthTheme[];
      }
    }
    return [];
  } catch (err) {
    console.error("Gemini passport error:", err);
    return [];
  }
}

export async function generateAnnualMemoir(userId: string, year: number): Promise<string> {
  try {
    if (!GEMINI_API_KEY) throw new Error("No Gemini API key");

    const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
    const endDate = new Date(year, 11, 31).toISOString().split('T')[0];

    const { data: posts, error } = await supabase
      .from('posts')
      .select('content_text, post_date')
      .eq('user_id', userId)
      .gte('post_date', startDate)
      .lte('post_date', endDate)
      .order('post_date', { ascending: true });

    if (error || !posts || posts.length === 0) {
      return "It looks like you didn't record any reflections this year. Your story awaits in the next chapter.";
    }

    const pastPostsText = posts.map(p => `[${p.post_date}]: ${p.content_text}`).join('\n');

    const systemInstruction = "You are a warm, eloquent author writing the user's annual memoir. Based on their journal entries from the entire year, write a beautiful, cohesive narrative summarizing their journey, struggles, and growth. Use a compassionate, warm tone. Format it as 3 to 4 short paragraphs. Do not use generic phrases; root your writing strictly in the concrete details they shared.";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: `Here are my posts for the year ${year}:\n${pastPostsText}\n\nWrite my annual memoir.` }] }]
      })
    });

    const json = await response.json();
    if (json.candidates && json.candidates.length > 0) {
      return json.candidates[0].content.parts[0].text.trim();
    }
    
    return "Your memoir could not be written at this time.";
  } catch (err) {
    console.error("Gemini memoir error:", err);
    return "There was an error generating your memoir.";
  }
}
