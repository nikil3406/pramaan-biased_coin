"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Plus, Zap, Waves, Hammer, Wrench } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { assessmentText as t, skillsByTrade } from "@/data/skillAssessments";
import { loadProfile, saveProfile } from "@/services/profileService";
import { loadAssessments, removeAssessment, saveAssessment } from "@/services/assessmentService";
import type { ProfileDraft } from "@/types/profile";
import type { SkillAssessment } from "@/types/assessment";
import { SkillCard } from "@/components/skills/SkillCard";
import { SkillSelector } from "@/components/skills/SkillSelector";
import styles from "@/components/skills/Skills.module.css";

const iconByTrade = { Electrician: Zap, Plumber: Waves, Mason: Hammer, Welder: Wrench };
const defaultSkill = { status: "Not started", submittedAt: "", feedback: "", endorsement: "Not requested" } as const;

export function SkillsPage() {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<ProfileDraft | null>(null);
  const [assessments, setAssessments] = useState<Record<string, SkillAssessment>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { let active = true; void Promise.resolve().then(() => { if (!active) return; const saved = loadProfile(); setProfile(saved); setAssessments(loadAssessments()); setLoaded(true); }); return () => { active = false; }; }, []);
  const trade = profile?.trade ?? "";
  const options = useMemo(() => skillsByTrade[trade] ?? [], [trade]);
  const TradeIcon = iconByTrade[trade as keyof typeof iconByTrade] ?? BadgeCheck;
  const available = options.filter((skill) => !profile?.skills.includes(skill));

  function addSkills() {
    if (!profile || !selected.length) return;
    const next = { ...profile, skills: Array.from(new Set([...profile.skills, ...selected])) };
    setProfile(next); saveProfile(next);
    const updated = { ...assessments };
    for (const skill of selected) { const item = { ...defaultSkill, skill }; saveAssessment(item); updated[skill.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")] = item; }
    setAssessments(updated); setSelected([]);
  }

  function removeSkill(skill: string) {
    if (!profile) return;
    const next = { ...profile, skills: profile.skills.filter((item) => item !== skill) };
    setProfile(next); saveProfile(next); removeAssessment(skill);
    const updated = { ...assessments }; delete updated[skill.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")]; setAssessments(updated);
  }

  if (!loaded || !profile) return <main className={styles.page} aria-busy="true" />;
  return <main className={styles.page}>
    <div className="module-eyebrow">YOUR WORK</div>
    <header className={styles.heading}><div><h1>{t("My Skills", language)}</h1><p className={styles.sub}>{t("Skills you have added.", language)}</p></div>{trade && <span className={styles.trade}><TradeIcon size={20}/>{t("Your trade", language)}: {t(trade, language)}</span>}</header>
    {!trade ? <section className={styles.panel}><h2>{t("Your trade", language)}</h2><p className={styles.sub}>{t("Choose a trade in your profile to add skills.", language)}</p><Link href="/profile" className={styles.addButton}>{t("Open profile", language)}</Link></section> : <div className={styles.columns}>
      <section className={styles.panel}><div className={styles.panelTop}><h2>{t("Your skills", language)}</h2><span className={styles.count}>{profile.skills.length}</span></div>
        {profile.skills.length ? <div className={styles.cards}>{profile.skills.map((skill) => <SkillCard key={skill} skill={skill} language={language} assessment={assessments[skill.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")] ?? { ...defaultSkill, skill }} onRemove={removeSkill}/>)}</div> : <div className={styles.emptyState}><strong>{t("No skills yet", language)}</strong><p>{t("Add a skill to begin.", language)}</p></div>}
      </section>
      <section className={styles.panel}><div className={styles.panelTop}><h2>{t("Add skills", language)}</h2><span className={styles.demo}>{t("Demo only", language)}</span></div>
        <SkillSelector options={available} selected={selected} language={language} onChange={setSelected}/>
        {available.length ? <button type="button" className={styles.addButton} onClick={addSkills} disabled={!selected.length}><Plus size={18}/>{t("Add selected skills", language)}{selected.length > 0 ? ` (${selected.length})` : ""}</button> : <p className={styles.note}>{t("All listed skills are in your profile.", language)}</p>}
        <p className={styles.note}>Demo only. No skills are verified until a real review takes place.</p>
      </section>
    </div>}
  </main>;
}
