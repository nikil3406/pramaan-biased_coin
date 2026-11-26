import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import styles from "./DashboardActionCard.module.css";

export function DashboardActionCard({ href, title, description, icon: Icon, tone }: { href: string; title: string; description: string; icon: LucideIcon; tone: string }) {
  return <Link className={styles.card} href={href}>
    <span className={`${styles.icon} ${styles[tone]}`}><Icon aria-hidden="true" size={25} strokeWidth={2}/></span>
    <span className={styles.copy}><strong>{title}</strong><small>{description}</small></span>
    <ArrowRight aria-hidden="true" className={styles.arrow} size={18}/>
  </Link>;
}
