"use client";

import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import type { Language } from "@/components/LanguageContext";
import { profileText } from "@/data/profileTranslations";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { VoiceAnswerPreview } from "@/components/profile/VoiceAnswerPreview";
import styles from "./SpeechToText.module.css";

export function SpeechToText({ language, value, onChange, onRecognized, placeholder, label, multiline = false, inputId }: { language: Language; value: string; onChange: (value: string) => void; onRecognized?: (value: string, confidence: number) => void; placeholder: string; label: string; multiline?: boolean; inputId: string }) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [heard, setHeard] = useState(false);
  const recognition = useSpeechRecognition(language, (transcript, confidence) => {
    onChange(transcript);
    onRecognized?.(transcript, confidence);
    setHeard(true);
  });
  return <div className={styles.wrapper}>
    <div className={styles.voiceActions}>
      <button type="button" className={`${styles.micButton} ${recognition.listening ? styles.listening : ""}`} disabled={!recognition.supported && !recognition.message} onClick={() => recognition.listening ? recognition.stop() : recognition.start()} aria-label={profileText(recognition.listening ? "Stop recording" : "Speak your answer", language)}>
        {recognition.listening ? <Square size={24} fill="currentColor"/> : <Mic size={29}/>}
      </button>
      <div className={styles.voiceCopy}><strong>{profileText(recognition.listening ? "Listening…" : "Speak your answer", language)}</strong><small>{profileText(recognition.listening ? "Tap the mic again to stop." : "Say your answer or type below.", language)}</small></div>
      {recognition.listening && <span className={styles.liveDot} aria-label={profileText("Listening…", language)}/>}
    </div>
    {!recognition.supported && <p className={styles.supportNote}>{profileText("No voice typing on this device. Type your answer below.", language)}</p>}
    {recognition.message && <p className={styles.error} role="alert">{profileText(recognition.message, language)}</p>}
    {heard && <VoiceAnswerPreview label={profileText("I heard:", language)} value={value} onEdit={() => inputRef.current?.focus()}/>}
    <div className={styles.manualField}>
      <label htmlFor={inputId}>{profileText(label, language)}</label>
      {multiline ? <textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} id={inputId} value={value} onChange={(event)=>{onChange(event.target.value);setHeard(false);}} placeholder={profileText(placeholder,language)} rows={4}/> : <input ref={inputRef as React.RefObject<HTMLInputElement>} id={inputId} value={value} onChange={(event)=>{onChange(event.target.value);setHeard(false);}} placeholder={profileText(placeholder,language)}/>}
    </div>
  </div>;
}
