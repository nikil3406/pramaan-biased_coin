export type AssessmentStatus = "Not started" | "In progress" | "Submitted" | "Awaiting review" | "Verified" | "Needs another demonstration";

export interface SkillAssessment {
  skill: string;
  status: AssessmentStatus;
  submittedAt: string;
  feedback: string;
  endorsement: "Not requested" | "Requested" | "Endorsed";
}

export interface EvidenceStorage {
  save(assessmentId: string, evidence: Blob): Promise<void>;
  load(assessmentId: string): Promise<Blob | null>;
  remove(assessmentId: string): Promise<void>;
}

export interface AssessmentIntegrations {
  storeEvidence: (assessmentId: string, evidence: Blob) => Promise<string>;
  transcribe: (audio: Blob, language: string) => Promise<string>;
  analyzeVisualEvidence: (video: Blob) => Promise<unknown>;
  interpretResponse: (transcript: string, task: string) => Promise<unknown>;
}
