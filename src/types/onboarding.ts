import type { Language } from "@/components/LanguageContext";

export type OnboardingField = "fullName" | "cityOrDistrict" | "locality" | "primaryTrade" | "yearsOfExperience" | "skills";

export type OnboardingStatus = "COLLECTING" | "AWAITING_CONFIRMATION" | "CONFIRMATION_REJECTED" | "SAVED" | "FAILED";

export interface OnboardingData {
  fullName: string | null;
  cityOrDistrict: string | null;
  locality: string | null;
  primaryTrade: string | null;
  yearsOfExperience: number | null;
  skills: string[];
}

export interface UncertainOnboardingField {
  field: OnboardingField;
  reason: string;
}

export interface OnboardingConversationState {
  conversationId: string;
  language: Language;
  status: OnboardingStatus;
  data: OnboardingData;
  uncertainFields: OnboardingField[];
  lastPrompt: string;
  transcript: string;
  updatedAt: string;
}

export interface ExtractedOnboardingFields {
  fullName: string | null;
  cityOrDistrict: string | null;
  locality: string | null;
  primaryTrade: string | null;
  yearsOfExperience: number | null;
  skills: string[];
  uncertainFields: OnboardingField[];
}
