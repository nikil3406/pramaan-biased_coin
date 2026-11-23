import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import type { Worker } from "@/data/mockData";
import styles from "./WorkerCard.module.css";

export function WorkerCard({ worker, demoLabel = "Sample" }: { worker: Worker; demoLabel?: string }) {
  return <article className={styles.card}>
    <span className={styles.avatar} style={{ backgroundColor: worker.color }} aria-hidden="true">{worker.initials}</span>
    <div className={styles.info}>
      <div className={styles.name}>{worker.name}{worker.demoVerified && <span title="Demo verified"><BadgeCheck aria-label="Demo verified" size={16}/></span>}</div>
      <span className={styles.trade}>{worker.trade}</span>
      <span className={styles.place}><MapPin size={13}/>{worker.location}</span>
      <span className={styles.years}>{worker.experience}</span>
    </div>
    <Link href="/workers" className={styles.link}>View profile <ArrowRight size={14}/></Link>
    <span className={styles.sample}>{demoLabel}</span>
  </article>;
}
