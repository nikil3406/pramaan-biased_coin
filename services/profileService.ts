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
