"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Volume2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { profileText } from "@/data/profileTranslations";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

export function ListenButton({ text = "Welcome to Pramaan. What would you like to do today?", language: languageOverride, className = "listen-button", children = "Listen", showMessage = false }: { text?: string; language?: "EN" | "हिन्दी" | "ಕನ್ನಡ"; className?: string; children?: ReactNode; showMessage?: boolean }) {
  const { language: appLanguage } = useLanguage();
  const language = languageOverride ?? appLanguage;
  const { speak, speaking, message } = useSpeechSynthesis(language);
  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [text, language]);
  return <>
    <button type="button" className={className} onClick={() => speak(text)} aria-label={`${profileText("Listen to question", language)}${speaking ? "…" : ""}`}>
      <Volume2 size={21} aria-hidden="true"/>{children}
    </button>
    {showMessage && message && <span className="voice-api-message" role="status">{profileText(message, language)}</span>}
  </>;
}
