import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { LanguageProvider } from "@/components/LanguageContext";
import "./globals.css";
import "./shell.css";

export const metadata: Metadata = {
  title: "Pramaan — Skill. Proof. Opportunity.",
  description: "Showcase your skills, build trust and discover opportunities.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full"><LanguageProvider><AppShell>{children}</AppShell></LanguageProvider></body>
    </html>
  );
}
