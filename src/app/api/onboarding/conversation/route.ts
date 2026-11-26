import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmedOnboardingSchema } from "@/schemas/onboarding.schema";
import { createConversation, getConversation, markSaved, processConversation, rejectConfirmation } from "@/server/services/onboarding.service";
import { upsertWorkerProfile, ProfileSelectionError } from "@/server/services/profile.service";
import { getServerEnv } from "@/lib/env";

const startSchema = z.object({ action: z.literal("start"), language: z.enum(["EN", "हिन्दी", "ಕನ್ನಡ"]), conversationId: z.string().optional() });

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    let body: Record<string, unknown>;
    let audio: Blob | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      body = {
        action: form.get("action") ?? "process",
        conversationId: form.get("conversationId") ?? "",
        text: form.get("text") ?? "",
      };
      const file = form.get("audio");
      if (file instanceof Blob) audio = file;
    } else {
      body = await request.json() as Record<string, unknown>;
    }

    if (body.action === "start") {
      const parsed = startSchema.parse(body);
      const conversation = createConversation(parsed.language);
      return NextResponse.json({ conversation, demo: process.env.AWS_REGION ? false : true });
    }

    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const conversation = getConversation(conversationId);
    if (!conversation) return NextResponse.json({ error: "Conversation not found. Please start again." }, { status: 404 });

    if (body.action === "reject") {
      return NextResponse.json({ conversation: rejectConfirmation(conversationId) });
    }

    if (body.action === "confirm") {
      if (conversation.status !== "AWAITING_CONFIRMATION") {
        return NextResponse.json({ error: "Please review and confirm the details before saving." }, { status: 409 });
      }

      const parsed = confirmedOnboardingSchema.safeParse(conversation.data);
      if (!parsed.success) {
        return NextResponse.json({ error: "The profile information is incomplete or invalid." }, { status: 400 });
      }

      const phone = getServerEnv().PRAMAAN_DEV_PHONE ?? "dev-local-worker";
      await upsertWorkerProfile(phone, {
        fullName: parsed.data.fullName,
        city: parsed.data.cityOrDistrict,
        locality: parsed.data.locality,
        preferredLanguage: conversation.language,
        tradeName: parsed.data.primaryTrade,
        specificWork: parsed.data.primaryTrade,
        yearsExperience: parsed.data.yearsOfExperience,
        introduction: "",
        skillNames: parsed.data.skills,
        profileCompleted: true,
      });

      return NextResponse.json({ conversation: markSaved(conversationId), saved: true });
    }

    const text = typeof body.text === "string" ? body.text : "";
    const updated = await processConversation(conversationId, text, audio);
    return NextResponse.json({ conversation: updated, saved: false });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid onboarding request." }, { status: 400 });
    if (error instanceof ProfileSelectionError) return NextResponse.json({ error: "The selected trade or skills could not be found." }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Onboarding could not be processed." }, { status: 502 });
  }
}
