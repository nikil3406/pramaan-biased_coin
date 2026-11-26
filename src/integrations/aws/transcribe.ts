import {
  GetTranscriptionJobCommand,
  StartTranscriptionJobCommand,
  TranscribeClient,
} from "@aws-sdk/client-transcribe";
import type { TranscriptionProvider } from "@/integrations/onboarding-providers";

export class AwsTranscriptionProvider implements TranscriptionProvider {
  async transcribe(): Promise<string> {
    const region = process.env.AWS_REGION;
    const mediaUri = process.env.AWS_TRANSCRIBE_INPUT_S3_URI;
    if (!region || !mediaUri) {
      throw new Error("AWS Transcribe is not configured. Use the text fallback or add the required environment variables.");
    }

    const client = new TranscribeClient({ region });
    const jobName = `pramaan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await client.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      Media: { MediaFileUri: mediaUri },
      LanguageCode: "en-IN",
    }));

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const result = await client.send(new GetTranscriptionJobCommand({ TranscriptionJobName: jobName }));
      const status = result.TranscriptionJob?.TranscriptionJobStatus;
      if (status === "COMPLETED") {
        const transcriptUri = result.TranscriptionJob?.Transcript?.TranscriptFileUri;
        if (!transcriptUri) throw new Error("Transcription completed without a transcript file.");
        const response = await fetch(transcriptUri);
        if (!response.ok) throw new Error("Could not read the AWS transcription result.");
        const json = await response.json() as { results?: { transcripts?: Array<{ transcript?: string }> } };
        return json.results?.transcripts?.[0]?.transcript?.trim() ?? "";
      }
      if (status === "FAILED") throw new Error("AWS Transcribe could not process the recording.");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error("AWS Transcription timed out.");
  }
}
