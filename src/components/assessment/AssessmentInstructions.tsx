"use client";

import { ClipboardList } from "lucide-react";
import { ListenButton } from "@/components/ListenButton";
import { assessmentText as t } from "@/data/skillAssessments";
import styles from "./Assessment.module.css";

export function AssessmentInstructions({ skill, text, language }: { skill: string; text: string; language: string }) {
  return <section className={styles.task}><div className={styles.taskLabel}><ClipboardList size={17}/>{t("Task", language)}</div><p>{text}</p><ListenButton language={language as "EN" | "हिन्दी" | "ಕನ್ನಡ"} text={`${skill}. ${text}`} className={styles.listen}>{t("Listen", language)}</ListenButton></section>;
}
