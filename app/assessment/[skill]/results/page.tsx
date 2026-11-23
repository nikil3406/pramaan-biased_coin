import { AssessmentResult } from "@/components/assessment/AssessmentResult";

export default async function Page({ params }: { params: Promise<{ skill: string }> }) {
  const { skill } = await params;
  return <AssessmentResult skill={decodeURIComponent(skill)} />;
}
