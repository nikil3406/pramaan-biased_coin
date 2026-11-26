"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Hammer, Mic, UserRound, Waves, Wrench, Zap } from "lucide-react";
import { useLanguage, type Language } from "@/components/LanguageContext";
import { VoiceQuestion } from "@/components/profile/VoiceQuestion";
import { VoiceLanguageSelector } from "@/components/profile/VoiceLanguageSelector";
import { VoiceRecorder } from "@/components/profile/VoiceRecorder";
import { profileText } from "@/data/profileTranslations";
import { emptyProfile, type ProfileDraft } from "@/types/profile";
import { loadProfile, loadServerProfile, saveProfile, syncProfileWithServer } from "@/services/profileService";
import styles from "./ProfileFlow.module.css";

const totalQuestions = 11;
const trades = [
  { name: "Electrician", icon: Zap },
  { name: "Plumber", icon: Waves },
  { name: "Mason", icon: Hammer },
  { name: "Welder", icon: Wrench },
];

const skillsByTrade: Record<string, string[]> = {
  Electrician: ["House Wiring", "MCB Installation", "Electrical Maintenance", "Multimeter Usage"],
  Plumber: ["PVC Pipefitting", "CPVC Jointing", "Leak Testing", "Tap Installation"],
  Mason: ["Brick Laying", "Plastering", "Floor Levelling"],
  Welder: ["Arc Welding", "Joint Preparation", "Metal Fabrication"],
};

const questions = [
  "What is your full name?",
  "Which city do you live in?",
  "Which area or locality do you live in?",
  "Which language do you prefer?",
  "Would you like to add a photo?",
  "What kind of work do you do?",
  "What specific work can you perform?",
  "How many years of experience do you have?",
  "What work are you experienced in?",
  "Which of these tasks can you perform?",
  "Tell us a little about your work and experience.",
];

function normalized(value: string) {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function spokenTrade(text: string, language: Language, confidence: number) {
  if (confidence < 0.55) return "";
  const heard = normalized(text);
  const names: Record<string, Record<Language, string[]>> = {
    Electrician: { EN: ["electrician"], "हिन्दी": ["electrician", "बिजली मिस्त्री", "इलेक्ट्रीशियन"], "ಕನ್ನಡ": ["electrician", "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್", "ವಿದ್ಯುತ್ ಕೆಲಸ"] },
    Plumber: { EN: ["plumber"], "हिन्दी": ["plumber", "प्लंबर"], "ಕನ್ನಡ": ["plumber", "ಪ್ಲಂಬರ್"] },
    Mason: { EN: ["mason"], "हिन्दी": ["mason", "राजमिस्त्री"], "ಕನ್ನಡ": ["mason", "ಮೇಸ್ತ್ರಿ"] },
    Welder: { EN: ["welder"], "हिन्दी": ["welder", "वेल्डर"], "ಕನ್ನಡ": ["welder", "ವೆಲ್ಡರ್"] },
  };
  return trades.find((trade) => names[trade.name][language].some((alias) => heard === normalized(alias) || heard.includes(normalized(alias))))?.name ?? "";
}

function imageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("image-read-failed"));
    reader.onerror = () => reject(new Error("image-read-failed"));
    reader.readAsDataURL(file);
  });
}

