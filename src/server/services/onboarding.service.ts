import { randomUUID } from "node:crypto";
import { extractedOnboardingSchema } from "@/schemas/onboarding.schema";
import type { ExtractedOnboardingFields, OnboardingConversationState, OnboardingField } from "@/types/onboarding";
import type { ExtractionProvider, SpeechProvider, TranscriptionProvider } from "@/integrations/onboarding-providers";
import { DemoSpeechProvider, DemoTranscriptionProvider } from "@/integrations/onboarding-providers";
import { AwsTranscriptionProvider } from "@/integrations/aws/transcribe";
import { BedrockExtractionProvider } from "@/integrations/aws/bedrock";
import { ElevenLabsSpeechProvider } from "@/integrations/elevenlabs/speech";

const conversations = new Map<string, OnboardingConversationState>();
const fields: OnboardingField[] = ["fullName", "cityOrDistrict", "locality", "primaryTrade", "yearsOfExperience", "skills"];

export function getDemoMode() {
  return {
    transcription: !process.env.AWS_REGION,
    extraction: !process.env.AWS_BEDROCK_MODEL_ID,
    speech: !process.env.ELEVENLABS_API_KEY,
  };
}

function trimValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result.length >= 2 ? result : null;
}

export function demoExtract(transcript: string, current: ExtractedOnboardingFields): ExtractedOnboardingFields {
  const text = transcript.trim();
  const uncertainFields: OnboardingField[] = [];
  const lower = text.toLowerCase();

  let fullName = current.fullName;
  const correctionNameMatch = text.match(/(?:correct|change|update)\s+(?:my\s+)?name\s+(?:to|as|is)\s+([^,.]+)/i);
  const nameMatch = text.match(/(?:my name is|name is|मेरा नाम|नाम है|ನನ್ನ ಹೆಸರು)\s+([^,.]+)/i);
  if (correctionNameMatch?.[1]) fullName = trimValue(correctionNameMatch[1]);
  else if (nameMatch?.[1]) fullName = trimValue(nameMatch[1]);

  let cityOrDistrict = current.cityOrDistrict;
  const cityMatch = text.match(/([A-Za-z][A-Za-z'-]*)\s+(?:city|district)\b/i)
    ?? text.match(/(?:city|district|शहर|जिला|नगर|ಜಿಲ್ಲೆ)\s*(?:is|of|:)?\s*([^,.]+)/i);
  if (cityMatch?.[1]) {
    const candidate = trimValue(cityMatch[1].replace(/^(?:in|from|at)\s+/i, ""));
    if (candidate) cityOrDistrict = candidate;
  }

  let locality = current.locality;
  const localityMatch = text.match(/([A-Za-z][A-Za-z'-]*)\s+(?:locality|area)\b/i)
    ?? text.match(/(?:locality|area|इलाका|क्षेत्र|ಪ್ರದೇಶ|ಪ್ರದೇಶ)\s*(?:is|of|:)?\s*([^,.]+)/i);
  if (localityMatch?.[1]) {
    const candidate = trimValue(localityMatch[1].replace(/^(?:in|from|at)\s+/i, ""));
    if (candidate) locality = candidate;
  }

  let primaryTrade = current.primaryTrade;
  const trades = ["Electrician", "Plumber", "Mason", "Welder"] as const;
  const trade = trades.find((item) => lower.includes(item.toLowerCase()) || lower.includes({ Electrician: "bijli", Plumber: "plumber", Mason: "mason", Welder: "welder" }[item]?.toLowerCase() ?? ""));
  if (trade) primaryTrade = trade;

  let yearsOfExperience = current.yearsOfExperience;
  const yearsMatch = text.match(/(?:^|[^0-9])(\d+)\s*(?:years?|yrs?|साल|ವರ್ಷ)/i);
  if (yearsMatch?.[1]) {
    const value = Number(yearsMatch[1]);
    yearsOfExperience = Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
  }

  let skills = [...current.skills];
  const knownSkills = ["Wiring", "Switch Installation", "Circuit Troubleshooting", "House Wiring", "MCB Installation", "Electrical Maintenance", "Multimeter Usage", "Pipe Installation", "Leakage Repair", "Tap Installation", "PVC Pipefitting", "CPVC Jointing", "Leak Testing", "Brick Laying", "Plastering", "Concrete Work", "Floor Levelling", "Arc Welding", "MIG Welding", "Metal Fabrication", "Joint Preparation"];
  const detectedSkills = knownSkills.filter((skill) => lower.includes(skill.toLowerCase()));
  if (detectedSkills.length) skills = Array.from(new Set([...(lower.includes("replace") || lower.includes("correct") ? [] : skills), ...detectedSkills])).slice(0, 50);

  if (!fullName) uncertainFields.push("fullName");
  if (!cityOrDistrict) uncertainFields.push("cityOrDistrict");
  if (!locality) uncertainFields.push("locality");
  if (!primaryTrade) uncertainFields.push("primaryTrade");
  if (yearsOfExperience === null) uncertainFields.push("yearsOfExperience");
  if (!skills.length) uncertainFields.push("skills");

  return extractedOnboardingSchema.parse({ fullName, cityOrDistrict, locality, primaryTrade, yearsOfExperience, skills, uncertainFields });
}

export function isComplete(data: OnboardingConversationState["data"]): boolean {
  return Boolean(data.fullName && data.cityOrDistrict && data.locality && data.primaryTrade && data.yearsOfExperience !== null && data.skills.length);
}

function followUpLanguage(language: OnboardingConversationState["language"], missing: OnboardingField[]) {
  if (language === "हिन्दी") {
    if (missing.includes("cityOrDistrict") && missing.includes("locality")) return "कृपया अपना शहर या जिला और इलाका बताइए।";
    if (missing.includes("primaryTrade") && missing.includes("skills")) return "आप कौन सा मुख्य काम करते हैं और कौन-कौन से कौशल जानते हैं?";
    if (missing.includes("yearsOfExperience") && missing.includes("fullName")) return "अपना नाम बताइए और इस काम में कितने साल का अनुभव है?";
    const labels: Record<OnboardingField, string> = { fullName: "अपना पूरा नाम बताइए।", cityOrDistrict: "आप किस शहर या जिले में रहते हैं?", locality: "अपना इलाका बताइए।", primaryTrade: "आपका मुख्य काम कौन सा है?", yearsOfExperience: "आपको इस काम का कितने साल का अनुभव है?", skills: "आप कौन-कौन से कौशल जानते हैं?" };
    return missing.map((field) => labels[field]).join(" ");
  }
  if (language === "ಕನ್ನಡ") {
    if (missing.includes("cityOrDistrict") && missing.includes("locality")) return "ನಿಮ್ಮ ನಗರ ಅಥವಾ ಜಿಲ್ಲೆ ಮತ್ತು ಪ್ರದೇಶ ಹೇಳಿ.";
    if (missing.includes("primaryTrade") && missing.includes("skills")) return "ನಿಮ್ಮ ಮುಖ್ಯ ಕೆಲಸ ಯಾವುದು ಮತ್ತು ನೀವು ಯಾವ ಕೌಶಲ್ಯಗಳನ್ನು ತಿಳಿದಿದ್ದೀರಿ?";
    if (missing.includes("yearsOfExperience") && missing.includes("fullName")) return "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಮತ್ತು ಈ ಕೆಲಸದಲ್ಲಿ ಎಷ್ಟು ವರ್ಷದ ಅನುಭವ ಇದೆ ಹೇಳಿ.";
    const labels: Record<OnboardingField, string> = { fullName: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಹೇಳಿ.", cityOrDistrict: "ನೀವು ಯಾವ ನಗರ ಅಥವಾ ಜಿಲ್ಲೆಯಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಿ?", locality: "ನಿಮ್ಮ ಪ್ರದೇಶ ಹೇಳಿ.", primaryTrade: "ನಿಮ್ಮ ಮುಖ್ಯ ಕೆಲಸ ಯಾವುದು?", yearsOfExperience: "ಈ ಕೆಲಸದ ಎಷ್ಟು ವರ್ಷಗಳ ಅನುಭವವಿದೆ?", skills: "ನೀವು ಯಾವ ಕೌಶಲ್ಯಗಳನ್ನು ತಿಳಿದಿದ್ದೀರಿ?" };
    return missing.map((field) => labels[field]).join(" ");
  }
  if (missing.includes("cityOrDistrict") && missing.includes("locality")) return "Please tell me your city or district and your locality.";
  if (missing.includes("primaryTrade") && missing.includes("skills")) return "Please tell me your main trade and the skills you can do.";
  if (missing.includes("yearsOfExperience") && missing.includes("fullName")) return "Please tell me your full name and how many years of experience you have.";
  const labels: Record<OnboardingField, string> = { fullName: "Please tell me your full name.", cityOrDistrict: "Which city or district do you live in?", locality: "What is your locality or area?", primaryTrade: "What is your primary trade?", yearsOfExperience: "How many years of experience do you have? You can say zero.", skills: "Which skills can you do? Please list at least one." };
  return missing.map((field) => labels[field]).join(" ");
}

function summary(language: OnboardingConversationState["language"], data: OnboardingConversationState["data"]): string {
  const skills = data.skills.join(", ");
  if (language === "हिन्दी") return `आपकी जानकारी: नाम ${data.fullName}, शहर ${data.cityOrDistrict}, इलाका ${data.locality}, काम ${data.primaryTrade}, अनुभव ${data.yearsOfExperience} साल, कौशल ${skills}। क्या यह सही है?`;
  if (language === "ಕನ್ನಡ") return `ನಿಮ್ಮ ವಿವರ: ಹೆಸರು ${data.fullName}, ನಗರ ${data.cityOrDistrict}, ಪ್ರದೇಶ ${data.locality}, ಕೆಲಸ ${data.primaryTrade}, ಅನುಭವ ${data.yearsOfExperience} ವರ್ಷ, ಕೌಶಲ್ಯಗಳು ${skills}. ಇದು ಸರಿಯೇ?`;
  return `Your details: Name ${data.fullName}, city ${data.cityOrDistrict}, locality ${data.locality}, trade ${data.primaryTrade}, experience ${data.yearsOfExperience} years, skills ${skills}. Is this correct?`;
}

function providers() {
  const transcription: TranscriptionProvider = process.env.AWS_REGION && process.env.AWS_TRANSCRIBE_INPUT_S3_URI ? new AwsTranscriptionProvider() : new DemoTranscriptionProvider();
  const extraction: ExtractionProvider = process.env.AWS_BEDROCK_MODEL_ID ? new BedrockExtractionProvider() : { extract: async (_transcript, current) => demoExtract(_transcript, current) };
  const speech: SpeechProvider = process.env.ELEVENLABS_API_KEY ? new ElevenLabsSpeechProvider() : new DemoSpeechProvider();
  return { transcription, extraction, speech };
}

export function createConversation(language: OnboardingConversationState["language"]): OnboardingConversationState {
  const prompt = language === "हिन्दी" ? "अपने पूरे नाम, शहर या जिला, इलाका, मुख्य काम, अनुभव और कौशल के बारे में एक बार में बताइए।" : language === "ಕನ್ನಡ" ? "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು, ನಗರ ಅಥವಾ ಜಿಲ್ಲೆ, ಪ್ರದೇಶ, ಮುಖ್ಯ ಕೆಲಸ, ಅನುಭವ ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ಒಮ್ಮೆ ಹೇಳಿ." : "Please tell me your full name, city or district, locality, primary trade, years of experience, and skills.";
  const conversation: OnboardingConversationState = {
    conversationId: randomUUID(),
    language,
    status: "COLLECTING",
    data: { fullName: null, cityOrDistrict: null, locality: null, primaryTrade: null, yearsOfExperience: null, skills: [] },
    uncertainFields: fields,
    lastPrompt: prompt,
    transcript: "",
    updatedAt: new Date().toISOString(),
  };
  conversations.set(conversation.conversationId, conversation);
  return conversation;
}

export function getConversation(conversationId: string) {
  return conversations.get(conversationId) ?? null;
}

export async function processConversation(conversationId: string, transcript: string, audio?: Blob): Promise<OnboardingConversationState> {
  const conversation = conversations.get(conversationId);
  if (!conversation) throw new Error("Conversation not found. Please start again.");
  if (!transcript.trim() && !audio) throw new Error("No response was received. Please speak or type your answer.");

  let finalTranscript = transcript.trim();
  if (audio) {
    const provider = providers().transcription;
    finalTranscript = (await provider.transcribe(audio, conversation.language)).trim();
  }
  if (!finalTranscript) throw new Error("I could not understand the recording. Please try again or type your answer.");

  if (conversation.status === "AWAITING_CONFIRMATION" || conversation.status === "CONFIRMATION_REJECTED") {
    const rejection = /^(no|not|incorrect|wrong|reject|नहीं|गलत|ಬೇಡ|ತಪ್ಪು)/i.test(finalTranscript);
    if (rejection) {
      conversation.status = "CONFIRMATION_REJECTED";
      conversation.lastPrompt = conversation.language === "हिन्दी" ? "कृपया बताइए कौन-सी जानकारी बदलनी है।" : conversation.language === "ಕನ್ನಡ" ? "ಯಾವ ಮಾಹಿತಿಯನ್ನು ಬದಲಿಸಬೇಕು ಎಂದು ಹೇಳಿ." : "Please explain what information needs to be corrected.";
      conversation.transcript = finalTranscript;
      conversation.updatedAt = new Date().toISOString();
      return conversation;
    }
  }

  const current: ExtractedOnboardingFields = { ...conversation.data, uncertainFields: conversation.uncertainFields };
  const extracted = await providers().extraction.extract(finalTranscript, current, conversation.language);
  const uncertain = new Set(extracted.uncertainFields);

  if (!uncertain.has("fullName") && extracted.fullName) conversation.data.fullName = extracted.fullName;
  if (!uncertain.has("cityOrDistrict") && extracted.cityOrDistrict) conversation.data.cityOrDistrict = extracted.cityOrDistrict;
  if (!uncertain.has("locality") && extracted.locality) conversation.data.locality = extracted.locality;
  if (!uncertain.has("primaryTrade") && extracted.primaryTrade) conversation.data.primaryTrade = extracted.primaryTrade;
  if (!uncertain.has("yearsOfExperience") && extracted.yearsOfExperience !== null) conversation.data.yearsOfExperience = extracted.yearsOfExperience;
  if (!uncertain.has("skills") && extracted.skills.length) conversation.data.skills = extracted.skills;

  conversation.uncertainFields = fields.filter((field) => {
    if (field === "fullName") return !conversation.data.fullName;
    if (field === "cityOrDistrict") return !conversation.data.cityOrDistrict;
    if (field === "locality") return !conversation.data.locality;
    if (field === "primaryTrade") return !conversation.data.primaryTrade;
    if (field === "yearsOfExperience") return conversation.data.yearsOfExperience === null;
    return conversation.data.skills.length === 0;
  });

  conversation.transcript = finalTranscript;
  conversation.updatedAt = new Date().toISOString();

  if (isComplete(conversation.data)) {
    conversation.status = "AWAITING_CONFIRMATION";
    conversation.lastPrompt = summary(conversation.language, conversation.data);
  } else {
    conversation.status = "COLLECTING";
    conversation.lastPrompt = followUpLanguage(conversation.language, conversation.uncertainFields);
  }
  return conversation;
}

export async function synthesizePrompt(conversationId: string): Promise<Blob | null> {
  const conversation = conversations.get(conversationId);
  if (!conversation) throw new Error("Conversation not found.");
  return providers().speech.synthesize(conversation.lastPrompt, conversation.language);
}

export function rejectConfirmation(conversationId: string): OnboardingConversationState {
  const conversation = conversations.get(conversationId);
  if (!conversation) throw new Error("Conversation not found.");
  conversation.status = "CONFIRMATION_REJECTED";
  conversation.lastPrompt = conversation.language === "हिन्दी" ? "कृपया बताइए कौन-सी जानकारी बदलनी है।" : conversation.language === "ಕನ್ನಡ" ? "ಯಾವ ಮಾಹಿತಿಯನ್ನು ಬದಲಿಸಬೇಕು ಎಂದು ಹೇಳಿ." : "Please explain what information needs to be corrected.";
  conversation.updatedAt = new Date().toISOString();
  return conversation;
}

export function markSaved(conversationId: string): OnboardingConversationState {
  const conversation = conversations.get(conversationId);
  if (!conversation) throw new Error("Conversation not found.");
  if (conversation.status !== "AWAITING_CONFIRMATION") throw new Error("Please review and confirm the details before saving.");
  conversation.status = "SAVED";
  conversation.updatedAt = new Date().toISOString();
  return conversation;
}
