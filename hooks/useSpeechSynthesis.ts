"use client";

import { useCallback, useEffect, useState } from "react";
import type { Language } from "@/components/LanguageContext";

const locale: Record<Language, string> = { EN: "en-IN", "हिन्दी": "hi-IN", "ಕನ್ನಡ": "kn-IN" };

export function useSpeechSynthesis(language: Language) {
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [language]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setMessage("Speech is not available here.");
      return;
    }
    const synthesizer = window.speechSynthesis;
    const voices = synthesizer.getVoices();
    const languagePrefix = locale[language].slice(0, 2).toLowerCase();
    const voice = voices.find((item) => item.lang.toLowerCase().startsWith(languagePrefix));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale[language];
    if (voice) utterance.voice = voice;
    setMessage(voice ? "" : language === "EN" ? "No English voice is available on this device. We'll try its default voice." : language === "हिन्दी" ? "No Hindi voice is available on this device. We'll try its default voice." : "No Kannada voice is available on this device. We'll try its default voice.");
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => {
      setSpeaking(false);
      if (event.error !== "canceled" && event.error !== "interrupted") setMessage("Speech is not available here.");
    };
    synthesizer.cancel();
    synthesizer.speak(utterance);
  }, [language]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, message };
}
