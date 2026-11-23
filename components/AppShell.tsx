"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, UserRound, Wrench, BadgeCheck, UsersRound, Plus, BriefcaseBusiness, Search, Bell, ChevronDown, Globe2, Sparkles } from "lucide-react";
import { copy, useLanguage } from "@/components/LanguageContext";
import { ListenButton } from "@/components/ListenButton";

const nav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/profile", icon: UserRound },
  { label: "My Skills", href: "/skills", icon: Wrench },
  { label: "My Skill Card", href: "/passport", icon: BadgeCheck },
  { label: "Find Workers", href: "/workers", icon: UsersRound },
  { label: "Create Job", href: "/jobs/create", icon: Plus },
  { label: "My Jobs", href: "/jobs", icon: BriefcaseBusiness },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<"notifications" | "profile" | "language" | null>(null);
  const { language, setLanguage } = useLanguage();
  const page = nav.find((item) => item.href === pathname)?.label ?? (pathname.startsWith("/assessment/") ? "My Skills" : "Overview");

  return <div className="app-shell">
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <Link className="brand" href="/dashboard" onClick={() => setOpen(false)}><span className="brand-mark"><Sparkles size={19} /></span><span>pramaan<span className="brand-dot">.</span><small>SKILL. PROOF. OPPORTUNITY.</small></span></Link>
      <div className="workspace-label">YOUR WORK</div>
      <nav className="side-nav" aria-label="Main navigation">{nav.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href === "/jobs" && pathname.startsWith("/jobs") && pathname !== "/jobs/create");
        return <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-link ${active ? "active" : ""}`}><Icon size={19} strokeWidth={1.8} /><span>{copy(label, language)}</span></Link>;
      })}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={16} /></div><strong>Your skills have value.</strong><p>Build a profile that helps your work speak for itself.</p><Link href="/profile">Complete your profile <span>→</span></Link></div><div className="sidebar-foot"><span className="online-dot" /> All systems operational <span className="version">v1.0</span></div></div>
    </aside>
    {open && <button aria-label="Close menu" className="scrim" onClick={() => setOpen(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button><Link className="mobile-brand" href="/dashboard"><span className="brand-mark"><Sparkles size={17}/></span><strong>pramaan<span className="brand-dot">.</span></strong></Link><div className="breadcrumb"><span>{language === "EN" ? "Home" : language === "हिन्दी" ? "होम" : "ಮುಖಪುಟ"}</span><span className="crumb-sep">/</span><strong>{copy(page, language)}</strong></div>
        <div className="top-actions"><label className="search-box"><Search size={17} /><input aria-label="Search workers and jobs" placeholder={language === "EN" ? "Search workers or jobs" : language === "हिन्दी" ? "काम खोजें" : "ಕೆಲಸ ಹುಡುಕಿ"} onKeyDown={(e) => { if (e.key === "Enter") router.push("/workers"); }} /><kbd>⌘ K</kbd></label>
          <div className="menu-wrap"><button className="language-button" aria-label={`Language: ${language}`} onClick={() => setMenu(menu === "language" ? null : "language")}><Globe2 size={16} /><span>{language === "EN" ? "EN" : language === "हिन्दी" ? "हि" : "ಕ"}</span><ChevronDown size={13} /></button>{menu === "language" && <div className="popover"><button onClick={() => { setLanguage("EN"); setMenu(null); }}>English {language === "EN" && <span>✓</span>}</button><button onClick={() => { setLanguage("हिन्दी"); setMenu(null); }}>हिन्दी {language === "हिन्दी" && <span>✓</span>}</button><button onClick={() => { setLanguage("ಕನ್ನಡ"); setMenu(null); }}>ಕನ್ನಡ {language === "ಕನ್ನಡ" && <span>✓</span>}</button></div>}</div>
          <ListenButton className="listen-button" text={language === "EN" ? "Welcome to Pramaan. Choose an option to get started." : language === "हिन्दी" ? "प्रमाण में आपका स्वागत है। शुरू करने के लिए एक विकल्प चुनें।" : "ಪ್ರಮಾಣ್‌ಗೆ ಸ್ವಾಗತ. ಪ್ರಾರಂಭಿಸಲು ಒಂದು ಆಯ್ಕೆಮಾಡಿ."}><span>{language === "EN" ? "Listen" : language === "हिन्दी" ? "सुनें" : "ಕೇಳಿ"}</span></ListenButton>
          <div className="menu-wrap"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setMenu(menu === "notifications" ? null : "notifications")}><Bell size={19} /><i /></button>{menu === "notifications" && <div className="popover notification-pop"><strong>Notifications</strong><p>Your electrician assessment is in progress.</p><small>Yesterday</small><p>Welcome to Pramaan. Complete your profile to get started.</p><small>2 days ago</small></div>}</div>
          <div className="menu-wrap"><button className="profile-trigger" onClick={() => setMenu(menu === "profile" ? null : "profile")}><span className="user-avatar">AK</span><span className="profile-name">Ajay Kumar<small>My workspace</small></span><ChevronDown size={14} /></button>{menu === "profile" && <div className="popover"><Link href="/profile" onClick={() => setMenu(null)}>View profile</Link><Link href="/dashboard" onClick={() => setMenu(null)}>Workspace settings</Link></div>}</div>
        </div>
      </header><div className="page-content">{children}<footer className="page-footer"><span>© 2025 Pramaan</span><span>Built on skill. Backed by proof.</span><a href="mailto:support@pramaan.in">Need help?</a></footer></div>
    </main>
  </div>;
}
