import type { Language } from "@/components/LanguageContext";

export interface ProfileDraft {
  fullName: string;
  city: string;
  locality: string;
  preferredLanguage: Language;
  photoDataUrl: string;
  trade: string;
  specificWork: string;
  yearsExperience: string;
  experiencedWork: string;
  skills: string[];
  introduction: string;
  currentQuestion: number;
  completed: boolean;
  updatedAt: string;
}

export const emptyProfile: ProfileDraft = {
  fullName: "",
  city: "",
  locality: "",
  preferredLanguage: "EN",
  photoDataUrl: "",
  trade: "",
  specificWork: "",
  yearsExperience: "",
  experiencedWork: "",
  skills: [],
  introduction: "",
  currentQuestion: 0,
  completed: false,
  updatedAt: "",
};
