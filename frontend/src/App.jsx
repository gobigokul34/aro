import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCheck,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiDownload,
  FiMenu,
  FiMic,
  FiMoreHorizontal,
  FiPause,
  FiPlay,
  FiLogOut,
  FiCopy,
  FiTrash2,
  FiUsers,
  FiUser,
  FiBarChart2,
  FiUpload,
  FiX,
  FiActivity,
  FiSearch,
  FiCalendar,
} from "react-icons/fi";
import useRecorder from "./hooks/useRecorder";
import { formatDuration } from "./utils/analytics";
import { buildReport } from "./utils/report";
import { deleteAudioBlob, getAudioBlob, saveAudioBlob } from "./utils/audioStore";
import AudioPlayer from "./components/AudioPlayer";
import { extractAmplitudeEnvelope, generateSyntheticEnvelope } from "./utils/amplitudeEnvelope";
import {
  clearActiveUser,
  createRoom,
  createUser,
  getActiveUser,
  getLeaderRoom,
  getRoom,
  getRoomSessions,
  getUserSessions,
  joinRoom,
  leaveRoom,
  saveActiveUser,
  saveSession,
  subscribeToStore,
  deleteSession,
} from "./utils/roomStore";

const jumpTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function TinyMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M6 20.3C10.9 20.3 14.8 16.4 14.8 11.5V7.4H23v4.1c0 4.9 3.9 8.8 8.8 8.8H33v8.3h-1.2c-4.9 0-8.8-3.9-8.8-8.8v-1.2h-8.2v1.2c0 4.9-3.9 8.8-8.8 8.8H4.8v-8.3H6Z" fill="currentColor" />
    </svg>
  );
}

function Header({ open, onToggle, onStudio, user, onLogout }) {
  return (
    <>
      <header className="site-header">
        <button className="brand" onClick={() => jumpTo("top")} aria-label="Return to the top">
          <TinyMark />
          <span>ORA</span>
        </button>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <button onClick={() => jumpTo("method")}>The method</button>
          <button onClick={() => jumpTo("studio")}>Practice studio</button>
          <button onClick={() => jumpTo("archive")}>Voice notes</button>
        </nav>

        <div className="account-actions">
          <button className="account-chip" onClick={() => jumpTo("archive")} title="Open your history">
            <FiUser /><span><b>{user.name}</b><small>{user.role}</small></span>
          </button>
          <button className="header-cta" onClick={onStudio}>
            Enter studio <FiArrowUpRight />
          </button>
          <button className="logout-button" onClick={onLogout} aria-label="Log out"><FiLogOut /></button>
        </div>
        <button className="menu-button" onClick={onToggle} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <button onClick={() => { jumpTo("method"); onToggle(); }}>The method <FiArrowUpRight /></button>
            <button onClick={() => { jumpTo("studio"); onToggle(); }}>Practice studio <FiArrowUpRight /></button>
            <button onClick={() => { jumpTo("archive"); onToggle(); }}>Voice notes <FiArrowUpRight /></button>
            <button onClick={onLogout}>Log out <FiLogOut /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function HeroSculpture() {
  return (
    <div className="hero-sculpture" data-hero-art aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <span className="sticker sticker-one">LISTEN<br />CLOSER</span>
      <span className="sticker sticker-two">01</span>
      <svg viewBox="0 0 570 610" role="presentation">
        <defs>
          <linearGradient id="glassBlue" x1="106" y1="100" x2="420" y2="468" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1736F5" />
            <stop offset="0.48" stopColor="#6D82FF" />
            <stop offset="1" stopColor="#E5E9FF" />
          </linearGradient>
          <linearGradient id="warmReflect" x1="298" y1="178" x2="506" y2="386" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF7DF" />
            <stop offset="0.42" stopColor="#F9A88D" />
            <stop offset="1" stopColor="#FF5B43" />
          </linearGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="16" />
            <feOffset dy="17" />
            <feComponentTransfer><feFuncA type="linear" slope=".23" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <ellipse cx="287" cy="535" rx="181" ry="28" fill="#242B25" opacity=".23" />
        <path d="M188 234c-47-9-101 18-121 65-22 51 1 109 50 132 51 24 111 1 134-50" stroke="#FF5139" strokeWidth="31" strokeLinecap="round" />
        <path d="M149 209c-43-8-90 17-109 58-21 46-1 101 45 124" stroke="#F9F1D8" strokeWidth="12" strokeLinecap="round" />
        <g filter="url(#softShadow)">
          <path d="M186 190c35-46 89-73 147-73h67v319h-74c-61 0-115-30-144-76l-40-64 44-106Z" fill="url(#glassBlue)" />
          <path d="M388 118h60c35 0 64 28 64 64v190c0 35-29 64-64 64h-60V118Z" fill="url(#warmReflect)" />
          <path d="M193 203c36-42 83-62 143-62h42" stroke="#EEF0FF" strokeWidth="11" strokeLinecap="round" opacity=".72" />
          <path d="M226 378c32 19 65 28 106 28h45" stroke="#1120AB" strokeWidth="10" strokeLinecap="round" opacity=".48" />
          <path d="M432 143c28 11 47 33 47 61v130" stroke="#FFF8E6" strokeWidth="12" strokeLinecap="round" opacity=".63" />
        </g>
        <circle cx="419" cy="275" r="45" fill="#0B1422" />
        <path d="M403 275h31M419 259v31" stroke="#FDE8B5" strokeWidth="6" strokeLinecap="round" />
        <path d="M275 75v47M252 98h47" stroke="#1938F5" strokeWidth="10" strokeLinecap="round" />
        <circle cx="139" cy="119" r="16" fill="#FF5139" />
        <path d="m439 468 22 24 31-49" stroke="#1835F4" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Hero({ onStudio }) {
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reduceMotion) return undefined;
    const context = gsap.context(() => {
      gsap.from("[data-hero-line]", {
        yPercent: 115,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.1,
        delay: 0.16,
      });
      gsap.from("[data-hero-art]", { scale: 0.86, rotation: -9, opacity: 0, duration: 1.35, ease: "power3.out", delay: 0.2 });
      gsap.to(".orbit", { rotate: 360, duration: 25, repeat: -1, ease: "none" });
    }, heroRef);
    return () => context.revert();
  }, [reduceMotion]);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <div className="hero-grid" />
      <div className="hero-meta hero-reveal">
        <span className="eyebrow"><i /> PERSONAL SPEAKING INTELLIGENCE</span>
        <span>EST. 2024 — EVERYWHERE</span>
      </div>
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="hero-kicker">You already have something to say.</p>
          <h1>
            <span className="title-mask"><span data-hero-line>YOUR</span></span>
            <span className="title-mask title-offset"><span data-hero-line>VOICE <em>HOLDS</em></span></span>
            <span className="title-mask"><span data-hero-line>THE ROOM.</span></span>
          </h1>
          <div className="hero-bottom-copy">
            <p>ORA turns a practice run into a clear next move. Speak naturally. See what lands. Keep your momentum.</p>
            <button className="round-action" onClick={onStudio} aria-label="Start a practice session"><FiArrowDownLeft /></button>
          </div>
        </div>
        <HeroSculpture />
      </div>
      <div className="hero-rail">
        <span>FOR PITCHES</span><b /> <span>FOR ROOMS</span><b /> <span>FOR THE MOMENT BEFORE</span>
        <span className="rail-count">( 01 — 04 )</span>
      </div>
    </section>
  );
}

