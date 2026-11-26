import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { workerProfileSchema } from "@/schemas/profile.schema";
import { getWorkerProfile, ProfileSelectionError, upsertWorkerProfile } from "@/server/services/profile.service";

const getDevelopmentPhone = () => getServerEnv().PRAMAAN_DEV_PHONE ?? "dev-local-worker";

function serializeProfile(profile: Awaited<ReturnType<typeof getWorkerProfile>>) {
  if (!profile) return null;
  return {
    id: profile.id,
    fullName: profile.fullName,
    city: profile.city,
    locality: profile.locality,
    preferredLanguage: profile.preferredLanguage,
    profilePhotoUrl: profile.profilePhotoUrl,
    trade: profile.trade ? { id: profile.trade.id, name: profile.trade.name, slug: profile.trade.slug } : null,
    specificWork: profile.specificWork,
    yearsExperience: profile.yearsExperience,
    introduction: profile.introduction,
    introductionAudioUrl: profile.introductionAudioUrl,
    profileCompleted: profile.profileCompleted,
    skills: profile.workerSkills.map((workerSkill) => ({ id: workerSkill.skill.id, name: workerSkill.skill.name, slug: workerSkill.skill.slug })),
  };
}

export async function GET() {
  try {
    const profile = await getWorkerProfile(getDevelopmentPhone());
    return NextResponse.json({ profile: serializeProfile(profile) });
  } catch {
    return NextResponse.json({ error: "Unable to load worker profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = workerProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile data", issues: parsed.error.flatten() }, { status: 400 });
    }

    const profile = await upsertWorkerProfile(getDevelopmentPhone(), parsed.data);
    return NextResponse.json({ profile: serializeProfile(profile) }, { status: 200 });
  } catch (error) {
    if (error instanceof ProfileSelectionError) {
      return NextResponse.json({ error: "Invalid trade or skill selection" }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to save worker profile" }, { status: 500 });
  }
}
