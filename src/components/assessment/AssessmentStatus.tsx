"use client";

import { BadgeCheck, Clock3, CircleDashed } from "lucide-react";
import type { AssessmentStatus as StatusType } from "@/types/assessment";
import { assessmentText as t } from "@/data/skillAssessments";
import styles from "./Assessment.module.css";

export function AssessmentStatus({ status, language }: { status: StatusType; language: string }) {
  const Icon = status === "Verified" ? BadgeCheck : status === "Not started" ? CircleDashed : Clock3;
  return <span className={styles.status}><Icon size={16}/>{t(status, language)}</span>;
}
