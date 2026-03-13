import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { exerciseName } = await req.json();
    if (!exerciseName) {
      return new Response(
        JSON.stringify({ error: "exerciseName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // AI endpoint is configurable via env var for self-hosting.
    // Default: Lovable AI gateway. Override with any OpenAI-compatible endpoint.
    const AI_API_URL = Deno.env.get("AI_API_URL") || "https://ai.gateway.lovable.dev/v1/chat/completions";
    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    const AI_MODEL = Deno.env.get("AI_IMAGE_MODEL") || "google/gemini-2.5-flash-image";

    if (!AI_API_KEY) throw new Error("AI_API_KEY (or LOVABLE_API_KEY) not configured");

    const prompt = `Generate an image of the "${exerciseName}" exercise. Professional 3D medical-style fitness illustration, white glowing figure on deep black background, highlighting specific muscle groups in blue #007AFF, high-contrast, minimalist, 8k resolution. On a solid black background.`;

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response structure:", JSON.stringify(Object.keys(data)));
    console.log("Choice message keys:", JSON.stringify(Object.keys(data.choices?.[0]?.message || {})));

    // Try multiple possible response paths (OpenAI-compatible formats)
    const message = data.choices?.[0]?.message;
    const imageUrl =
      message?.images?.[0]?.image_url?.url ||
      message?.content?.[0]?.image_url?.url ||
      (typeof message?.content === 'string' && message.content.startsWith('data:image') ? message.content : null);

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "No image returned from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-exercise-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
