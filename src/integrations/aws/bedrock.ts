import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { extractedOnboardingSchema } from "@/schemas/onboarding.schema";
import type { ExtractedOnboardingFields } from "@/types/onboarding";
import type { ExtractionProvider } from "@/integrations/onboarding-providers";

export class BedrockExtractionProvider implements ExtractionProvider {
  async extract(transcript: string, current: ExtractedOnboardingFields, language: string): Promise<ExtractedOnboardingFields> {
    const modelId = process.env.AWS_BEDROCK_MODEL_ID;
    if (!modelId) throw new Error("Amazon Bedrock is not configured.");

    const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
    const prompt = `You extract worker onboarding fields from natural speech. Selected UI language: ${language}.\nPreserve existing values unless the worker clearly corrects them. Never invent values.\nExisting JSON: ${JSON.stringify(current)}\nTranscript: ${JSON.stringify(transcript)}\nReturn only JSON with keys fullName, cityOrDistrict, locality, primaryTrade, yearsOfExperience, skills, uncertainFields. uncertainFields is a subset of fullName, cityOrDistrict, locality, primaryTrade, yearsOfExperience, skills. Use null and [] for unavailable values. Primary trade must be one of Electrician, Plumber, Mason, Welder when clear; otherwise null.`;

    const response = await client.send(new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      })),
    }));

    const payload = JSON.parse(new TextDecoder().decode(response.body)) as { content?: Array<{ text?: string }> };
    const text = payload.content?.map((item) => item.text ?? "").join(" ").trim() ?? "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd < jsonStart) throw new Error("Bedrock did not return structured JSON.");
    return extractedOnboardingSchema.parse(JSON.parse(text.slice(jsonStart, jsonEnd + 1)));
  }
}
