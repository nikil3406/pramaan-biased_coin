import type { AssessmentIntegrations, EvidenceStorage, SkillAssessment } from "@/types/assessment";

const ASSESSMENTS_KEY = "pramaan.skill-assessments.v1";
const DB_NAME = "pramaan.assessments.v1";
const STORE_NAME = "evidence";

export function assessmentId(skill: string) {
  return skill.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function loadAssessments(): Record<string, SkillAssessment> {
  if (typeof window === "undefined") return {};
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(ASSESSMENTS_KEY) ?? "{}");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, SkillAssessment>;
  } catch { /* Use an empty local draft if saved data is damaged. */ }
  return {};
}

function persist(items: Record<string, SkillAssessment>) {
  try { localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(items)); return true; } catch { return false; }
}

export function saveAssessment(item: SkillAssessment) {
  const items = loadAssessments();
  items[assessmentId(item.skill)] = item;
  return persist(items);
}

export function getAssessment(skill: string) {
  return loadAssessments()[assessmentId(skill)] ?? { skill, status: "Not started" as const, submittedAt: "", feedback: "", endorsement: "Not requested" as const };
}

export function removeAssessment(skill: string) {
  const items = loadAssessments();
  delete items[assessmentId(skill)];
  persist(items);
  void browserEvidenceStore.remove(assessmentId(skill));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB is not available."));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local evidence storage."));
  });
}

export const browserEvidenceStore: EvidenceStorage = {
  async save(id, evidence) {
    const db = await openDb();
    try { await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).put(evidence, id); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); } finally { db.close(); }
  },
  async load(id) {
    const db = await openDb();
    try { return await new Promise<Blob | null>((resolve, reject) => { const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(id); request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null); request.onerror = () => reject(request.error); }); } finally { db.close(); }
  },
  async remove(id) {
    const db = await openDb();
    try { await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).delete(id); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); } finally { db.close(); }
  },
};

// Secure server adapters for S3, Transcribe, Rekognition and Bedrock can implement this contract.
export const assessmentIntegrations: AssessmentIntegrations = {
  storeEvidence: async () => { throw new Error("S3 storage is not connected. Evidence stays on this device in the demo."); },
  transcribe: async () => { throw new Error("Transcribe is not connected in this demo."); },
  analyzeVisualEvidence: async () => { throw new Error("Rekognition is not connected in this demo."); },
  interpretResponse: async () => { throw new Error("Bedrock is not connected in this demo."); },
};
