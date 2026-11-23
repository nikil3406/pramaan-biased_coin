"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { deleteIntroductionAudio, loadIntroductionAudio, saveIntroductionAudio } from "@/services/profileService";

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<{ blob: Blob; url: string } | null>(null);
  const [message, setMessage] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const discardOnStopRef = useRef(false);

  useEffect(() => {
    let live = true;
    void loadIntroductionAudio().then((recordingBlob) => {
      if (live && recordingBlob) { setAudioFile({ blob: recordingBlob, url: URL.createObjectURL(recordingBlob) }); setSaved(true); }
    }).catch(() => undefined);
    return () => { live = false; };
  }, []);

  useEffect(() => {
    return () => { if (audioFile) URL.revokeObjectURL(audioFile.url); };
  }, [audioFile]);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setDuration((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const start = useCallback(async () => {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMessage("Recording is not supported on this device.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      discardOnStopRef.current = false;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (discardOnStopRef.current) { discardOnStopRef.current = false; return; }
        const recordedAudio = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (recordedAudio.size === 0) { setMessage("I couldn't hear that. Try again or type your answer."); return; }
        setAudioFile({ blob: recordedAudio, url: URL.createObjectURL(recordedAudio) });
        setSaved(false);
        setSaving(true);
        void saveIntroductionAudio(recordedAudio).then(() => setSaved(true)).catch(() => setMessage("Recording couldn't be saved. Check device storage.")).finally(() => setSaving(false));
      };
      recorder.start();
      setDuration(0);
      setSaved(false);
      setRecording(true);
      return true;
    } catch {
      setMessage("Microphone permission is needed to record.");
      setRecording(false);
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecording(false);
  }, []);

  const remove = useCallback(async () => {
    if (recorderRef.current?.state === "recording") {
      discardOnStopRef.current = true;
      recorderRef.current.stop();
    }
    setRecording(false);
    setAudioFile(null);
    setSaved(false);
    setDuration(0);
    setMessage("");
    try { await deleteIntroductionAudio(); } catch { setMessage("Recording couldn't be saved. Check device storage."); }
  }, []);

  return { recording, saving, saved, duration, audioBlob: audioFile?.blob ?? null, audioUrl: audioFile?.url ?? "", message, start, stop, remove };
}
