import type { SpeechProvider } from "@/integrations/onboarding-providers";

const voiceIds: Record<string, string> = {
  EN: "21m00Tcm4TlvDq8ikWAM",
  "हिन्दी": "21m00Tcm4TlvDq8ikWAM",
  "ಕನ್ನಡ": "21m00Tcm4TlvDq8ikWAM",
};

export class ElevenLabsSpeechProvider implements SpeechProvider {
  async synthesize(text: string, language: string): Promise<Blob | null> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const configuredVoice = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey) throw new Error("ElevenLabs is not configured.");

    const voiceId = configuredVoice || voiceIds[language] || voiceIds.EN;
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
    });
    if (!response.ok) throw new Error("ElevenLabs playback could not be generated.");
    return await response.blob();
  }
}