function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((item) => <span key={item}>PRACTICE OUT LOUD <i>✳</i> MAKE THE ROOM LEAN IN <i>✳</i> PRACTICE OUT LOUD <i>✳</i> MAKE THE ROOM LEAN IN <i>✳</i></span>)}
      </div>
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Manifesto() {
  return (
    <section className="manifesto" id="method">
      <Reveal className="section-number"><span>01</span><span>THE ORA METHOD</span></Reveal>
      <Reveal className="manifesto-heading">
        <p>Not another script.</p>
        <h2>LESS <span>NOISE.</span><br />MORE <i>YOU.</i></h2>
      </Reveal>
      <div className="manifesto-grid">
        <Reveal delay={0.08}><p className="manifesto-note">Most advice wants you to sound polished. We care that you sound present.</p></Reveal>
        <Reveal delay={0.16}><p className="manifesto-body">ORA listens for the signals hiding in your own delivery: speed, breathing room, filler words, and clarity. Then it gives you a tiny, practical adjustment worth repeating.</p></Reveal>
        <Reveal className="method-list" delay={0.22}>
          <span><b>01</b> Record the rough version <FiArrowUpRight /></span>
          <span><b>02</b> Find one true signal <FiArrowUpRight /></span>
          <span><b>03</b> Try the next take lighter <FiArrowUpRight /></span>
        </Reveal>
      </div>
    </section>
  );
}

