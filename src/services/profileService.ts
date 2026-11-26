import { emptyProfile, type ProfileDraft } from "@/types/profile";

const PROFILE_KEY = "pramaan.profile.v1";
const AUDIO_DB = "pramaan.profile.audio.v1";
const AUDIO_STORE = "recordings";
const INTRO_AUDIO_KEY = "voice-introduction";

export function loadProfile(): ProfileDraft {
  if (typeof window === "undefined") return emptyProfile;
  try {
    const value = window.localStorage.getItem(PROFILE_KEY);
    if (!value) return emptyProfile;
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return emptyProfile;
    return { ...emptyProfile, ...(parsed as Partial<ProfileDraft>) };
  } catch {
    return emptyProfile;
  }
}

export function saveProfile(profile: ProfileDraft): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

export async function syncProfileWithServer(profile: ProfileDraft): Promise<boolean> {
  try {
    const response = await fetch("/api/profiles/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: profile.fullName,
        city: profile.city,
        locality: profile.locality,
        preferredLanguage: profile.preferredLanguage,
        tradeName: profile.trade,
        specificWork: profile.specificWork,
        yearsExperience: profile.yearsExperience,
        introduction: profile.introduction,
        skillNames: profile.skills,
        profileCompleted: profile.completed,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function loadServerProfile(): Promise<Partial<ProfileDraft> | null> {
  try {
    const response = await fetch("/api/profiles/me", { cache: "no-store" });
    if (!response.ok) return null;
    const body = await response.json() as { profile?: {
      fullName?: string;
      city?: string;
      locality?: string;
      preferredLanguage?: "ENGLISH" | "HINDI" | "KANNADA";
      trade?: { name?: string } | null;
      specificWork?: string;
      yearsExperience?: number;
      introduction?: string;
      profileCompleted?: boolean;
      skills?: Array<{ name?: string }>;
    } | null };
    const profile = body.profile;
    if (!profile) return null;
    const preferredLanguage = profile.preferredLanguage === "HINDI"
      ? "हिन्दी"
      : profile.preferredLanguage === "KANNADA"
        ? "ಕನ್ನಡ"
        : "EN";
    return {
      fullName: profile.fullName,
      city: profile.city,
      locality: profile.locality,
      preferredLanguage,
      trade: profile.trade?.name,
      specificWork: profile.specificWork,
      yearsExperience: profile.yearsExperience === undefined ? undefined : String(profile.yearsExperience),
      introduction: profile.introduction,
      completed: profile.profileCompleted,
      skills: profile.skills?.map((skill) => skill.name).filter((name): name is string => Boolean(name)),
    };
  } catch {
    return null;
  }
}

function openAudioDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexeddb-unavailable"));
      return;
    }
    const request = indexedDB.open(AUDIO_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(AUDIO_STORE)) request.result.createObjectStore(AUDIO_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("database-open-failed"));
  });
}

export async function saveIntroductionAudio(blob: Blob): Promise<void> {
  const database = await openAudioDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(AUDIO_STORE, "readwrite");
    transaction.objectStore(AUDIO_STORE).put(blob, INTRO_AUDIO_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("audio-save-failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("audio-save-aborted"));
  }).finally(() => database.close());
}

export async function loadIntroductionAudio(): Promise<Blob | null> {
  const database = await openAudioDatabase();
  return new Promise<Blob | null>((resolve, reject) => {
    const request = database.transaction(AUDIO_STORE, "readonly").objectStore(AUDIO_STORE).get(INTRO_AUDIO_KEY);
    request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
    request.onerror = () => reject(request.error ?? new Error("audio-load-failed"));
  }).finally(() => database.close());
}

export async function deleteIntroductionAudio(): Promise<void> {
  const database = await openAudioDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(AUDIO_STORE, "readwrite");
    transaction.objectStore(AUDIO_STORE).delete(INTRO_AUDIO_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("audio-delete-failed"));
  }).finally(() => database.close());
}
