import type { ExtractedOnboardingFields } from "@/types/onboarding";

export interface TranscriptionProvider {
  transcribe(audio: Blob, language: string): Promise<string>;
}

export interface ExtractionProvider {
  extract(transcript: string, current: ExtractedOnboardingFields, language: string): Promise<ExtractedOnboardingFields>;
}

export interface SpeechProvider {
  synthesize(text: string, language: string): Promise<Blob | null>;
}

export class DemoTranscriptionProvider implements TranscriptionProvider {
  async transcribe(): Promise<string> {
    throw new Error("Demo mode cannot transcribe audio. Please type your answer.");
  }
}

export class DemoSpeechProvider implements SpeechProvider {
  async synthesize(): Promise<null> {
    return null;
  }
}