function LiveWaveform({ stream, isAnalyzing, audioURL, audioBlob, duration, onSeek }) {
  const canvasRef = useRef(null);
  const [envelopeData, setEnvelopeData] = useState([]);
  const [playbackTime, setPlaybackTime] = useState(0);

  // Extract amplitude envelope when audio Blob/URL is ready
  useEffect(() => {
    if (audioBlob || audioURL) {
      extractAmplitudeEnvelope(audioBlob || audioURL, 80).then((points) => {
        setEnvelopeData(points);
      });
    } else {
      setEnvelopeData(generateSyntheticEnvelope(duration || 10, 0, 80));
    }
  }, [audioBlob, audioURL, duration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioContext;
    let analyser;
    let source;
    let animationFrame;
    let resizeObserver;
    let data;
    let width = 0;
    let height = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawAmplitudeEnvelope = () => {
      context.clearRect(0, 0, width, height);

      const center = height * 0.5;

      // Draw background dB grid lines & labels
      context.strokeStyle = "rgba(242, 237, 223, .12)";
      context.lineWidth = 1;
      context.setLineDash([3, 5]);

      [0.18, 0.5, 0.82].forEach((ratio) => {
        const y = height * ratio;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      });
      context.setLineDash([]);

      const points = envelopeData.length > 0 ? envelopeData : generateSyntheticEnvelope(duration || 10, 0, 80);
      const pointWidth = width / Math.max(1, points.length);

      // Draw peak amplitude envelope outline & RMS shaded region
      context.beginPath();
      context.moveTo(0, center);

      points.forEach((p, idx) => {
        const x = idx * pointWidth;
        const peakHeight = p.peak * (height * 0.42);
        const y = center - peakHeight;
        if (idx === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });

      // Bottom mirror curve for symmetrical amplitude envelope visual
      for (let idx = points.length - 1; idx >= 0; idx--) {
        const p = points[idx];
        const x = idx * pointWidth;
        const peakHeight = p.peak * (height * 0.42);
        const y = center + peakHeight;
        context.lineTo(x, y);
      }

      context.closePath();

      // Shaded amplitude envelope fill
      const envFill = context.createLinearGradient(0, 0, 0, height);
      envFill.addColorStop(0, "rgba(215, 237, 116, 0.45)");
      envFill.addColorStop(0.5, "rgba(242, 237, 223, 0.15)");
      envFill.addColorStop(1, "rgba(255, 90, 69, 0.45)");
      context.fillStyle = envFill;
      context.fill();

      // Peak envelope top border stroke
      context.beginPath();
      points.forEach((p, idx) => {
        const x = idx * pointWidth;
        const peakHeight = p.peak * (height * 0.42);
        const y = center - peakHeight;
        if (idx === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.lineWidth = 2;
      context.strokeStyle = "#D7ED74";
      context.stroke();

      // Draw silence gap indicators
      points.forEach((p, idx) => {
        if (p.isPause) {
          const x = idx * pointWidth;
          context.fillStyle = "rgba(255, 90, 69, 0.25)";
          context.fillRect(x, 10, pointWidth, height - 20);
        }
      });

      // Draw audio playback cursor line if audio is playing/scrubbing
      if (duration > 0 && playbackTime > 0) {
        const playX = (playbackTime / duration) * width;
        context.strokeStyle = "#FF5A45";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(playX, 0);
        context.lineTo(playX, height);
        context.stroke();

        // Cursor head indicator
        context.fillStyle = "#FF5A45";
        context.beginPath();
        context.arc(playX, 10, 4, 0, Math.PI * 2);
        context.fill();
      }
    };

    const drawLiveStream = () => {
      animationFrame = requestAnimationFrame(drawLiveStream);
      if (!analyser || !data) {
        drawAmplitudeEnvelope();
        return;
      }

      analyser.getByteTimeDomainData(data);
      context.clearRect(0, 0, width, height);

      const center = height * 0.5;
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#D7ED74");
      gradient.addColorStop(0.48, "#F2EDDF");
      gradient.addColorStop(1, "#FF5A45");

      context.beginPath();
      for (let index = 0; index < data.length; index += 1) {
        const x = (index / (data.length - 1)) * width;
        const y = ((data[index] - 128) / 128) * (height * 0.44) + center;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.lineWidth = 3;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.strokeStyle = gradient;
      context.shadowBlur = 12;
      context.shadowColor = "rgba(215, 237, 116, .36)";
      context.stroke();
      context.shadowBlur = 0;

      context.lineTo(width, center);
      context.lineTo(0, center);
      context.closePath();
      const fill = context.createLinearGradient(0, 0, 0, height);
      fill.addColorStop(0, "rgba(215, 237, 116, .22)");
      fill.addColorStop(1, "rgba(32, 56, 231, 0)");
      context.fillStyle = fill;
      context.fill();
    };

    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    if (stream && AudioContext) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.74;
      data = new Uint8Array(analyser.fftSize);
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContext.resume();
      drawLiveStream();
    } else {
      drawAmplitudeEnvelope();
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      source?.disconnect();
      audioContext?.close();
    };
  }, [stream, envelopeData, playbackTime, duration]);

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !duration || !onSeek) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = Math.max(0, Math.min(duration, (clickX / rect.width) * duration));
    setPlaybackTime(seekTime);
    onSeek(seekTime);
  };

  return (
    <div className={`live-waveform ${stream ? "is-live" : ""} ${isAnalyzing ? "is-analyzing" : ""}`}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        title={audioURL ? "Click anywhere on the Amplitude Envelope to jump audio playback" : ""}
        aria-label={stream ? "Live microphone amplitude envelope" : "Amplitude envelope waveform"}
        role="img"
      />
      {!stream && !audioURL && <span>{isAnalyzing ? "ANALYSING AMPLITUDE ENVELOPE" : "THE AMPLITUDE ENVELOPE WILL APPEAR HERE"}</span>}
    </div>
  );
}

function ListeningSummary({ report, empty = false }) {
  return (
    <div className="listening-summary">
      <span>AMPLITUDE ENVELOPE MAP</span>
      <strong>{empty ? "Waiting for your voice" : "Your speech, in context."}</strong>
      <p>{empty ? "Record a take and we’ll map the shape of your delivery." : `${report.words} words across ${report.phrases} thought${report.phrases === 1 ? "" : "s"}.`}</p>
    </div>
  );
}

function downloadFile(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function reportText(report, transcript) {
  return `ORA / SPEECH LISTENING MAP\n\nLANGUAGE: ${report.language}\nTIME: ${formatDuration(report.duration || 0)}\nWORDS: ${report.words}\nPACE: ${report.wpm || "—"} WPM\nFILLER WORDS: ${report.fillers}\nPAUSES: ${report.pauseCount}\nAVERAGE PHRASE: ${report.wordsPerPhrase || "—"} WORDS\nPEAK DYNAMICS: ${report.peakDb || "—"}\nRMS ENERGY: ${report.rmsDb || "—"}\nDYNAMIC RANGE: ${report.dynamicRangeDb || "—"}\n\nNEXT FOCUS — ${report.focus.title.toUpperCase()}\n${report.focus.detail}\nCue: ${report.focus.cue}\n\nTRANSCRIPT\n${transcript}`;
}

function ReportGraph({ report, compact = false, onSeek }) {
  const envelopePoints = report?.envelopePoints || generateSyntheticEnvelope(report?.duration || 10, report?.pauseCount || 0, 60);
  const width = 420;
  const height = compact ? 130 : 170;
  const padding = compact ? 18 : 28;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Build Amplitude Envelope Path
  const pointsCount = envelopePoints.length;
  const pointGap = pointsCount > 1 ? graphWidth / (pointsCount - 1) : graphWidth;

  const upperPoints = envelopePoints.map((item, index) => {
    const x = padding + index * pointGap;
    const y = height - padding - item.peak * graphHeight;
    return `${x},${y}`;
  });

  const polylineString = upperPoints.join(" ");
  const polygonPoints = `${padding},${height - padding} ${polylineString} ${width - padding},${height - padding}`;

  const handleGraphClick = (e) => {
    if (!onSeek || !report?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * report.duration);
  };

  return (
    <div className={`report-graph ${compact ? "is-compact" : ""}`} onClick={handleGraphClick} style={{ cursor: onSeek ? "pointer" : "default" }}>
      <div className="graph-label">
        <span><FiActivity /> AMPLITUDE ENVELOPE</span>
        <span>DYNAMIC SIGNAL CONTOUR</span>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Amplitude envelope graph showing volume dynamics and peaks over time">
        <defs>
          <linearGradient id="envelopeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D7ED74" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2038E7" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal dB reference lines */}
        {[0.25, 0.5, 0.75].map((line) => (
          <line key={line} x1={padding} y1={height * line} x2={width - padding} y2={height * line} stroke="rgba(242, 237, 223, 0.2)" strokeDasharray="3 5" />
        ))}

        {/* Amplitude Envelope Shaded Fill */}
        <polygon points={polygonPoints} fill="url(#envelopeGrad)" />

        {/* Peak Amplitude Envelope Line */}
        <polyline points={polylineString} fill="none" stroke="#D7ED74" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Highlights for peak dynamic moments */}
        {envelopePoints.map((item, index) => {
          if (item.peak > 0.7 || item.isPause) {
            const x = padding + index * pointGap;
            const y = height - padding - item.peak * graphHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={item.isPause ? "3" : "4"}
                fill={item.isPause ? "#FF5A45" : "#D7ED74"}
                stroke="#10151B"
                strokeWidth="1.5"
              />
            );
          }
          return null;
        })}
      </svg>

      <div className="speech-map-legend">
        <span>
          <b>PEAK DYNAMICS</b>
          <small>{report?.peakDb || "-1.2 dB"}</small>
        </span>
        <span>
          <b>RMS ENERGY</b>
          <small>{report?.rmsDb || "-14.8 dB"}</small>
        </span>
        <span>
          <b>DYNAMIC RANGE</b>
          <small>{report?.dynamicRangeDb || "24 dB"}</small>
        </span>
        <span>
          <b>PAUSE SILENCES</b>
          <small>{report?.pauseCount || 0} marked</small>
        </span>
      </div>
    </div>
  );
}

function SessionAudio({ audioKey }) {
  const [source, setSource] = useState("");

  useEffect(() => {
    let url = "";
    if (audioKey) {
      getAudioBlob(audioKey).then((blob) => {
        if (!blob) return;
        url = URL.createObjectURL(blob);
        setSource(url);
      }).catch(() => setSource(""));
    }
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [audioKey]);

  return <AudioPlayer src={source} className="session-audio-player" />;
}

function RoomControl({ user, room, roomSessions, onRoomChange, onUserChange }) {
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = () => {
    const newRoom = createRoom(user);
    onRoomChange(newRoom);
    setMessage("Your room is ready to receive takes.");
  };
  const handleJoin = () => {
    const result = joinRoom(user, roomCode);
    if (result.error) { setMessage(result.error); return; }
    onUserChange(result.user);
    onRoomChange(result.room);
    setMessage(`You’re in ${result.room.leaderName}’s room.`);
  };
  const handleLeave = () => {
    const updatedUser = leaveRoom(user);
    onUserChange(updatedUser);
    onRoomChange(null);
    setMessage("You left the room. New takes will stay private.");
  };
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(room.code); setMessage("Room code copied."); } catch { setMessage(`Share this code: ${room.code}`); }
  };

  if (user.role === "leader") {
    return <div className="room-control leader-room">
      <div className="room-control-title"><span><FiUsers /> LEADER ROOM</span><small>YOU RECEIVE AUDIO, TRANSCRIPTS & REPORTS</small></div>
      {room ? <div className="room-active"><div><span>ROOM CODE</span><b>{room.code}</b><button onClick={copyCode}><FiCopy /> COPY</button></div><p><strong>{roomSessions.length}</strong> take{roomSessions.length === 1 ? "" : "s"} received</p></div> : <div className="room-empty"><p>Create a private room, then give its six-character code to your speakers.</p><button onClick={handleCreate}>Create a room <FiArrowUpRight /></button></div>}
      {message && <small className="room-message">{message}</small>}
    </div>;
  }

  return <div className="room-control participant-room">
    <div className="room-control-title"><span><FiUsers /> SPEAKER ROOM</span><small>SEND THIS TAKE TO A LEADER</small></div>
    {room ? <div className="room-active"><div><span>SENDING TO</span><b>{room.code}</b><small>{room.leaderName.toUpperCase()}’S ROOM</small></div><button className="leave-room" onClick={handleLeave}>Leave room <FiX /></button></div> : <div className="room-join"><input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} placeholder="ROOM CODE" aria-label="Room code" /><button onClick={handleJoin}>Join room <FiArrowUpRight /></button></div>}
    {message && <small className="room-message">{message}</small>}
  </div>;
}

