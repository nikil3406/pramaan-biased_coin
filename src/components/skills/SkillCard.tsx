"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, CircleDashed, Wrench } from "lucide-react";
import type { SkillAssessment } from "@/types/assessment";
import styles from "./Skills.module.css";
import { profileText } from "@/data/profileTranslations";
import { assessmentText as t } from "@/data/skillAssessments";

const statusIcon = { "Verified": BadgeCheck, "Submitted": Clock3, "Awaiting review": Clock3, "In progress": Clock3, "Needs another demonstration": CircleDashed, "Not started": CircleDashed };
const statusClass = { "Verified": "verified", "Submitted": "submitted", "Awaiting review": "submitted", "In progress": "progress", "Needs another demonstration": "retry", "Not started": "notStarted" };

export function SkillCard({ skill, assessment, onRemove, language = "EN" }: { skill: string; assessment: SkillAssessment; onRemove: (skill: string) => void; language?: "EN" | "हिन्दी" | "ಕನ್ನಡ" }) {
  const StatusIcon = statusIcon[assessment.status];
  return <article className={styles.skillCard}>
    <span className={styles.skillIcon}><Wrench size={22} aria-hidden="true" /></span>
    <div className={styles.skillInfo}><h3>{profileText(skill, language)}</h3><span className={`${styles.status} ${styles[statusClass[assessment.status]]}`}><StatusIcon size={15} />{assessment.status}</span></div>
    <div className={styles.skillActions}><Link className={styles.assessLink} href={`/assessment/${encodeURIComponent(skill)}`} aria-label={`${t("Show skill", language)}: ${profileText(skill, language)}`}>{assessment.status === "Not started" || assessment.status === "Needs another demonstration" || assessment.status === "Verified" ? t("Show skill", language) : t("View", language)}<ArrowRight size={15}/></Link><button type="button" className={styles.removeButton} onClick={() => onRemove(skill)} aria-label={`${t("Remove", language)} ${profileText(skill, language)}`}>{t("Remove", language)}</button></div>
  </article>;
}
