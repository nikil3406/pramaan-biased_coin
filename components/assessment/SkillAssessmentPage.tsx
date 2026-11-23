"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage, type Language } from "@/components/LanguageContext";
import { VoiceLanguageSelector } from "@/components/profile/VoiceLanguageSelector";
import { AssessmentInstructions } from "@/components/assessment/AssessmentInstructions";
import { CameraRecorder } from "@/components/assessment/CameraRecorder";
import { AssessmentStatus } from "@/components/assessment/AssessmentStatus";
import { assessmentText as t, assessmentInstruction } from "@/data/skillAssessments";
import { getAssessment, saveAssessment } from "@/services/assessmentService";
import { loadProfile, saveProfile } from "@/services/profileService";
import type { SkillAssessment } from "@/types/assessment";
import styles from "./Assessment.module.css";

export function SkillAssessmentPage({ skill }: { skill: string }) {
  const { language: appLanguage, setLanguage } = useLanguage();
  const router = useRouter();
  const [language, setAssessmentLanguage] = useState<Language>(appLanguage);
  const [status, setStatus] = useState<SkillAssessment["status"]>("Not started");
  const [hasEvidence, setHasEvidence] = useState(false);
  const [trade, setTrade] = useState("");
  useEffect(() => { let active = true; void Promise.resolve().then(() => { if (!active) return; const profile = loadProfile(); const item = getAssessment(skill); setTrade(profile.trade); setStatus(item.status); setAssessmentLanguage(profile.preferredLanguage || appLanguage); setHasEvidence(["In progress", "Submitted", "Awaiting review", "Verified"].includes(item.status)); }); return () => { active = false; }; }, [skill, appLanguage]);

  function chooseLanguage(nextLanguage: Language) { setAssessmentLanguage(nextLanguage); setLanguage(nextLanguage); const profile = loadProfile(); saveProfile({ ...profile, preferredLanguage: nextLanguage }); }
  function saveDraft() { const current = getAssessment(skill); const item = { ...current, skill, status: "In progress" as const }; saveAssessment(item); setStatus(item.status); setHasEvidence(true); }
  function submit() { const current = getAssessment(skill); const item = { ...current, skill, status: "Awaiting review" as const, submittedAt: new Date().toISOString(), feedback: "", endorsement: "Not requested" as const }; saveAssessment(item); setStatus(item.status); router.push(`/assessment/${encodeURIComponent(skill)}/results`); }

  return <main className={styles.page}>
    <Link className={styles.back} href="/skills"><ArrowLeft size={17}/>{t("Back to skills", language)}</Link>
    <header className={styles.head}><span className={styles.demo}>{t("Demo only", language)}</span><h1>{t("Assessment", language)}</h1><p className={styles.subtitle}>{skill}</p><div style={{marginTop:12}}><AssessmentStatus status={status} language={language}/></div>
      <AssessmentInstructions skill={skill} text={assessmentInstruction(trade, skill, language)} language={language}/>
      <div className={styles.language}><VoiceLanguageSelector language={language} onChange={chooseLanguage}/></div>
    </header>
    <CameraRecorder skill={skill} language={language} onSaved={saveDraft}/>
    <p className={styles.note}>{t("This is a demo. No AI checks your work.", language)}</p>
    <div className={styles.controls}><button type="button" className={styles.primary} disabled={!hasEvidence} onClick={submit}><ArrowRight size={18}/>{t("Submit evidence", language)}</button>{hasEvidence && <Link className={styles.secondary} href={`/assessment/${encodeURIComponent(skill)}/results`}>{t("Open result", language)}</Link>}</div>
  </main>;
}