function RoomInbox({ room, sessions }) {
  const [selected, setSelected] = useState(null);
  if (!room) return null;
  return <Reveal className="room-inbox" delay={0.08}>
    <div className="inbox-heading"><span className="eyebrow"><i /> ROOM {room.code} / LEADER INBOX</span><p>Every speaker’s audio, transcript, and focused report arrives here.</p></div>
    {sessions.length === 0 ? <div className="inbox-empty">THE ROOM IS QUIET. A SPEAKER’S COMPLETED TAKE WILL ARRIVE HERE.</div> : <div className="inbox-layout">
      <div className="inbox-list">{sessions.map((session) => <button key={session.id} className={selected?.id === session.id ? "is-selected" : ""} onClick={() => setSelected(session)}><span>{session.userName}</span><b>{session.report?.focus?.title || "Focused report"}</b><small>{new Date(session.createdAt).toLocaleDateString()} / {formatDuration(session.duration)}</small><FiChevronRight /></button>)}</div>
      <div className="inbox-detail">{selected ? <SessionDetail session={selected} /> : <p>Select a take to hear it and review its report.</p>}</div>
    </div>}
  </Reveal>;
}

function SessionDetail({ session }) {
  const report = session.report || buildReport(session);
  return (
    <div className="session-detail">
      <div className="detail-head">
        <span>{session.userName || "SPEAKER TAKE"}</span>
        <strong>{report.focus.title}</strong>
      </div>
      <SessionAudio audioKey={session.audioKey} />
      <div className="focus-note">
        <span>NEXT FOCUS & CUE</span>
        <p>{report.focus.detail}</p>
        <b>Cue: {report.focus.cue}</b>
      </div>
      <ReportGraph report={report} compact />
      <details className="transcript-details" open>
        <summary>Read transcript ({report.words} words) <FiChevronRight /></summary>
        <p className="detail-transcript-text">{session.transcript || "No transcript recorded for this take."}</p>
      </details>
    </div>
  );
}

