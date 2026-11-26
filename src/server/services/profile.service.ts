import { PreferredLanguage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { WorkerProfileInput } from "@/schemas/profile.schema";

export class ProfileSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileSelectionError";
  }
}

function parseLanguage(value: WorkerProfileInput["preferredLanguage"]): PreferredLanguage {
  if (value === "हिन्दी" || value === "HINDI") return "HINDI";
  if (value === "ಕನ್ನಡ" || value === "KANNADA") return "KANNADA";
  return "ENGLISH";
}

function parseYearsExperience(value: WorkerProfileInput["yearsExperience"]): number {
  if (typeof value === "number") return value;
  const rangeMatch = value.match(/(\d+)/);
  if (rangeMatch) return Number(rangeMatch[1]);
  return 0;
}

export async function getOrCreateDevelopmentWorker(phoneNumber: string) {
  return prisma.user.upsert({
    where: { phoneNumber },
    update: { isActive: true },
    create: { phoneNumber, role: "WORKER", isActive: true },
  });
}

export async function getWorkerProfile(phoneNumber: string) {
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
    include: {
      workerProfile: {
        include: {
          trade: true,
          workerSkills: { include: { skill: true }, orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
  return user?.workerProfile ?? null;
}

export async function upsertWorkerProfile(phoneNumber: string, input: WorkerProfileInput) {
  const trade = input.tradeId
    ? await prisma.trade.findFirst({ where: { id: input.tradeId, isActive: true } })
    : await prisma.trade.findFirst({ where: { name: input.tradeName, isActive: true } });

  if (!trade) throw new ProfileSelectionError("Trade not found");

  let skills: Array<{ id: string }>;
  if (input.skillIds?.length) {
    skills = await prisma.skill.findMany({
      where: { id: { in: input.skillIds }, tradeId: trade.id, isActive: true },
    });
    if (skills.length !== new Set(input.skillIds).size) {
      throw new ProfileSelectionError("One or more skills do not belong to the selected trade");
    }
  } else if (input.skillNames?.length) {
    skills = await prisma.skill.findMany({
      where: { tradeId: trade.id, isActive: true, name: { in: input.skillNames } },
    });
    if (skills.length !== new Set(input.skillNames).size) {
      throw new ProfileSelectionError("One or more skills do not belong to the selected trade");
    }
  } else {
    skills = [];
  }

  const user = await getOrCreateDevelopmentWorker(phoneNumber);

  return prisma.$transaction(async (transaction) => {
    const profile = await transaction.workerProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName: input.fullName,
        city: input.city,
        locality: input.locality,
        preferredLanguage: parseLanguage(input.preferredLanguage),
        profilePhotoUrl: input.profilePhotoUrl ?? null,
        tradeId: trade.id,
        specificWork: input.specificWork,
        yearsExperience: parseYearsExperience(input.yearsExperience),
        introduction: input.introduction,
        introductionAudioUrl: input.introductionAudioUrl ?? null,
        profileCompleted: input.profileCompleted,
      },
      create: {
        userId: user.id,
        fullName: input.fullName,
        city: input.city,
        locality: input.locality,
        preferredLanguage: parseLanguage(input.preferredLanguage),
        profilePhotoUrl: input.profilePhotoUrl ?? null,
        tradeId: trade.id,
        specificWork: input.specificWork,
        yearsExperience: parseYearsExperience(input.yearsExperience),
        introduction: input.introduction,
        introductionAudioUrl: input.introductionAudioUrl ?? null,
        profileCompleted: input.profileCompleted,
      },
    });

    await transaction.workerSkill.deleteMany({ where: { workerProfileId: profile.id } });
    if (skills.length) {
      await transaction.workerSkill.createMany({
        data: skills.map((skill) => ({ workerProfileId: profile.id, skillId: skill.id })),
        skipDuplicates: true,
      });
    }

    return transaction.workerProfile.findUniqueOrThrow({
      where: { id: profile.id },
      include: { trade: true, workerSkills: { include: { skill: true }, orderBy: { createdAt: "asc" } } },
    });
  });
}
