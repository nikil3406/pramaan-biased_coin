"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Language } from "@/components/LanguageContext";

type SpeechAlternative = { transcript: string; confidence: number };
type SpeechResult = { 0: SpeechAlternative; isFinal: boolean; length: number };
type SpeechResultEvent = { results: ArrayLike<SpeechResult> };
type SpeechErrorEvent = { error: string };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionConstructor = new () => Recognition;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

const locale: Record<Language, string> = { EN: "en-IN", "हिन्दी": "hi-IN", "ಕನ್ನಡ": "kn-IN" };

function subscribeToBrowserSupport() { return () => undefined; }
function getBrowserSupport() { return typeof window !== "undefined" && Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition); }
function getServerSupport() { return false; }

export function useSpeechRecognition(language: Language, onTranscript: (text: string, confidence: number) => void) {
  const supported = useSyncExternalStore(subscribeToBrowserSupport, getBrowserSupport, getServerSupport);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);
  const transcriptRef = useRef(onTranscript);

  useEffect(() => { transcriptRef.current = onTranscript; }, [onTranscript]);

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) {
      setMessage("No voice typing on this device. Type your answer below.");
      return;
    }
    setMessage("");
    const recognition = new Constructor();
    recognition.lang = locale[language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const alternative = result?.[0];
      if (alternative?.transcript.trim()) transcriptRef.current(alternative.transcript.trim(), alternative.confidence);
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed" || event.error === "audio-capture") setMessage("Microphone access is blocked. Allow it in your browser settings.");
      else if (event.error === "no-speech") setMessage("I couldn't hear that. Try again or type your answer.");
      else setMessage("Voice typing had a problem. Try again or type your answer.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      setMessage("Voice typing had a problem. Try again or type your answer.");
    }
  }, [language]);

  return { supported, listening, message, start, stop };
}
