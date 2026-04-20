// Admin one-time seeding function.
// Generates an image for each exercise that doesn't already have one,
// uploads to the exercise-images storage bucket, and writes the public
// URL back to public.exercises. Requires an authenticated user.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "exercise-images";

function buildPrompt(exerciseName: string) {
  return `Minimal fitness exercise illustration, black background, clean white/light-blue figure, showing ${exerciseName}, simple gym equipment, high contrast, square composition, app icon style, no text, no watermark.`;
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } {
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) throw new Error("Invalid data URL");
  const contentType = match[1];
  const b64 = match[2];
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, contentType };
}

async function generateOne(exerciseName: string, apiKey: string, model: string): Promise<string> {
  const prompt = buildPrompt(exerciseName);
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const message = data.choices?.[0]?.message;
  const url =
    message?.images?.[0]?.image_url?.url ||
    message?.content?.[0]?.image_url?.url ||
    (typeof message?.content === "string" && message.content.startsWith("data:image") ? message.content : null);
  if (!url) throw new Error("No image returned");
  return url;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const AI_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!AI_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode: "missing" | "all" | "single" = body.mode ?? "missing";
    const targetId: string | undefined = body.exerciseId;
    const model = body.model || "google/gemini-2.5-flash-image";

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Fetch target rows
    let query = admin.from("exercises").select("id, exercise_name, image_url");
    if (mode === "single" && targetId) query = query.eq("id", targetId);
    else if (mode === "missing") query = query.or("image_url.is.null,image_status.eq.failed");
    const { data: rows, error: rowsErr } = await query;
    if (rowsErr) throw rowsErr;

    const results: Array<{ id: string; ok: boolean; url?: string; error?: string }> = [];

    for (const row of rows ?? []) {
      try {
        await admin.from("exercises").update({ image_status: "generating" }).eq("id", row.id);
        const dataUrl = await generateOne(row.exercise_name, AI_API_KEY, model);
        const { bytes, contentType } = dataUrlToBytes(dataUrl);
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        const path = `${row.id}.${ext}`;
        const { error: upErr } = await admin.storage
          .from(BUCKET)
          .upload(path, bytes, { contentType, upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
        const publicUrl = `${pub.publicUrl}?v=${Date.now()}`;
        await admin
          .from("exercises")
          .update({
            image_url: publicUrl,
            image_status: "ready",
            image_prompt: buildPrompt(row.exercise_name),
            image_last_generated_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        results.push({ id: row.id, ok: true, url: publicUrl });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await admin.from("exercises").update({ image_status: "failed" }).eq("id", row.id);
        results.push({ id: row.id, ok: false, error: msg });
      }
      // small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 400));
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-exercise-images error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});