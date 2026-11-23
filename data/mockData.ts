export type Worker = { name: string; trade: string; location: string; experience: string; initials: string; color: string; skills: string[]; demoVerified: boolean };

export const workers: Worker[] = [
  { name: "Ramesh Kumar", trade: "Electrician", location: "Pune, Maharashtra", experience: "8 years experience", initials: "RK", color: "#dce9ff", skills: ["Wiring", "Safety"], demoVerified: true },
  { name: "Sana Shaikh", trade: "Tailor", location: "Mumbai, Maharashtra", experience: "5 years experience", initials: "SS", color: "#f8e2d8", skills: ["Alterations", "Pattern making"], demoVerified: false },
  { name: "Arjun Das", trade: "Plumber", location: "Nashik, Maharashtra", experience: "6 years experience", initials: "AD", color: "#e2f1e8", skills: ["Pipe fitting", "Repairs"], demoVerified: true },
];

export const activities = [
  { title: "Profile created", detail: "Your Pramaan profile is ready to build on", time: "Today, 9:42 AM", icon: "user", tone: "blue" },
  { title: "Assessment submitted", detail: "Residential wiring · Electrician", time: "Yesterday", icon: "clipboard", tone: "amber" },
  { title: "Skill verified", detail: "Basic electrical safety", time: "2 days ago", icon: "check", tone: "green" },
  { title: "Job listing published", detail: "Painter needed · Pune", time: "4 days ago", icon: "briefcase", tone: "violet" },
];
