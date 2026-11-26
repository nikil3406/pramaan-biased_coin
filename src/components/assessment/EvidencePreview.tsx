"use client";

import { useEffect, useState } from "react";
import { browserEvidenceStore, assessmentId } from "@/services/assessmentService";
import { assessmentText as t } from "@/data/skillAssessments";
import styles from "./Assessment.module.css";

export function EvidencePreview({ skill, language }: { skill: string; language: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => { let active = true; let objectUrl = ""; void browserEvidenceStore.load(assessmentId(skill)).then((blob) => { if (active && blob) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); } }).catch(() => undefined); return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); }; }, [skill]);
  if (!url) return <p className={styles.note}>{t("Video is saved on this device.", language)}</p>;
  return <video className={styles.playback} src={url} controls playsInline aria-label={t("Play evidence", language)} />;
}
