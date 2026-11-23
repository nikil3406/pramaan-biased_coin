"use client";

import Link from "next/link";
import { BadgeCheck, BriefcaseBusiness, Hammer, Mic, Plus, UserRound, UsersRound, Waves, Wrench, Zap, ArrowRight } from "lucide-react";
import { workers } from "@/data/mockData";
import { DashboardActionCard } from "@/components/dashboard/DashboardActionCard";
import { WorkerCard } from "@/components/dashboard/WorkerCard";
import { ListenButton } from "@/components/ListenButton";
import { copy, useLanguage } from "@/components/LanguageContext";
import styles from "@/components/dashboard/Dashboard.module.css";

const actions = [
  { href: "/profile", title: "My Profile", description: "Add your details", icon: UserRound, tone: "blue" },
  { href: "/skills", title: "My Skills", description: "Add skills you know", icon: Wrench, tone: "green" },
  { href: "/passport", title: "My Skill Card", description: "Show your work proof", icon: BadgeCheck, tone: "gold" },
  { href: "/workers", title: "Find Workers", description: "Find skilled people", icon: UsersRound, tone: "purple" },
  { href: "/jobs/create", title: "Create Job", description: "Find help for your work", icon: Plus, tone: "teal" },
  { href: "/jobs", title: "My Jobs", description: "See your job posts", icon: BriefcaseBusiness, tone: "orange" },
];

const trades = [
  { title: "Electrician", icon: Zap, tone: "electrician" },
  { title: "Plumber", icon: Waves, tone: "plumber" },
  { title: "Mason", icon: Hammer, tone: "mason" },
  { title: "Welder", icon: Wrench, tone: "welder" },
];

export default function DashboardPage() {
  const { language } = useLanguage();
  const t = (text: string) => copy(text, language);
  return <div className={styles.page}>
    <section className={styles.welcome}>
      <div className={styles.welcomeCopy}>
        <span className={styles.eyebrow}>{t("YOUR SKILLS. YOUR NEXT STEP.")}</span>
        <h1>Namaste, Ajay <span aria-hidden="true">👋</span></h1>
        <p>{t("What would you like to do today?")}</p>
        <span className={styles.demoLabel}>{t("Demo preview")}</span>
      </div>
      <ListenButton className={styles.voiceButton} text={t("What would you like to do today?")}>
        <span>{language === "EN" ? "Listen" : language === "हिन्दी" ? "सुनें" : "ಕೇಳಿ"}</span>
      </ListenButton>
    </section>

    <div className={styles.columns}>
      <div className={styles.mainColumn}>
        <section className={styles.completion} aria-labelledby="profile-progress-title">
          <span className={styles.completionIcon}><UserRound size={25}/></span>
          <div className={styles.completionBody}>
            <div className={styles.completionHeading}><h2 id="profile-progress-title">{t("Your profile")}</h2><strong>25%</strong></div>
            <div className={styles.progress} role="progressbar" aria-label="Profile completion" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}><span/></div>
            <p>{t("1 of 4 done")}</p>
          </div>
          <Link className={styles.continue} href="/profile">{t("Continue")} <ArrowRight size={17}/></Link>
        </section>

        <section className={styles.actionsSection} aria-labelledby="dashboard-actions-heading">
          <div className={styles.sectionHeading}><h2 id="dashboard-actions-heading">{t("Choose an action")}</h2></div>
          <div className={styles.actionGrid}>{actions.map((action) => <DashboardActionCard key={action.href} {...action} title={t(action.title)} description={t(action.description)}/>)}</div>
        </section>
      </div>

      <aside className={styles.sideColumn}>
        <section className={`${styles.panel} ${styles.tradePanel}`} aria-labelledby="dashboard-trades-heading">
          <div className={styles.panelHeading}><div><h2 id="dashboard-trades-heading">{t("Choose a type of work")}</h2><p>{t("Find a skilled worker")}</p></div><Link className={styles.panelLink} href="/workers" aria-label="All workers"><ArrowRight size={18}/></Link></div>
          <div className={styles.tradeGrid}>{trades.map(({title,icon:Icon,tone})=><Link key={title} href={`/workers?trade=${title.toLowerCase()}`} className={styles.tradeCard}><span className={`${styles.tradeIcon} ${styles[tone]}`}><Icon size={27}/></span><strong>{t(title)}</strong></Link>)}</div>
        </section>

        <section className={`${styles.panel} ${styles.workersPanel}`} aria-labelledby="dashboard-workers-heading">
          <div className={styles.panelHeading}><div><h2 id="dashboard-workers-heading">{t("Workers near you")}</h2><p>{t("Sample profiles")}</p></div><Link href="/workers" className={styles.seeAll}>{t("See all")} <ArrowRight size={15}/></Link></div>
          <div className={styles.workerList}>{workers.slice(0,3).map((worker)=><WorkerCard key={worker.name} worker={worker} demoLabel={t("Sample")}/>)}</div>
        </section>

        <section className={styles.voiceTip}><span className={styles.voiceIcon}><Mic size={22}/></span><div className={styles.voiceCopy}><strong>{t("Prefer to speak?")}</strong><small>{t("Use the microphone when you add your profile.")}</small></div><Link className={styles.voiceLink} href="/profile" aria-label={t("Try it")}><ArrowRight size={18}/></Link></section>
      </aside>
    </div>
  </div>;
}
