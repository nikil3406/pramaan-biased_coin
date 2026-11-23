"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Hammer, MapPin, Mic, Square, UserRound, Waves, Wrench, Zap } from "lucide-react";
import { copy, useLanguage } from "@/components/LanguageContext";

const trades = [
  { name: "Electrician", icon: Zap, color: "electrician" },
  { name: "Plumber", icon: Waves, color: "plumber" },
  { name: "Mason", icon: Hammer, color: "mason" },
  { name: "Welder", icon: Wrench, color: "welder" },
];

export function ProfileFlow() {
  const { language } = useLanguage();
  const t = (text: string) => copy(text, language);
  const [step, setStep] = useState(0);
  const [trade, setTrade] = useState("");
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [done, setDone] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function toggleRecording() {
    if (recording && mediaRecorder.current) { mediaRecorder.current.stop(); setRecording(false); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setMicError(true); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunks.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      recorder.onstop = () => { setAudioUrl(URL.createObjectURL(new Blob(chunks.current, { type: "audio/webm" }))); stream.getTracks().forEach((track) => track.stop()); };
      mediaRecorder.current = recorder;
      recorder.start();
      setRecording(true);
    } catch { setRecording(false); setMicError(true); }
  }

  function next() { if (step < 3) setStep(step + 1); else setDone(true); }

  if (done) return <div className="profile-flow"><div className="flow-success"><span><Check size={35}/></span><h1>Profile started!</h1><p>Good work, {name || "friend"}. You can add more details any time.</p><Link className="flow-next" href="/dashboard">Go to my home <ArrowRight size={18}/></Link></div></div>;

  const question = ["What is your name?", "What work do you do?", "How long have you done this work?", "Tell us about yourself"];
  return <div className="profile-flow"><Link className="flow-back" href="/dashboard"><ArrowLeft size={17}/> {t("Back")}</Link><div className="flow-progress-label"><span>{t("My Profile")}</span><strong>{step + 1} <i>of</i> 4</strong></div><div className="flow-progress"><i style={{ width: `${((step + 1) / 4) * 100}%` }}/></div><div className="flow-question"><span className="flow-step-icon">{step === 1 ? <Wrench size={24}/> : step === 3 ? <Mic size={24}/> : <UserRound size={24}/>}</span><h1>{t(question[step])}</h1>{step === 0 && <p>{t("What should we call you?")}</p>}{step === 1 && <p>{t("Choose the work you know best.")}</p>}{step === 2 && <p>{t("Choose one answer.")}</p>}{step === 3 && <p>{t("Talk about your work. This is optional.")}</p>}</div>
    {step === 0 && <div className="flow-field"><label htmlFor="worker-name">{t("Your name")}</label><input autoFocus id="worker-name" placeholder={t("Type your name")} value={name} onChange={(event) => setName(event.target.value)}/></div>}
    {step === 1 && <div className="trade-choice-grid">{trades.map(({name:label,icon:Icon,color})=><button className={`trade-choice ${trade === label ? "selected" : ""}`} key={label} onClick={()=>setTrade(label)}><span className={`trade-icon ${color}`}><Icon size={29}/></span><strong>{label}</strong>{trade === label && <span className="choice-check"><Check size={14}/></span>}</button>)}</div>}
    {step === 2 && <div className="experience-options">{["New to this", "1–3 years", "4–7 years", "8 or more years"].map((answer)=><button className={`experience-option ${experience === answer ? "selected" : ""}`} key={answer} onClick={()=>setExperience(answer)}><span className="experience-dot"/><strong>{t(answer)}</strong>{experience === answer && <Check size={17}/>}</button>)}</div>}
    {step === 3 && <div className="voice-record"><button className={`record-button ${recording ? "is-recording" : ""}`} onClick={toggleRecording} aria-label={recording ? "Stop recording" : "Record your introduction"}>{recording ? <Square size={30} fill="currentColor"/> : <Mic size={36}/>}</button><strong>{recording ? t("Listening… tap to stop") : t("Tap to speak")}</strong><span>{micError ? t("Please allow microphone access, or skip this step.") : t("Say your name and the work you do.")}</span>{audioUrl && <audio controls src={audioUrl}/>}</div>}
    <div className="flow-footer">{step > 0 && <button className="flow-previous" onClick={()=>setStep(step-1)}><ArrowLeft size={17}/> {t("Back")}</button>}<button className="flow-next" onClick={next} disabled={(step === 0 && !name.trim()) || (step === 1 && !trade) || (step === 2 && !experience)}>{step === 3 ? t("Finish") : t("Next")}<ArrowRight size={18}/></button></div>
    <div className="flow-help"><MapPin size={15}/> Your details stay on this device in this demo.</div>
  </div>;
}
