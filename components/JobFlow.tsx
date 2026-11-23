"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Hammer, Waves, Wrench, Zap } from "lucide-react";
import { copy, useLanguage } from "@/components/LanguageContext";

const types = [{ name: "Electrician", icon: Zap }, { name: "Plumber", icon: Waves }, { name: "Mason", icon: Hammer }, { name: "Welder", icon: Wrench }];

export function JobFlow() {
  const { language } = useLanguage();
  const t = (text: string) => copy(text, language);
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [trade, setTrade] = useState("");
  const [done, setDone] = useState(false);
  if (done) return <div className="profile-flow"><div className="flow-success"><span><Check size={35}/></span><h1>Job post ready!</h1><p>{title} · {place} · {trade}</p><Link className="flow-next" href="/jobs">See My Jobs <ArrowRight size={18}/></Link></div></div>;
  const question = ["What work is needed?", "Where is the work?", "What kind of worker?"];
  const canContinue = step === 0 ? title.trim() : step === 1 ? place.trim() : Boolean(trade);
  return <div className="profile-flow"><Link className="flow-back" href="/dashboard"><ArrowLeft size={17}/> {t("Back")}</Link><div className="flow-progress-label"><span>{t("Create a job")}</span><strong>{step + 1} <i>of</i> 3</strong></div><div className="flow-progress"><i style={{ width: `${((step + 1) / 3) * 100}%` }}/></div><div className="flow-question"><span className="flow-step-icon"><BriefcaseBusiness size={24}/></span><h1>{t(question[step])}</h1><p>{step === 0 ? t("For example: Fix a water pipe") : step === 1 ? t("Enter your town or area.") : t("Choose the main skill.")}</p></div>
    {step === 0 && <div className="flow-field"><label htmlFor="job-title">{t("Work needed")}</label><input autoFocus id="job-title" placeholder={t("Type the work")} value={title} onChange={event=>setTitle(event.target.value)}/></div>}{step === 1 && <div className="flow-field"><label htmlFor="job-place">{t("Town or area")}</label><input autoFocus id="job-place" placeholder={t("Type a place")} value={place} onChange={event=>setPlace(event.target.value)}/></div>}{step === 2 && <div className="trade-choice-grid job-trade-grid">{types.map(({name,icon:Icon})=><button className={`trade-choice ${trade===name?"selected":""}`} key={name} onClick={()=>setTrade(name)}><span className="trade-icon electrician"><Icon size={28}/></span><strong>{t(name)}</strong>{trade===name&&<span className="choice-check"><Check size={14}/></span>}</button>)}</div>}
    <div className="flow-footer">{step>0&&<button className="flow-previous" onClick={()=>setStep(step-1)}><ArrowLeft size={17}/> {t("Back")}</button>}<button className="flow-next" disabled={!canContinue} onClick={()=>step<2?setStep(step+1):setDone(true)}>{step===2?t("Post job"):t("Next")}<ArrowRight size={18}/></button></div><div className="flow-help">{t("Your job post is saved for this demo.")}</div></div>;
}