function Studio({ user, onUserChange }) {
  const inputRef = useRef(null);
  const [seekTime, setSeekTime] = useState(null);
  const [room, setRoom] = useState(() => user.role === "leader" ? getLeaderRoom(user.id) : getRoom(user.activeRoomCode));
  const [roomSessions, setRoomSessions] = useState([]);

  const refreshRoom = useCallback(() => {
    const nextRoom = user.role === "leader" ? getLeaderRoom(user.id) : getRoom(user.activeRoomCode);
    setRoom(nextRoom);
    setRoomSessions(nextRoom ? getRoomSessions(nextRoom.code) : []);
  }, [user]);

  useEffect(() => {
    refreshRoom();
    return subscribeToStore(refreshRoom);
  }, [refreshRoom]);

  const persistCompletedSession = useCallback(async (take) => {
    const report = buildReport(take);
    let audioKey = null;
    try { audioKey = await saveAudioBlob(take.audio); } catch (storageError) { console.error(storageError); }
    saveSession({
      id: `take-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      roomCode: user.role === "participant" ? user.activeRoomCode : null,
      audioKey,
      ...take,
      report,
    });
    refreshRoom();
  }, [refreshRoom, user]);

  const recorder = useRecorder({
    metadata: { roomCode: user.role === "participant" ? user.activeRoomCode : "", speaker: user.name, speakerRole: user.role },
    onComplete: persistCompletedSession,
  });
  const { recording, isPaused, pauseCount, audioStream, audioURL, transcript, language, duration, isAnalyzing, error, startRecording, pauseRecording, resumeRecording, stopRecording, analyzeFile } = recorder;
  const report = buildReport({ transcript, duration, language, pauseCount });
  const hasTake = Boolean(transcript);
  const status = recording ? (isPaused ? "RECORDING PAUSED" : "LISTENING LIVE") : isAnalyzing ? "BUILDING REPORT" : hasTake ? "TAKE COMPLETE" : "STUDIO READY";
  const downloadText = () => downloadFile(transcript, "ora-voice-note.txt", "text/plain;charset=utf-8");
  const downloadReport = () => downloadFile(reportText({ ...report, duration }, transcript), "ora-focused-report.txt", "text/plain;charset=utf-8");

  return <section className="studio-section" id="studio">
    <div className="studio-header"><Reveal className="section-number dark-number"><span>02</span><span>THE PRACTICE STUDIO</span></Reveal><Reveal delay={0.08}><p>{user.role === "leader" ? "Record privately, or open a room and receive each speaker’s complete take." : "Practice privately or send a finished take, report, and audio to your leader."}</p></Reveal></div>
    <RoomControl user={user} room={room} roomSessions={roomSessions} onRoomChange={setRoom} onUserChange={onUserChange} />
    <Reveal className="studio-shell" delay={0.05}>
      <div className="studio-topbar"><div className="studio-tabs"><span className="active">NEW SESSION</span><span>{user.role === "leader" ? "LEADER MODE" : room ? `ROOM ${room.code}` : "PRIVATE MODE"}</span></div><span className="studio-status"><i className={recording || isAnalyzing ? "is-pulsing" : ""} /> {status}</span><button className="dots" aria-label="More options"><FiMoreHorizontal /></button></div>
      <div className="studio-stage">
        <div className="record-column">
          <div className="record-caption"><span>YOUR TURN</span><span>{room && user.role === "participant" ? `ROOM ${room.code}` : "NO SCRIPT NEEDED"}</span></div>
          <button className={`record-button ${recording && !isPaused ? "is-recording" : ""}`} onClick={recording ? stopRecording : startRecording} aria-label={recording ? "Stop recording" : "Start recording"}><span>{recording ? <FiX /> : <FiMic />}</span><b>{recording ? "STOP" : "SPEAK"}</b></button>
          {recording && <button className="pause-control" onClick={isPaused ? resumeRecording : pauseRecording}>{isPaused ? <FiPlay /> : <FiPause />}{isPaused ? "Resume take" : "Pause take"}<span>{pauseCount} pause{pauseCount === 1 ? "" : "s"}</span></button>}
          <p className="record-instruction">{recording ? (isPaused ? "The take is paused. Resume when the next thought is ready." : "Let the thought arrive. Pause when you need a beat; stop when you are done.") : "Tap once, then let the first sentence be a little messy."}</p>
          <div className="upload-row"><button onClick={() => inputRef.current?.click()}><FiUpload /> Bring a recording</button><input ref={inputRef} type="file" accept="audio/*,.webm,.m4a" onChange={(event) => { analyzeFile(event.target.files?.[0]); event.target.value = ""; }} /><span>MP3, M4A, WAV, WEBM</span></div>
          {error && <p className="studio-error">{error}</p>}
        </div>
        <div className="signal-column">
          <div className="signal-header">
            <span>
              <span className="amplitude-envelope-badge">AMPLITUDE ENVELOPE</span> / {recording && !isPaused ? "MIC INPUT" : isPaused ? "PAUSED" : isAnalyzing ? "TAKE ANALYSIS" : audioURL ? "READY TO PLAY" : "READY"}
            </span>
            <span>{recording && !isPaused ? "LIVE" : formatDuration(duration || 0)}</span>
          </div>
          <LiveWaveform
            stream={recording && !isPaused ? audioStream : null}
            isAnalyzing={isAnalyzing}
            audioURL={audioURL}
            duration={duration}
            onSeek={(time) => setSeekTime(time)}
          />
          <div className="signal-foot">
            <span>0 dB (PEAK)</span>
            <span>AMPLITUDE ENVELOPE</span>
            <span>-40 dB (QUIET)</span>
          </div>
          <AudioPlayer src={audioURL} externalSeekTime={seekTime} />
        </div>
      </div>
      <div className={`insight-drawer ${hasTake ? "has-results" : ""}`}>
        <div className="transcript-panel"><div className="panel-label"><span>WHAT WE HEARD</span>{hasTake && <strong className="language-label">{language}</strong>}</div>{isAnalyzing ? <div className="analyzing-copy"><span>Listening for the useful bits</span><i /><i /><i /></div> : hasTake ? <p className="transcript-copy">{transcript}</p> : <p className="empty-transcript">Your words will collect here. This is a listening map, not a score — no pressure.</p>}</div>
        <div className="metrics-panel"><ListeningSummary report={report} empty={!hasTake} /><div className="metric-grid"><span><b>{duration ? formatDuration(duration) : "—"}</b><small>TIME</small></span><span><b>{hasTake ? report.words : "—"}</b><small>WORDS</small></span><span><b>{hasTake ? report.wpm || "—" : "—"}</b><small>PACE</small></span><span><b>{hasTake ? pauseCount : "—"}</b><small>PAUSES</small></span></div></div>
        {hasTake && <div className="result-actions"><span><FiCheck /> {room && user.role === "participant" ? `SENT TO ROOM ${room.code}` : "YOUR TAKE IS SAVED TO YOUR HISTORY"}</span><div><button onClick={downloadText}>Transcript <FiDownload /></button><button onClick={downloadReport}>Focused report <FiArrowUpRight /></button></div></div>}
      </div>
    </Reveal>
    {hasTake && <Reveal className="report-focus" delay={0.08}><div><span>YOUR NEXT FOCUS</span><h3>{report.focus.title}</h3><p>{report.focus.detail}</p><b>{report.focus.cue}</b></div><ReportGraph report={report} onSeek={(time) => setSeekTime(time)} /></Reveal>}
    <div className="coach-quote-wrap"><Reveal className="coach-quote"><span className="quote-index">A SMALL NOTE FOR YOUR NEXT TAKE</span><div><p>{hasTake ? report.focus.detail : "You don’t need to become a different kind of speaker. You only need a room where you can hear yourself."}</p><span>— ORA COACH</span></div></Reveal><Reveal className="take-stack" delay={0.1}><div className="take-card take-back"><span>PAUSE COUNT</span><b>{hasTake ? `${pauseCount} BEAT${pauseCount === 1 ? "" : "S"}` : "MAKE SPACE"}</b><small>Pauses are part of the delivery.</small></div><div className="take-card take-front"><span>YOUR LATEST</span><b>{hasTake ? "NEW VOICE NOTE" : "WAITING FOR YOU"}</b><small>{hasTake ? `${report.words} words / ${formatDuration(duration)}` : "One tap away"}</small><FiPlay /></div></Reveal></div>
    {user.role === "leader" && <RoomInbox room={room} sessions={roomSessions} />}
  </section>;
}

function PracticeCards() {
  const cards = [
    { index: "03 / A", title: "OPEN WITH A\nPULSE.", text: "Make the first ten seconds feel like a hand on the shoulder, not a slide deck.", tone: "card-blue", symbol: "✦" },
    { index: "03 / B", title: "MAKE SPACE\nFOR THE POINT.", text: "A well-placed pause gives the big sentence somewhere to land.", tone: "card-yellow", symbol: "◒" },
    { index: "03 / C", title: "LEAVE THEM\nWITH A LINE.", text: "End on the detail they’ll replay after you’ve left the room.", tone: "card-red", symbol: "↗" },
  ];
  return (
    <section className="practice-cards">
      <Reveal className="section-number"><span>03</span><span>FIND YOUR RHYTHM</span></Reveal>
      <Reveal className="cards-intro"><h2>SMALL <i>SHIFTS,</i><br />A DIFFERENT <span>ROOM.</span></h2><p>Three reasons to press record today, even if it’s only for sixty seconds.</p></Reveal>
      <div className="cards-grid">
        {cards.map((card, index) => (
          <Reveal className="practice-card-wrap" delay={index * 0.08} key={card.index}>
            <motion.article className={`practice-card ${card.tone}`} whileHover={{ y: -12, rotate: index === 1 ? 0 : index === 0 ? -1 : 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
              <div><span>{card.index}</span><b>{card.symbol}</b></div>
              <h3>{card.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h3>
              <p>{card.text}</p>
              <button onClick={() => jumpTo("studio")} aria-label={`Practice: ${card.title.replace("\n", " ")}`}><FiArrowUpRight /></button>
            </motion.article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function formatRelativeDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 2) return "JUST NOW";
  if (diffMins < 60) return `${diffMins}M AGO`;
  if (diffHours < 24 && date.toDateString() === now.toDateString()) {
    return `TODAY AT ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `YESTERDAY AT ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

function HistoryArchive({ user }) {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroupFilter, setActiveGroupFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const refresh = useCallback(() => setSessions(getUserSessions(user.id)), [user.id]);
  useEffect(() => {
    refresh();
    return subscribeToStore(refresh);
  }, [refresh]);

  const remove = async (event, session) => {
    event.stopPropagation();
    if (!window.confirm("Delete this take, its transcript, report, graph, and saved audio?")) return;
    deleteSession(session.id);
    await deleteAudioBlob(session.audioKey).catch(() => undefined);
    if (selectedId === session.id) setSelectedId(null);
    refresh();
  };

  const copyTranscript = (event, text, id) => {
    event.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getGroupKey = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return "today";
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "yesterday";
    return "earlier";
  };

  const filteredSessions = sessions.filter((session) => {
    const groupKey = getGroupKey(session.createdAt);
    if (activeGroupFilter !== "all" && groupKey !== activeGroupFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const title = (session.report?.focus?.title || "").toLowerCase();
    const transcript = (session.transcript || "").toLowerCase();
    const cue = (session.report?.focus?.cue || "").toLowerCase();
    const language = (session.language || "").toLowerCase();

    return title.includes(q) || transcript.includes(q) || cue.includes(q) || language.includes(q);
  });

  const groups = {
    today: filteredSessions.filter((s) => getGroupKey(s.createdAt) === "today"),
    yesterday: filteredSessions.filter((s) => getGroupKey(s.createdAt) === "yesterday"),
    earlier: filteredSessions.filter((s) => getGroupKey(s.createdAt) === "earlier"),
  };

  const groupLabels = {
    today: "TODAY",
    yesterday: "YESTERDAY",
    earlier: "EARLIER TAKES",
  };

  return (
    <div className="history-shell">
      {/* Header */}
      <div className="history-header">
        <div>
          <span className="eyebrow"><i /> {user.name.toUpperCase()}’S VOICE ARCHIVE</span>
          <h3>YOUR TAKES,<br /><i>HELD HERE.</i></h3>
        </div>
        <p>Every completed take stays with its audio, transcript, focus note, and amplitude envelope signal map. Private to this browser context.</p>
      </div>

      {/* Toolbar / Search & Filter */}
      {sessions.length > 0 && (
        <div className="history-toolbar">
          <div className="history-search-wrap">
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voice notes, cues, or transcripts..."
              aria-label="Search history notes"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery("")} aria-label="Clear search">
                <FiX />
              </button>
            )}
          </div>

          <div className="history-filter-pills">
            <button
              className={`filter-pill ${activeGroupFilter === "all" ? "is-active" : ""}`}
              onClick={() => setActiveGroupFilter("all")}
            >
              ALL TAKES <small>({sessions.length})</small>
            </button>
            <button
              className={`filter-pill ${activeGroupFilter === "today" ? "is-active" : ""}`}
              onClick={() => setActiveGroupFilter("today")}
            >
              TODAY
            </button>
            <button
              className={`filter-pill ${activeGroupFilter === "yesterday" ? "is-active" : ""}`}
              onClick={() => setActiveGroupFilter("yesterday")}
            >
              YESTERDAY
            </button>
            <button
              className={`filter-pill ${activeGroupFilter === "earlier" ? "is-active" : ""}`}
              onClick={() => setActiveGroupFilter("earlier")}
            >
              EARLIER
            </button>
          </div>

          <div className="history-count-badge">
            <span>SHOWING {filteredSessions.length} OF {sessions.length} TAKES</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 ? (
        <div className="history-empty">
          <FiClock className="empty-icon" />
          <span>NO SAVED TAKES YET</span>
          <p>Complete a recording or upload an audio file in the practice studio to store your first voice map.</p>
          <button onClick={() => jumpTo("studio")}>Make your first take <FiArrowUpRight /></button>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="history-empty filter-empty">
          <FiSearch className="empty-icon" />
          <span>NO MATCHING TAKES FOUND</span>
          <p>No voice notes match your current search or filter query.</p>
          <button onClick={() => { setSearchQuery(""); setActiveGroupFilter("all"); }}>
            Clear search filters <FiX />
          </button>
        </div>
      ) : (
        /* History Groups */
        <div className="history-groups-list">
          {Object.keys(groups).map((groupKey) => {
            const items = groups[groupKey];
            if (items.length === 0) return null;

            return (
              <div key={groupKey} className="history-group">
                <div className="history-group-header">
                  <span><i /> {groupLabels[groupKey]}</span>
                  <small>{items.length} take{items.length === 1 ? "" : "s"}</small>
                </div>

                <div className="history-items-grid">
                  {items.map((session, index) => {
                    const report = session.report || buildReport(session);
                    const isSelected = selectedId === session.id;

                    return (
                      <article
                        key={session.id}
                        className={`history-card ${isSelected ? "is-open" : ""}`}
                      >
                        {/* Card Header Bar */}
                        <div
                          className="history-card-summary"
                          onClick={() => setSelectedId(isSelected ? null : session.id)}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isSelected}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedId(isSelected ? null : session.id); }}
                        >
                          <div className="card-left-info">
                            <div className="card-top-row">
                              <span className="card-index">TAKE #{String(index + 1).padStart(2, "0")}</span>
                              <span className="card-date"><FiCalendar /> {formatRelativeDate(session.createdAt)}</span>
                              {session.language && <span className="card-lang">{session.language}</span>}
                            </div>

                            <div className="card-main-content">
                              <h4 className="card-title">{report.focus.title}</h4>
                              <p className="card-cue">
                                <span>NEXT CUE:</span> {report.focus.cue}
                              </p>
                            </div>

                            <div className="card-metrics-row">
                              <span className="metric-tag">
                                <FiClock /> {formatDuration(session.duration)}
                              </span>
                              <span className="metric-tag">
                                {report.words} WORDS
                              </span>
                              {report.wpm > 0 && (
                                <span className="metric-tag">
                                  {report.wpm} WPM
                                </span>
                              )}
                              {report.pauseCount > 0 && (
                                <span className="metric-tag">
                                  {report.pauseCount} PAUSES
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="card-right-controls">
                            <button
                              className="card-action-btn copy-btn"
                              onClick={(e) => copyTranscript(e, session.transcript, session.id)}
                              title="Copy transcript"
                            >
                              {copiedId === session.id ? <><FiCheck /> COPIED</> : <><FiCopy /> COPY</>}
                            </button>
                            <button
                              className="card-action-btn delete-btn"
                              onClick={(e) => remove(e, session)}
                              title="Delete take"
                              aria-label="Delete take"
                            >
                              <FiTrash2 />
                            </button>
                            <div className="card-toggle-icon">
                              {isSelected ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Detail View */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              className="history-expanded-content"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <SessionDetail session={session} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Archive({ user }) {
  return <section className="archive-section" id="archive">
    <div className="archive">
      <div className="archive-visual"><div className="sun-disc" /><div className="archive-wave">ORA<br />ORA<br />ORA</div><span>MAKE YOURSELF<br />HEARD</span></div>
      <div className="archive-copy"><Reveal><span className="eyebrow"><i /> KEEP A TRACE</span></Reveal><Reveal delay={0.07}><h2>A VOICE<br />YOU <i>RECOGNIZE.</i></h2></Reveal><Reveal delay={0.13}><p>The point isn’t to manufacture confidence. It’s to keep returning to the sound of yourself when you mean what you say.</p><button className="text-link" onClick={() => jumpTo("studio")}>Begin a new take <FiArrowUpRight /></button></Reveal></div>
    </div>
    <HistoryArchive user={user} />
  </section>;
}

function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("participant");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (name.trim().length < 2) { setError("Add the name you want attached to your voice notes."); return; }
    onLogin(createUser({ name, role }));
  };

  return <main className="login-screen">
    <div className="login-art"><div className="login-art-grid" /><div className="login-disc" /><div className="login-rings" /><div className="login-art-meta"><span><i /> PERSONAL SPEAKING INTELLIGENCE</span><span>EST. 2024 — EVERYWHERE</span></div><div className="login-art-copy"><p>NO PERFORMANCE.<br />JUST <em>YOUR</em><br />VOICE.</p><small>LISTEN CLOSER / SPEAK FREELY</small></div><div className="login-art-orbit"><TinyMark /></div><span className="login-art-index">( 01 — 01 )</span></div>
    <section className="login-panel"><button className="login-brand" onClick={() => window.location.reload()}><TinyMark /> ORA</button><div className="login-copy"><span className="eyebrow"><i /> BEGIN YOUR PRACTICE</span><h1>COME IN<br /><i>AS YOU ARE.</i></h1><p>A private space to hear how your speech moves — with no score attached.</p></div><form onSubmit={submit}><label>What should we call you?<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name for your voice notes" autoComplete="name" /></label><fieldset><legend>How are you practicing today?</legend><button type="button" className={role === "participant" ? "is-selected" : ""} onClick={() => setRole("participant")}><FiMic /><span><b>Speaker</b><small>Practice privately or send a completed take to a room.</small></span><FiCheck /></button><button type="button" className={role === "leader" ? "is-selected" : ""} onClick={() => setRole("leader")}><FiUsers /><span><b>Leader</b><small>Open a room and receive your speakers’ takes.</small></span><FiCheck /></button></fieldset>{error && <p className="login-error">{error}</p>}<button className="login-submit" type="submit">Enter ORA <FiArrowUpRight /></button></form><small className="login-note">Your speech map and history stay in this browser, separated by name.</small></section>
  </main>;
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-call"><span>READY WHEN</span><strong>YOUR VOICE IS.</strong><button onClick={() => jumpTo("studio")}><FiArrowDownLeft /></button></div>
      <div className="footer-bottom"><span>© ORA 2024 — SPEAK FREELY</span><div><a href="#top">INSTAGRAM</a><a href="#top">PRIVACY</a><a href="#top">TERMS</a></div><TinyMark /></div>
    </footer>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => getActiveUser());
  const goStudio = () => { setMenuOpen(false); jumpTo("studio"); };
  const login = (nextUser) => { saveActiveUser(nextUser); setUser(nextUser); };
  const updateUser = (nextUser) => { saveActiveUser(nextUser); setUser(nextUser); };
  const logout = () => { clearActiveUser(); setMenuOpen(false); setUser(null); };

  if (!user) return <LoginScreen onLogin={login} />;

  return (
    <div className="app-shell">
      <Header open={menuOpen} onToggle={() => setMenuOpen((value) => !value)} onStudio={goStudio} user={user} onLogout={logout} />
      <main>
        <Hero onStudio={goStudio} />
        <Ticker />
        <Manifesto />
        <Studio user={user} onUserChange={updateUser} />
        <PracticeCards />
        <Archive user={user} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
