"use client";

import { Check, Pencil } from "lucide-react";
import styles from "./VoiceAnswerPreview.module.css";

export function VoiceAnswerPreview({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  if (!value) return null;
  return <div className={styles.preview} role="status">
    <span className={styles.check}><Check size={15}/></span>
    <span className={styles.answer}><small>{label}</small><strong>{value}</strong></span>
    <button type="button" onClick={onEdit} aria-label="Edit answer"><Pencil size={16}/></button>
  </div>;
}
