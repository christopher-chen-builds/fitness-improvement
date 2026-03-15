import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { baselineExercises, mixinRepository, muscleGroups, dayName } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a fitness trainer AI for PrecisionFit. Your job is to create workout variations.

RULES:
- You will receive a baseline workout (exercises with sets/reps/weight/cues) and a repository of mix-in alternatives.
- Replace exactly 1 or 2 exercises from the baseline with contextually appropriate alternatives from the repository.
- The replacements must target the SAME muscle group as the exercise being replaced.
- Keep the remaining baseline exercises unchanged.
- Maintain the same total number of exercises.
- Return ONLY valid JSON — an array of exercise objects with these exact fields: id, name, sets, reps, weight, unit, cue, perHand (boolean, optional).
- Do NOT add any commentary, markdown, or wrapper — just the JSON array.`;

    const userPrompt = `Today's workout: "${dayName}" targeting ${muscleGroups.join(", ")}.

BASELINE EXERCISES:
${JSON.stringify(baselineExercises, null, 2)}

MIX-IN REPOSITORY (choose replacements from here):
${JSON.stringify(mixinRepository, null, 2)}

Generate a varied workout by substituting 1-2 baseline exercises with mix-in alternatives. Return the complete workout as a JSON array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Extract JSON array from response (handle markdown code blocks)
    let exercises;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      exercises = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response", fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ exercises }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mix-workout error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
