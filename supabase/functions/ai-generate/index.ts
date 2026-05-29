import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const STARTER_PROMPTS = [
  "What is something you changed your mind about recently?",
  "Describe a moment today where you felt completely at peace.",
  "What is a hard conversation you've been avoiding?",
  "When did you last feel proud of yourself?",
  "What boundary do you need to set right now?"
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify Authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const { action, userId, year } = await req.json();
    
    // Ensure the user is only requesting for themselves
    if (userId !== user.id) {
       return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    let result = null;

    if (action === 'prompt') {
      const { data: recentPosts } = await supabaseClient
        .from('posts')
        .select('content_text')
        .eq('user_id', userId)
        .order('post_date', { ascending: false })
        .limit(7);

      let promptContext = "";
      if (recentPosts && recentPosts.length > 0) {
        promptContext = "Here are their recent journal entries to give you context:\n" + 
          recentPosts.map((p: any) => `- ${p.content_text}`).join("\n");
      }

      const systemInstruction = "You are a thoughtful, empathetic journaling guide. Based on the user's recent posts, generate a single, deeply reflective question (under 20 words) for them to answer today. Do not be overly poetic or cheesy. Be direct and insightful. Return only the question text.";
      
      result = await callGemini(systemInstruction, promptContext || "The user has no recent posts. Give them a powerful starter question.");
      
      if (!result) {
         result = STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)];
      }
    } else if (action === 'passport') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: posts } = await supabaseClient
        .from('posts')
        .select('content_text, post_date')
        .eq('user_id', userId)
        .gte('post_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('post_date', { ascending: false });

      if (!posts || posts.length < 3) {
        result = [];
      } else {
        const pastPostsText = posts.map((p: any) => `[${p.post_date}]: ${p.content_text}`).join('\n');
        const systemInstruction = "You are a perceptive growth companion analyzing the user's journal entries from the last 30 days. Identify exactly 3 overarching personal growth themes. Format your response strictly as a JSON array of objects with 'label' (short title) and 'description' (2 warm, insightful sentences). Do not include any markdown formatting like ```json.";
        
        const rawResult = await callGemini(systemInstruction, `Here are my recent posts:\n${pastPostsText}\n\nGenerate my 3 growth themes as JSON.`);
        if (rawResult) {
            const jsonMatch = rawResult.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              try {
                const themes = JSON.parse(jsonMatch[0]);
                result = themes.slice(0, 3);
              } catch (e) {
                console.error("Failed to parse Gemini output as JSON", e);
                result = [];
              }
            } else {
              result = [];
            }
        } else {
           result = [];
        }
      }
    } else if (action === 'memoir') {
      if (!year) throw new Error("Year is required for memoir");
      
      const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
      const endDate = new Date(year, 11, 31).toISOString().split('T')[0];

      const { data: posts } = await supabaseClient
        .from('posts')
        .select('content_text, post_date')
        .eq('user_id', userId)
        .gte('post_date', startDate)
        .lte('post_date', endDate)
        .order('post_date', { ascending: true });

      if (!posts || posts.length === 0) {
        result = "It looks like you didn't record any reflections this year. Your story awaits in the next chapter.";
      } else {
        const pastPostsText = posts.map((p: any) => `[${p.post_date}]: ${p.content_text}`).join('\n');
        const systemInstruction = "You are a warm, eloquent author writing the user's annual memoir. Based on their journal entries from the entire year, write a beautiful, cohesive narrative summarizing their journey, struggles, and growth. Use a compassionate, warm tone. Format it as 3 to 4 short paragraphs. Do not use generic phrases; root your writing strictly in the concrete details they shared.";
        
        result = await callGemini(systemInstruction, `Here are my posts for the year ${year}:\n${pastPostsText}\n\nWrite my annual memoir.`);
        if (!result) {
            result = "Your memoir could not be written at this time.";
        }
      }
    } else {
      throw new Error("Invalid action");
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

async function callGemini(systemInstruction: string, promptText: string): Promise<string | null> {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const json = await response.json();
    if (json.candidates && json.candidates.length > 0) {
      return json.candidates[0].content.parts[0].text.trim();
    }
    return null;
}
