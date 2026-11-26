"use client";

import { Search, Plus, Check } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./Skills.module.css";
import { profileText } from "@/data/profileTranslations";
import { assessmentText as t } from "@/data/skillAssessments";

export function SkillSelector({ options, selected, onChange, language = "EN" }: { options: string[]; selected: string[]; onChange: (skills: string[]) => void; language?: "EN" | "हिन्दी" | "ಕನ್ನಡ" }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => options.filter((skill) => skill.toLowerCase().includes(search.toLowerCase())), [options, search]);
  function toggle(skill: string) { onChange(selected.includes(skill) ? selected.filter((item) => item !== skill) : [...selected, skill]); }
  return <section className={styles.selector} aria-label="Choose skills">
    <label className={styles.search}><Search size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("Find a skill", language)} aria-label={t("Search skills", language)} /></label>
    <div className={styles.options}>{filtered.map((skill) => { const active = selected.includes(skill); return <button type="button" key={skill} className={`${styles.option} ${active ? styles.optionSelected : ""}`} onClick={() => toggle(skill)}>{active ? <Check size={18}/> : <Plus size={18}/>}<span>{profileText(skill, language)}</span></button>; })}{filtered.length === 0 && <p className={styles.empty}>{t("No matching skills", language)}</p>}</div>
  </section>;
}
