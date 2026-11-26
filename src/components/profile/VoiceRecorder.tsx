"use client";

import { useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import type { Language } from "@/components/LanguageContext";
import { profileText } from "@/data/profileTranslations";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { VoiceAnswerPreview } from "@/components/profile/VoiceAnswerPreview";
import styles from "./VoiceRecorder.module.css";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function VoiceRecorder({ language, value, onChange }: { language: Language; value: string; onChange: (value: string) => void }) {
  const recorder = useAudioRecorder();
  const [heard, setHeard] = useState(false);
  const recognition = useSpeechRecognition(language, (transcript) => { onChange(transcript); setHeard(true); });
  const capturing = recorder.recording || recognition.listening;

  async function toggleCapture() {
    if (capturing) {
      recorder.stop();
      recognition.stop();
      return;
    }
    const audioStarted = await recorder.start();
    if (recognition.supported) recognition.start();
    if (!audioStarted && !recognition.supported) return;
  }

  async function deleteRecording() {
    recognition.stop();
    await recorder.remove();
  }

  return <section className={styles.recorder} aria-label={profileText("Recording introduction…", language)}>
    <div className={`${styles.micOrb} ${capturing?styles.active:""}`}><Mic size={31}/></div>
    <strong className={styles.state}>{capturing?profileText("Recording introduction…",language):recorder.saved?profileText("Recording saved on this device.",language):profileText("Speak your answer",language)}</strong>
    <div className={styles.duration}><span className={capturing?styles.live:styles.dot}/>{profileText("Recording time",language)} <b>{formatTime(recorder.duration)}</b></div>
    <button type="button" className={capturing?styles.stop:styles.start} onClick={()=>void toggleCapture()} aria-label={profileText(capturing?"Stop recording":"Speak your answer",language)}>
      {capturing?<Square size={19} fill="currentColor"/>:<Mic size={20}/>} {profileText(capturing?"Stop recording":"Speak your answer",language)}
    </button>
    {!recognition.supported&&<p className={styles.note}>{profileText("No voice typing on this device. Type your answer below.",language)}</p>}
    {recognition.message&&<p className={styles.error} role="alert">{profileText(recognition.message,language)}</p>}
    {recorder.message&&<p className={styles.error} role="alert">{profileText(recorder.message,language)}</p>}
    {heard&&<VoiceAnswerPreview label={profileText("I heard:",language)} value={value} onEdit={()=>document.getElementById("profile-answer-10")?.focus()}/>}
    <div className={styles.manualField}><label htmlFor="profile-answer-10">{profileText("Your answer",language)}</label><textarea id="profile-answer-10" value={value} onChange={(event)=>{onChange(event.target.value);setHeard(false);}} placeholder={profileText("Tell us about your work",language)} rows={4}/></div>
    {recorder.audioUrl&&<div className={styles.playback}><audio controls src={recorder.audioUrl} aria-label={profileText("Play your recording",language)}/><button type="button" className={styles.delete} onClick={()=>void deleteRecording()}><Trash2 size={16}/>{profileText("Delete and record again",language)}</button></div>}
    {recorder.saving&&<p className={styles.success} role="status">{profileText("Saving recording…",language)}</p>}
    {recorder.saved&&!recorder.saving&&<p className={styles.success} role="status">{profileText("Recording saved on this device.",language)}</p>}
  </section>;
}