export function ProfileFlow() {
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfile);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [photoAnswer, setPhotoAnswer] = useState("");
  const [skillAnswer, setSkillAnswer] = useState("");
  const [matchMessage, setMatchMessage] = useState("");
  const [saveWarning, setSaveWarning] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      const saved = loadProfile();
      const serverProfile = await loadServerProfile();
      if (!active) return;
      const merged = serverProfile ? { ...saved, ...serverProfile, photoDataUrl: saved.photoDataUrl } : saved;
      setProfile(merged);
      setQuestionIndex(Math.min(merged.currentQuestion, totalQuestions - 1));
      if (merged.preferredLanguage) setLanguage(merged.preferredLanguage);
      setReady(true);
    });
    return () => { active = false; };
  }, [setLanguage]);

  useEffect(() => {
    if (!ready) return;
    saveProfile({ ...profile, currentQuestion: questionIndex });
  }, [profile, questionIndex, ready]);

  const t = (text: string) => profileText(text, language);
  const patchProfile = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setValidationMessage("");
    setMatchMessage("");
  };

  function setPreferredLanguage(value: Language) {
    patchProfile("preferredLanguage", value);
    setLanguage(value);
  }

  function selectTrade(name: string) {
    patchProfile("trade", name);
    setMatchMessage("");
  }

  function handleTradeSpeech(answer: string, confidence: number) {
    const match = spokenTrade(answer, language, confidence);
    if (match) selectTrade(match);
    else setMatchMessage("I couldn't match that yet. Choose a card below.");
  }

  function matchSkillSpeech(answer: string, confidence: number) {
    const available = skillsByTrade[profile.trade] ?? [];
    const heard = normalized(answer);
    const matches = confidence >= 0.55 ? available.filter((skill) => {
      const label = normalized(profileText(skill, language));
      return label.length > 2 && (heard === label || heard.includes(label));
    }) : [];
    if (matches.length) {
      setProfile((current) => ({ ...current, skills: [...new Set([...current.skills, ...matches])] }));
      setMatchMessage("");
    } else {
      setMatchMessage("I couldn't match that yet. Choose a card below.");
    }
  }

  async function choosePhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 1_500_000) {
      setSaveWarning("This photo is too large. Choose a smaller photo.");
      return;
    }
    try {
      patchProfile("photoDataUrl", await imageAsDataUrl(file));
      setPhotoAnswer("Yes");
      setSaveWarning("");
    } catch {
      setSaveWarning("Camera or photo access was not available. You can choose another photo.");
    }
  }

  function validateQuestion() {
    if (questionIndex === 0 && !profile.fullName.trim()) return "Please answer this question to continue.";
    if (questionIndex === 1 && !profile.city.trim()) return "Please answer this question to continue.";
    if (questionIndex === 2 && !profile.locality.trim()) return "Please answer this question to continue.";
    if (questionIndex === 5 && !profile.trade) return "Select one trade to continue.";
    if (questionIndex === 6 && !profile.specificWork.trim()) return "Please answer this question to continue.";
    if (questionIndex === 7 && !profile.yearsExperience.trim()) return "Please answer this question to continue.";
    return "";
  }

  function moveTo(next: number) {
    setQuestionIndex(Math.max(0, Math.min(totalQuestions - 1, next)));
    setProfile((current) => ({ ...current, currentQuestion: Math.max(0, Math.min(totalQuestions - 1, next)), completed: false }));
    setValidationMessage("");
  }

  function next() {
    const issue = validateQuestion();
    if (issue) { setValidationMessage(issue); return; }
    if (questionIndex === totalQuestions - 1) {
      const finished = { ...profile, currentQuestion: questionIndex, completed: true, updatedAt: new Date().toISOString() };
      if (!saveProfile(finished)) { setSaveWarning("Could not save profile details on this device."); return; }
      setProfile(finished);
      void syncProfileWithServer(finished).then((saved) => {
        if (!saved) setSaveWarning("Profile is saved on this device, but the server connection failed.");
      });
      return;
    }
    moveTo(questionIndex + 1);
  }

  function toggleSkill(name: string) {
    setProfile((current) => ({ ...current, skills: current.skills.includes(name) ? current.skills.filter((skill) => skill !== name) : [...current.skills, name] }));
    setMatchMessage("");
  }

  if (!ready) return <main className={styles.loading}><span className={styles.loadingDot}/>{t("Loading profile…")}</main>;
  if (profile.completed) return <main className={styles.shell}><section className={styles.doneCard}><span className={styles.doneIcon}><Check size={34}/></span><h1>{t("Profile saved!")}</h1><p>{t("Profile saved. Your answers are ready to review.")}</p><div className={styles.summary}><span>{profile.fullName || t("Your answer")}</span><span>{profile.trade ? t(profile.trade) : t("Your work")}</span><span>{profile.skills.length ? profile.skills.map(t).join(", ") : t("Your skills")}</span></div><Link className={styles.primaryButton} href="/dashboard">{t("Continue to home")} <ArrowRight size={18}/></Link><button className={styles.reviewButton} onClick={()=>{setProfile((current)=>({...current,completed:false}));moveTo(0);}}>{t("Edit answers")}</button></section></main>;

  const groupIndex = questionIndex < 5 ? 0 : questionIndex < 8 ? 1 : questionIndex < 10 ? 2 : 3;
  const groupLabels = ["Personal information", "Your work", "Your skills", "About you"];
  const textValue: Record<number, string> = {
    0: profile.fullName,
    1: profile.city,
    2: profile.locality,
    3: profile.preferredLanguage,
    4: photoAnswer,
    5: profile.trade,
    6: profile.specificWork,
    7: profile.yearsExperience,
    8: profile.experiencedWork || profile.specificWork,
    9: skillAnswer,
    10: profile.introduction,
  };
  const setAnswer = (value: string) => {
    if (questionIndex === 0) patchProfile("fullName", value);
    else if (questionIndex === 1) patchProfile("city", value);
    else if (questionIndex === 2) patchProfile("locality", value);
    else if (questionIndex === 3) {
      const lowered = normalized(value);
      const found = lowered.includes("ಕನ್ನಡ") || lowered.includes("kannada") ? "ಕನ್ನಡ" : lowered.includes("हिन्दी") || lowered.includes("hindi") ? "हिन्दी" : lowered.includes("english") ? "EN" : "";
      if (found) setPreferredLanguage(found);
    } else if (questionIndex === 4) setPhotoAnswer(value);
    else if (questionIndex === 5) {
      const found = spokenTrade(value, language, 1);
      if (found) selectTrade(found);
    } else if (questionIndex === 6) patchProfile("specificWork", value);
    else if (questionIndex === 7) patchProfile("yearsExperience", value);
    else if (questionIndex === 8) patchProfile("experiencedWork", value);
    else if (questionIndex === 9) setSkillAnswer(value);
    else patchProfile("introduction", value);
  };

  return <main className={styles.shell}>
    <div className={styles.topLine}><Link className={styles.homeLink} href="/dashboard"><ArrowLeft size={17}/>{t("Back")}</Link><VoiceLanguageSelector language={language} onChange={setPreferredLanguage}/></div>
    <section className={styles.formCard}>
      <div className={styles.progressHeader}><div><span>{t(groupLabels[groupIndex])}</span><strong>{questionIndex + 1} / {totalQuestions}</strong></div><div className={styles.progressTrack} role="progressbar" aria-label={t("Profile progress")} aria-valuenow={Math.round(((questionIndex + 1) / totalQuestions) * 100)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}/></div><div className={styles.groupSteps}>{groupLabels.map((label,index)=><span key={label} className={index===groupIndex?styles.currentStep:index<groupIndex?styles.pastStep:styles.futureStep}>{index<groupIndex?<Check size={12}/>:index+1}<small>{t(label)}</small></span>)}</div></div>
      <div className={styles.formBody}>
        <div className={styles.questionNumber}><span>{questionIndex < 5 ? <UserRound size={20}/> : questionIndex < 8 ? <Wrench size={20}/> : questionIndex < 10 ? <Check size={20}/> : <Mic size={20}/>}</span><small>{t(groupLabels[groupIndex])}</small></div>
        <VoiceQuestion question={t(questions[questionIndex])} language={language} value={textValue[questionIndex]} onChange={setAnswer} onRecognized={questionIndex===5?handleTradeSpeech:questionIndex===9?matchSkillSpeech:undefined} placeholder={t(questionIndex===1?"For example, Pune":questionIndex===2?"For example, Kothrud":questionIndex===6||questionIndex===8?"For example, house wiring":questionIndex===7?"For example, 5 years":questionIndex===10?"Tell us about your work":"Type your answer")} multiline={questionIndex===6||questionIndex===8||questionIndex===10} inputId={`profile-answer-${questionIndex}`} speechInput={questionIndex!==10}>
          {questionIndex===3&&<VoiceLanguageSelector language={profile.preferredLanguage} onChange={setPreferredLanguage}/>}
          {questionIndex===4&&<div className={styles.photoPicker}>{profile.photoDataUrl?<Image unoptimized width={86} height={86} className={styles.photoPreview} src={profile.photoDataUrl} alt={t("Profile photo preview")}/>:<span className={styles.photoPlaceholder}><UserRound size={32}/></span>}<label className={styles.photoButton}>{t("Take or choose a photo")}<input type="file" accept="image/*" capture="environment" onChange={(event)=>void choosePhoto(event.target.files?.[0])}/></label><button type="button" className={styles.skipPhoto} onClick={()=>{patchProfile("photoDataUrl","");setPhotoAnswer("No");}}>{profile.photoDataUrl?t("Remove photo"):t("Skip")}</button><small>{t("Take a photo or choose one from your phone.")}</small></div>}
          {questionIndex===5&&<div className={styles.choiceGrid}>{trades.map(({name,icon:Icon})=><button type="button" key={name} className={`${styles.choiceCard} ${profile.trade===name?styles.selected:""}`} aria-pressed={profile.trade===name} onClick={()=>selectTrade(name)}><span className={styles.tradeIcon}><Icon size={27}/></span><strong>{t(name)}</strong>{profile.trade===name&&<span className={styles.checkMark}><Check size={14}/></span>}</button>)}</div>}
          {questionIndex===9&&<div className={styles.skillPicker}><p>{t("Choose the skills you can do")}</p><div className={styles.skillGrid}>{(skillsByTrade[profile.trade]??[]).map((skill)=>{const selected=profile.skills.includes(skill);return <button type="button" key={skill} aria-pressed={selected} className={`${styles.skillCard} ${selected?styles.selected:""}`} onClick={()=>toggleSkill(skill)}><span className={styles.skillCheck}>{selected&&<Check size={15}/>}</span><span>{t(skill)}</span></button>;})}</div>{profile.skills.length>0&&<div className={styles.selectedSkills}><Check size={15}/>{t("I can do")}{profile.skills.map(t).join(", ")}</div>}</div>}
          {questionIndex===10&&<VoiceRecorder language={language} value={profile.introduction} onChange={(value)=>patchProfile("introduction",value)}/>}
          {matchMessage&&<p className={styles.matchMessage} role="status">{t(matchMessage)}</p>}
        </VoiceQuestion>
        {validationMessage&&<p className={styles.validation} role="alert">{t(validationMessage)}</p>}
        {saveWarning&&<p className={styles.validation} role="alert">{t(saveWarning)}</p>}
      </div>
      <footer className={styles.formFooter}><p>{t("Your skills and answers are saved on this device.")}</p><div><button className={styles.backButton} type="button" disabled={questionIndex===0} onClick={()=>moveTo(questionIndex-1)}><ArrowLeft size={17}/>{t("Back")}</button><button className={styles.nextButton} type="button" onClick={next}>{questionIndex===totalQuestions-1?t("Save and finish"):t("Next")} <ArrowRight size={18}/></button></div></footer>
    </section>
  </main>;
}
