"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Circle, RotateCcw, Square } from "lucide-react";
import { assessmentText as t } from "@/data/skillAssessments";
import { assessmentId, browserEvidenceStore } from "@/services/assessmentService";
import { ListenButton } from "@/components/ListenButton";
import styles from "./Assessment.module.css";

export function CameraRecorder({ skill, language, onSaved }: { skill: string; language: string; onSaved: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const id = assessmentId(skill);
  const voiceGuidance = language === "हिन्दी" ? "पहले कैमरा शुरू करें। फिर अपना काम दिखाने के लिए रिकॉर्डिंग शुरू करें। काम पूरा होने पर रोकें और वीडियो देखें।" : language === "ಕನ್ನಡ" ? "ಮೊದಲು ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ. ನಂತರ ನಿಮ್ಮ ಕೆಲಸ ತೋರಿಸಲು ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ. ಮುಗಿದಾಗ ನಿಲ್ಲಿಸಿ ಮತ್ತು ವೀಡಿಯೊ ನೋಡಿ." : "First start the camera. Then start recording to show your work. Stop when you are done and review the video.";

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((track) => track.stop()); if (previewUrl) URL.revokeObjectURL(previewUrl); if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [previewUrl]);

  async function start() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setError(t("Camera and microphone are not available here.", language)); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setReady(true);
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder; chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        if (!blob.size) { setError(t("Could not save video. Check device storage.", language)); return; }
        const url = URL.createObjectURL(blob); setPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
        void browserEvidenceStore.save(id, blob).then(onSaved).catch(() => setError(t("Could not save video. Check device storage.", language)));
      };
      recorder.start(1000); setDuration(0); setRecording(true);
      timerRef.current = window.setInterval(() => setDuration((value) => value + 1), 1000);
    } catch { setError(t("Allow camera and microphone access to record.", language)); }
  }

  function stop() { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); }

  async function retake() {
    if (recording) stop();
    streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; setReady(false);
    if (videoRef.current) videoRef.current.srcObject = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(""); setDuration(0);
    await browserEvidenceStore.remove(id);
  }

  function formatTime(value: number) { return `${Math.floor(value / 60).toString().padStart(2, "0")}:${(value % 60).toString().padStart(2, "0")}`; }

  return <section className={styles.cameraCard}>
    <ListenButton language={language as "EN" | "हिन्दी" | "ಕನ್ನಡ"} text={voiceGuidance} className={styles.listen}>{t("Listen", language)}</ListenButton>
    <div className={styles.videoFrame}>
      {previewUrl ? <video src={previewUrl} controls playsInline aria-label={t("Play evidence", language)} /> : <video ref={videoRef} autoPlay muted playsInline aria-label={t("Camera preview", language)}>{!ready && <track kind="captions" />}</video>}
      {!ready && !previewUrl && <div className={styles.cameraHint}><Camera size={32}/><p>{t("Camera preview", language)}</p></div>}
      {recording && <span className={styles.recordDot}><i/>{t("Recording", language)}</span>}
    </div>
    <div className={styles.controls}>
      {!recording && !previewUrl && <button type="button" className={styles.primary} onClick={() => void start()}><Camera size={19}/>{t(ready ? "Start recording" : "Start camera", language)}</button>}
      {recording && <button type="button" className={styles.danger} onClick={stop}><Square size={17} fill="currentColor"/>{t("Stop", language)}</button>}
      {previewUrl && <><button type="button" className={styles.secondary} onClick={() => void retake()}><RotateCcw size={17}/>{t("Retake", language)}</button><span className={styles.success}>{t("Video saved", language)}</span></>}
      {(recording || previewUrl) && <span className={styles.duration}><Circle size={12} fill={recording ? "#e84e57" : "#8998aa"}/>{formatTime(duration)}</span>}
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <p className={styles.note}>{t("Evidence stays on this device in this demo.", language)}</p>
  </section>;
}
