import { useEffect, useRef, useState } from "react";
import { uploadAudio } from "../api/audioApi";

function readAudioDuration(url) {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => resolve(0);
  });
}

export default function useRecorder({ metadata = {}, onComplete } = {}) {
  const [recording, setRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("");
  const [duration, setDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [audioStream, setAudioStream] = useState(null);

  const mediaRecorder = useRef(null);
  const streamRef = useRef(null);
  const chunks = useRef([]);
  const startedAt = useRef(0);
  const activeUrl = useRef(null);
  const pausedAt = useRef(0);
  const totalPausedMs = useRef(0);
  const pauseCountRef = useRef(0);
  const metadataRef = useRef(metadata);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    metadataRef.current = metadata;
    completeRef.current = onComplete;
  }, [metadata, onComplete]);

  useEffect(() => () => {
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const setPreviewUrl = (url) => {
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    activeUrl.current = url;
    setAudioURL(url);
  };

  const processAudio = async (audio, knownDuration = 0, pauses = 0) => {
    setIsAnalyzing(true);
    setError("");
    setTranscript("");
    setLanguage("");

    try {
      const result = await uploadAudio(audio, { ...metadataRef.current, pauseCount: pauses });
      const session = {
        transcript: result.transcript || "",
        language: result.language || "Detected automatically",
        duration: knownDuration || Number(result.duration) || 0,
        pauseCount: pauses,
      };

      setTranscript(session.transcript);
      setLanguage(session.language);
      setDuration(session.duration);
      await completeRef.current?.({ ...session, audio });
      return session;
    } catch (requestError) {
      console.error(requestError);
      setError("We couldn’t reach the analysis service. Your audio is safe in the player below—try sending it again when the service is online.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Audio capture is not available in this browser. Try uploading an audio file instead.");
      return;
    }

    try {
      setError("");
      setTranscript("");
      setLanguage("");
      setDuration(0);
      setPauseCount(0);
      pauseCountRef.current = 0;
      totalPausedMs.current = 0;
      pausedAt.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];
      startedAt.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };

      recorder.onerror = () => {
        setError("The recording was interrupted. Please try another take.");
        setRecording(false);
        setIsPaused(false);
      };

      recorder.onstop = async () => {
        if (pausedAt.current) {
          totalPausedMs.current += Date.now() - pausedAt.current;
          pausedAt.current = 0;
        }
        const blob = new Blob(chunks.current, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        const recordedDuration = Math.max(1, (Date.now() - startedAt.current - totalPausedMs.current) / 1000);
        setDuration(recordedDuration);
        stream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
        await processAudio(blob, recordedDuration, pauseCountRef.current);
      };

      recorder.start(250);
      setRecording(true);
    } catch (recordingError) {
      console.error(recordingError);
      setAudioStream(null);
      setError("Microphone permission was not granted. You can still upload a clip for feedback.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current?.state !== "recording") return;
    pausedAt.current = Date.now();
    pauseCountRef.current += 1;
    setPauseCount(pauseCountRef.current);
    mediaRecorder.current.pause();
    setIsPaused(true);
  };

  const resumeRecording = () => {
    if (mediaRecorder.current?.state !== "paused") return;
    totalPausedMs.current += Date.now() - pausedAt.current;
    pausedAt.current = 0;
    mediaRecorder.current.resume();
    setIsPaused(false);
  };

  const stopRecording = () => {
    if (!["recording", "paused"].includes(mediaRecorder.current?.state)) return;
    mediaRecorder.current.stop();
    setRecording(false);
    setIsPaused(false);
  };

  const analyzeFile = async (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const fileDuration = await readAudioDuration(url);
    setDuration(fileDuration);
    setPauseCount(0);
    await processAudio(file, fileDuration, 0);
  };

  return {
    recording,
    isPaused,
    pauseCount,
    audioStream,
    audioURL,
    transcript,
    language,
    duration,
    isAnalyzing,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    analyzeFile,
  };
}
