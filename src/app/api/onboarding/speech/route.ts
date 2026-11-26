import { synthesizePrompt, getConversation } from "@/server/services/onboarding.service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { conversationId?: string };
    if (!body.conversationId) return Response.json({ error: "Conversation ID is required." }, { status: 400 });
    if (!getConversation(body.conversationId)) return Response.json({ error: "Conversation not found." }, { status: 404 });

    const audio = await synthesizePrompt(body.conversationId);
    if (!audio) return Response.json({ demo: true, provider: "browser-speech" }, { status: 200 });
    return new Response(audio, { headers: { "Content-Type": audio.type || "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Speech playback failed." }, { status: 502 });
  }
}
