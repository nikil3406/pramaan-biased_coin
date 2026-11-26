"use client";

import type { Language } from "@/components/LanguageContext";
import { profileText } from "@/data/profileTranslations";
import styles from "./VoiceLanguageSelector.module.css";

const languages: { value: Language; label: string }[] = [
  { value: "EN", label: "English" },
  { value: "हिन्दी", label: "हिन्दी" },
  { value: "ಕನ್ನಡ", label: "ಕನ್ನಡ" },
];

export function VoiceLanguageSelector({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return <fieldset className={styles.selector}>
    <legend>{profileText("Choose a language", language)}</legend>
    <div>{languages.map((item)=><button type="button" key={item.value} aria-pressed={language===item.value} className={language===item.value?styles.active:styles.option} onClick={()=>onChange(item.value)}><span>{item.label}</span>{language===item.value&&<span className={styles.selectedMark}>✓</span>}</button>)}</div>
  </fieldset>;
}
