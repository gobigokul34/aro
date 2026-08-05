import { useEffect, useRef, useState } from "react";
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiRotateCcw } from "react-icons/fi";
import { formatDuration } from "../utils/analytics";

export default function AudioPlayer({ src, onTimeUpdate, externalSeekTime, className = "" }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Handle external seek requests (e.g. clicking on the Amplitude Envelope graph)
  useEffect(() => {
    if (externalSeekTime !== undefined && externalSeekTime !== null && audioRef.current) {
      audioRef.current.currentTime = externalSeekTime;
      setCurrentTime(externalSeekTime);
    }
  }, [externalSeekTime]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current || !src) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.error("Audio play error:", err));
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      const nextTime = Math.max(0, audioRef.current.currentTime - 5);
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
      onTimeUpdate?.(nextTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = () => {
    const rates = [1, 1.25, 1.5, 0.8];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  if (!src) {
    return (
      <div className={`custom-audio-player is-empty ${className}`}>
        <span className="player-empty-label">AUDIO PLAYBACK READY FOR YOUR NEXT TAKE</span>
      </div>
    );
  }

  return (
    <div className={`custom-audio-player ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || 0);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const time = audioRef.current.currentTime;
            setCurrentTime(time);
            onTimeUpdate?.(time);
          }
        }}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      <div className="player-left-controls">
        <button
          type="button"
          className="player-btn play-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
        <button
          type="button"
          className="player-btn rewind-btn"
          onClick={handleRewind}
          title="Jump back 5s"
          aria-label="Jump back 5 seconds"
        >
          <FiRotateCcw />
        </button>
      </div>

      <div className="player-timeline">
        <span className="time-display current">{formatDuration(currentTime)}</span>
        <div className="track-wrapper">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="player-scrubber"
            aria-label="Audio playback progress slider"
          />
          <div
            className="track-progress"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
        <span className="time-display total">{formatDuration(duration)}</span>
      </div>

      <div className="player-right-controls">
        <button
          type="button"
          className="player-btn speed-btn"
          onClick={handleSpeedChange}
          title="Playback speed"
        >
          {playbackRate}x
        </button>
        <button
          type="button"
          className="player-btn volume-btn"
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
          aria-label="Toggle mute"
        >
          {isMuted ? <FiVolumeX /> : <FiVolume2 />}
        </button>
      </div>
    </div>
  );
}
