import { SkillAssessmentPage } from "@/components/assessment/SkillAssessmentPage";

export default async function Page({ params }: { params: Promise<{ skill: string }> }) {
  const { skill } = await params;
  return <SkillAssessmentPage skill={decodeURIComponent(skill)} />;
}
