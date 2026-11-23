import type { Language } from "@/components/LanguageContext";

export interface VoicePlaybackService {
  speak(text: string, language: Language): Promise<void>;
  stop(): void;
}

/** A future secure server adapter can provide ElevenLabs audio without placing an API key in the browser. */
export interface ElevenLabsGateway {
  generateSpeech(text: string, locale: string): Promise<Blob>;
}

const locales: Record<Language, string> = { EN: "en-IN", "हिन्दी": "hi-IN", "ಕನ್ನಡ": "kn-IN" };

export const browserSpeechVoiceService: VoicePlaybackService = {
  speak(text, language) {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) { reject(new Error("Speech is not available here.")); return; }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locales[language];
      const prefix = locales[language].slice(0, 2);
      const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith(prefix));
      if (voice) utterance.voice = voice;
      utterance.onend = () => resolve();
      utterance.onerror = (event) => event.error === "canceled" || event.error === "interrupted" ? resolve() : reject(new Error("Speech is not available here."));
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  },
  stop() { if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); },
};

export function createElevenLabsVoiceService(gateway: ElevenLabsGateway): VoicePlaybackService {
  let currentAudio: HTMLAudioElement | null = null;
  let currentUrl = "";
  return {
    async speak(text, language) {
      if (typeof window === "undefined") throw new Error("Voice playback is only available in a browser.");
      currentAudio?.pause();
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      const audio = await gateway.generateSpeech(text, locales[language]);
      currentUrl = URL.createObjectURL(audio);
      currentAudio = new Audio(currentUrl);
      await currentAudio.play();
    },
    stop() {
      currentAudio?.pause();
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      currentAudio = null;
      currentUrl = "";
    },
  };
}
