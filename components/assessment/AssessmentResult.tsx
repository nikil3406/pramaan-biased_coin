"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarDays, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { assessmentText as t } from "@/data/skillAssessments";
import { getAssessment } from "@/services/assessmentService";
import type { SkillAssessment } from "@/types/assessment";
import { AssessmentStatus } from "@/components/assessment/AssessmentStatus";
import { EvidencePreview } from "@/components/assessment/EvidencePreview";
import styles from "./Assessment.module.css";

export function AssessmentResult({ skill }: { skill: string }) {
  const { language } = useLanguage();
  const [result, setResult] = useState<SkillAssessment | null>(null);
  useEffect(() => { let active = true; void Promise.resolve().then(() => { if (active) setResult(getAssessment(skill)); }); return () => { active = false; }; }, [skill]);
  if (!result) return <main className={styles.page} aria-busy="true"/>;
  return <main className={styles.page}>
    <Link className={styles.back} href="/skills"><ArrowLeft size={17}/>{t("Back to skills", language)}</Link>
    <header className={styles.head}><span className={styles.demo}>{t("Demo only", language)}</span><h1>{t("Assessment result", language)}</h1><p className={styles.subtitle}>{skill}</p><div style={{marginTop:14}}><AssessmentStatus status={result.status} language={language}/></div></header>
    <section className={styles.resultPanel}><h2>{t("Play evidence", language)}</h2><EvidencePreview skill={skill} language={language}/></section>
    <div className={styles.resultGrid}>
      <section className={styles.resultPanel}><h2><CalendarDays size={15}/> {t("Submission date", language)}</h2><p>{result.submittedAt ? new Date(result.submittedAt).toLocaleString(language === "हिन्दी" ? "hi-IN" : language === "ಕನ್ನಡ" ? "kn-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}</p></section>
      <section className={styles.resultPanel}><h2><MessageCircle size={15}/> {t("Feedback", language)}</h2><p>{result.feedback || t("No feedback yet", language)}</p></section>
      <section className={styles.resultPanel}><h2><BadgeCheck size={15}/> {t("Human endorsement", language)}</h2><p>{result.endorsement === "Endorsed" ? t("Verified", language) : t("Not verified", language)}</p></section>
      <section className={styles.resultPanel}><h2>{t("Assessment", language)}</h2><p>{t("This is a demo. No AI checks your work.", language)}</p></section>
    </div>
    <p className={styles.note}>{t("Evidence stays on this device in this demo.", language)}</p>
  </main>;
}
