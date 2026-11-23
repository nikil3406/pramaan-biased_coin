"use client";
import { Volume2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
export function ListenButton({ text = "Welcome to Pramaan. What would you like to do today?", className = "listen-button", children = "Listen" }: { text?: string; className?: string; children?: React.ReactNode }) {
  const { language } = useLanguage();
  return <button className={className} onClick={() => { if ("speechSynthesis" in window) { const speech = new SpeechSynthesisUtterance(text); speech.lang = language === "हिन्दी" ? "hi-IN" : language === "ಕನ್ನಡ" ? "kn-IN" : "en-IN"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(speech); } }}><Volume2 size={21}/>{children}</button>;
}
