"use client";

import Link from "next/link";
import { ArrowLeft, Check, Mic, RotateCcw, Send, Square, Volume2, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { browserSpeechVoiceService } from "@/services/voiceService";
import type { OnboardingConversationState, OnboardingData } from "@/types/onboarding";
import styles from "./ConversationalOnboarding.module.css";

const emptyData: OnboardingData = { fullName: null, cityOrDistrict: null, locality: null, primaryTrade: null, yearsOfExperience: null, skills: [] };

export function ConversationalOnboarding() {
  const { language } = useLanguage();
  const recorder = useAudioRecorder();
  const [conversation, setConversation] = useState<OnboardingConversationState | null>(null);
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const sentBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    void fetch("/api/onboarding/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", language }),
    }).then(async (response) => {
      const body = await response.json() as { conversation?: OnboardingConversationState; demo?: boolean; error?: string };
      if (!response.ok) throw new Error(body.error || "Could not start onboarding.");
      if (body.conversation) setConversation(body.conversation);
      setDemoMode(Boolean(body.demo));
    }).catch((issue: unknown) => setError(issue instanceof Error ? issue.message : "Could not start onboarding."));
  }, [language]);

  useEffect(() => {
    if (conversation) localStorage.setItem("pramaan.onboarding.v1", JSON.stringify(conversation));
  }, [conversation]);

  // The recorder effect intentionally processes only newly completed blobs.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!conversation || !recorder.audioBlob || recorder.recording || sentBlobRef.current === recorder.audioBlob) return;
    sentBlobRef.current = recorder.audioBlob;
    void processResponse(recorder.audioBlob);
  }, [conversation, recorder.audioBlob, recorder.recording]);
  /* eslint-enable react-hooks/exhaustive-deps */

  async function speak(prompt: string) {
    setSpeaking(true);
    try {
      const response = await fetch("/api/onboarding/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversation?.conversationId }),
      });
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("audio/")) {
        const url = URL.createObjectURL(await response.blob());
        const audio = new Audio(url);
        await audio.play();
        audio.onended = () => { URL.revokeObjectURL(url); setSpeaking(false); };
        audio.onerror = () => { URL.revokeObjectURL(url); setSpeaking(false); setError("ElevenLabs playback failed. The written prompt is still available."); };
      } else {
        await browserSpeechVoiceService.speak(prompt, language);
      }
    } catch {
      setError("Voice playback failed. You can continue using the text button.");
    } finally {
      setSpeaking(false);
    }
  }

  async function processResponse(audio?: Blob, manualText?: string) {
    if (!conversation) return;
    const answer = manualText?.trim() ?? "";
    if (!answer && !audio) return;
    setProcessing(true);
    setError("");
    try {
      const form = new FormData();
      form.set("action", "process");
      form.set("conversationId", conversation.conversationId);
      form.set("text", answer);
      if (audio) form.set("audio", audio, "onboarding.webm");
      const response = await fetch("/api/onboarding/conversation", { method: "POST", body: form });
      const body = await response.json() as { conversation?: OnboardingConversationState; error?: string };
      if (!response.ok) throw new Error(body.error || "Could not process the answer.");
      if (body.conversation) {
        setConversation(body.conversation);
        setText("");
        await speak(body.conversation.lastPrompt);
      }
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Network interruption. Your answer has not been lost.");
    } finally {
      setProcessing(false);
    }
  }

  async function confirm() {
    if (!conversation) return;
    setProcessing(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", conversationId: conversation.conversationId }),
      });
      const body = await response.json() as { conversation?: OnboardingConversationState; error?: string };
      if (!response.ok) throw new Error(body.error || "Profile could not be saved.");
      if (body.conversation) setConversation(body.conversation);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Network interruption. The profile was not saved.");
    } finally {
      setProcessing(false);
    }
  }

  async function reject() {
    if (!conversation) return;
    setProcessing(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", conversationId: conversation.conversationId }),
      });
      const body = await response.json() as { conversation?: OnboardingConversationState; error?: string };
      if (!response.ok) throw new Error(body.error || "Could not continue the correction.");
      if (body.conversation) {
        setConversation(body.conversation);
        await speak(body.conversation.lastPrompt);
      }
    } finally {
      setProcessing(false);
    }
  }

  function restart() {
    setConversation(null);
    setError("");
    void fetch("/api/onboarding/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", language }),
    }).then(async (response) => {
      const body = await response.json() as { conversation?: OnboardingConversationState; demo?: boolean; error?: string };
      if (!response.ok) throw new Error(body.error || "Could not restart onboarding.");
      if (body.conversation) setConversation(body.conversation);
      setDemoMode(Boolean(body.demo));
    }).catch((issue: unknown) => setError(issue instanceof Error ? issue.message : "Could not restart onboarding."));
  }

  const data = conversation?.data ?? emptyData;
  const completedCount = [data.fullName, data.cityOrDistrict, data.locality, data.primaryTrade, data.yearsOfExperience !== null, data.skills.length > 0].filter(Boolean).length;
  const isSaved = conversation?.status === "SAVED";
  const isConfirmation = conversation?.status === "AWAITING_CONFIRMATION";
  const isRejecting = conversation?.status === "CONFIRMATION_REJECTED";

  return (
    <main className={styles.shell}>
      <div className={styles.top}>
        <Link className={styles.back} href="/dashboard"><ArrowLeft size={18}/> Back</Link>
        <span className={styles.mode}>{language === "हिन्दी" ? "हिन्दी" : language === "ಕನ್ನಡ" ? "ಕನ್ನಡ" : "English"}</span>
      </div>
      <section className={styles.card}>
        <header className={styles.progress}>
          <div className={styles.progressRow}><span>{isSaved ? "Saved" : isConfirmation ? "Confirm details" : "Add profile"}</span><strong>{completedCount} of 6</strong></div>
          <div className={styles.track}><i style={{ width: `${(completedCount / 6) * 100}%` }}/></div>
        </header>
        <div className={styles.body}>
          {isSaved ? (
            <div className={styles.saved}>
              <span className={styles.savedIcon}><Check size={34}/></span>
              <h2>{language === "हिन्दी" ? "प्रोफ़ाइल सेव हुई" : language === "ಕನ್ನಡ" ? "ಪ್ರೊಫೈಲ್ ಉಳಿಸಲಾಗಿದೆ" : "Profile saved"}</h2>
              <p>{language === "हिन्दी" ? "आपकी जानकारी सुरक्षित रूप से सेव हो गई।" : language === "ಕನ್ನಡ" ? "ನಿಮ್ಮ ಮಾಹಿತಿ ಉಳಿಸಲಾಗಿದೆ." : "Your confirmed information has been saved."}</p>
              <Link className={styles.dashboardButton} href="/dashboard">Continue</Link>
            </div>
          ) : (
            <>
              <span className={`${styles.statusIcon} ${recorder.recording ? styles.listening : speaking ? styles.speaking : ""}`}>
                {processing ? <LoaderCircle size={28}/> : recorder.recording ? <Mic size={28}/> : speaking ? <Volume2 size={28}/> : <Volume2 size={28}/>} 
              </span>
              <p className={styles.prompt}>{conversation?.lastPrompt || (language === "हिन्दी" ? "तैयार हो रहे हैं…" : language === "ಕನ್ನಡ" ? "ಸಿದ್ಧವಾಗಿದೆ…" : "Getting ready…")}</p>
              <p className={styles.helper}>{recorder.recording ? (language === "हिन्दी" ? "सुन रहे हैं…" : language === "ಕನ್ನಡ" ? "ಕೇಳುತ್ತಿದ್ದೇವೆ…" : "Listening…") : processing ? (language === "हिन्दी" ? "जानकारी समझ रहे हैं…" : language === "ಕನ್ನಡ" ? "ಮಾಹಿತಿ ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇವೆ…" : "Understanding your answer…") : isRejecting ? (language === "हिन्दी" ? "बदलाव बताइए" : language === "ಕನ್ನಡ" ? "ಬದಲಾವಣೆ ಹೇಳಿ" : "Tell me the correction") : ""}</p>
              {isConfirmation && (
                <div className={styles.summary}>
                  <div className={styles.summaryItem}><span>Name</span><strong>{data.fullName}</strong></div>
                  <div className={styles.summaryItem}><span>City</span><strong>{data.cityOrDistrict}</strong></div>
                  <div className={styles.summaryItem}><span>Locality</span><strong>{data.locality}</strong></div>
                  <div className={styles.summaryItem}><span>Trade</span><strong>{data.primaryTrade}</strong></div>
                  <div className={styles.summaryItem}><span>Experience</span><strong>{data.yearsOfExperience}</strong></div>
                  <div className={styles.summaryItem}><span>Skills</span><strong>{data.skills.join(", ")}</strong></div>
                </div>
              )}
              {demoMode && <div className={styles.demo}>{language === "हिन्दी" ? "डेमो मोड: असली AWS या ElevenLabs कनेक्शन नहीं है।" : language === "ಕನ್ನಡ" ? "ಡೆಮೊ ಮೋಡ್: AWS ಅಥವಾ ElevenLabs ಸಂಪರ್ಕ ಇಲ್ಲ." : "Demo mode: Real AWS transcription and ElevenLabs playback are not configured."}</div>}
              {error && <div className={styles.alert}>{error}</div>}
              {isConfirmation ? (
                <div className={styles.controls}>
                  <button className={styles.rejectButton} type="button" onClick={() => void reject()} disabled={processing}><RotateCcw size={18}/> {language === "हिन्दी" ? "बदलाव" : language === "ಕನ್ನಡ" ? "ಬದಲಾಯಿಸಿ" : "Correct"}</button>
                  <button className={styles.confirmButton} type="button" onClick={() => void confirm()} disabled={processing}><Check size={18}/> {language === "हिन्दी" ? "हाँ, सही है" : language === "ಕನ್ನಡ" ? "ಹೌದು, ಸರಿಯಿದೆ" : "Yes, save"}</button>
                </div>
              ) : (
                <>
                  <div className={styles.controls}>
                    <button type="button" className={`${styles.recordButton} ${recorder.recording ? styles.stop : ""}`} onClick={() => recorder.recording ? recorder.stop() : void recorder.start()} aria-label={recorder.recording ? "Stop recording" : "Start recording"} disabled={processing}>
                      {recorder.recording ? <Square size={22}/> : <Mic size={26}/>} 
                    </button>
                    <button type="button" className={styles.actionButton} onClick={() => conversation && void speak(conversation.lastPrompt)} disabled={processing || speaking}><Volume2 size={18}/> {language === "हिन्दी" ? "सुनें" : language === "ಕನ್ನಡ" ? "ಕೇಳಿ" : "Listen"}</button>
                  </div>
                  {recorder.message && <div className={styles.alert}>{recorder.message}</div>}
                  <div className={styles.inputRow}>
                    <textarea className={styles.textInput} value={text} onChange={(event) => setText(event.target.value)} placeholder={language === "हिन्दी" ? "यहाँ अपना जवाब लिखें" : language === "ಕನ್ನಡ" ? "ಇಲ್ಲಿ ನಿಮ್ಮ ಉತ್ತರ ಟೈಪ್ ಮಾಡಿ" : "Type your answer here"} rows={2}/>
                    <button type="button" className={styles.sendButton} onClick={() => void processResponse(undefined, text)} disabled={processing || !text.trim()} aria-label="Send answer"><Send size={19}/></button>
                  </div>
                </>
              )}
              <button type="button" className={styles.actionButton} onClick={restart} disabled={processing}><RotateCcw size={16}/> {language === "हिन्दी" ? "फिर शुरू करें" : language === "ಕನ್ನಡ" ? "ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ" : "Start over"}</button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
