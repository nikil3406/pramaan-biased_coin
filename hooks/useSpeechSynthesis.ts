"use client";

import { useCallback, useEffect, useState } from "react";
import type { Language } from "@/components/LanguageContext";
import { browserSpeechVoiceService, type VoicePlaybackService } from "@/services/voiceService";

export function useSpeechSynthesis(language: Language, service: VoicePlaybackService = browserSpeechVoiceService) {
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => service.stop(), [language, service]);

  const speak = useCallback((text: string) => {
    setMessage("");
    setSpeaking(true);
    void service.speak(text, language).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Speech is not available here.")).finally(() => setSpeaking(false));
  }, [language, service]);

  const stop = useCallback(() => {
    service.stop();
    setSpeaking(false);
  }, [service]);

  return { speak, stop, speaking, message };
}
