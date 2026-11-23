"use client";

import type { ReactNode } from "react";
import type { Language } from "@/components/LanguageContext";
import { profileText } from "@/data/profileTranslations";
import { ListenButton } from "@/components/ListenButton";
import { SpeechToText } from "@/components/profile/SpeechToText";
import styles from "./VoiceQuestion.module.css";

export function VoiceQuestion({ question, language, value, onChange, onRecognized, placeholder, children, multiline = false, inputId, speechInput = true }: { question: string; language: Language; value: string; onChange: (value: string) => void; onRecognized?: (value: string, confidence: number) => void; placeholder: string; children?: ReactNode; multiline?: boolean; inputId: string; speechInput?: boolean }) {
  return <section className={styles.question} aria-labelledby={`${inputId}-question`}>
    <div className={styles.questionTitle}><h2 id={`${inputId}-question`}>{question}</h2><p>{profileText("Say your answer or type below.", language)}</p></div>
    <div className={styles.questionActions}>
      <ListenButton language={language} text={question} className={styles.listenButton} showMessage><span>{profileText("Listen to question", language)}</span></ListenButton>
    </div>
    {speechInput&&<SpeechToText language={language} value={value} onChange={onChange} onRecognized={onRecognized} placeholder={placeholder} label="Your answer" multiline={multiline} inputId={inputId}/>}
    {children && <div className={styles.choices}>{children}</div>}
  </section>;
}
