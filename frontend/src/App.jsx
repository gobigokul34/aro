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
  FiFolder,
  FiLayers,
  FiTrendingUp,
  FiAward,
  FiRefreshCw,
  FiFileText,
  FiSliders,
  FiEye,
  FiTag,
} from "react-icons/fi";
import useRecorder from "./hooks/useRecorder";
import { formatDuration } from "./utils/analytics";
import { buildReport } from "./utils/report";
import { deleteAudioBlob, getAudioBlob, saveAudioBlob } from "./utils/audioStore";
import AudioPlayer from "./components/AudioPlayer";
import { extractAmplitudeEnvelope, generateSyntheticEnvelope } from "./utils/amplitudeEnvelope";
import { groupSimilarTakes, calculateTrend } from "./utils/trends";
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

const jumpTo = (id) => {
  let target = document.getElementById(id);
  if (!target && id === "studio") {
    target = document.getElementById("analyst-suite");
  }
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
};

function TinyMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M6 20.3C10.9 20.3 14.8 16.4 14.8 11.5V7.4H23v4.1c0 4.9 3.9 8.8 8.8 8.8H33v8.3h-1.2c-4.9 0-8.8-3.9-8.8-8.8v-1.2h-8.2v1.2c0 4.9-3.9 8.8-8.8 8.8H4.8v-8.3H6Z" fill="currentColor" />
    </svg>
  );
}

function Header({ open, onToggle, onStudio, user, onLogout }) {
  const isAnalyst = user?.role === "analyst";
  const studioTargetId = isAnalyst ? "analyst-suite" : "studio";
  const studioLabel = isAnalyst ? "Analyst suite" : "Practice studio";
  const ctaLabel = isAnalyst ? "Analyst suite" : "Enter studio";

  return (
    <>
      <header className="site-header">
        <button className="brand" onClick={() => jumpTo("top")} aria-label="Return to the top">
          <TinyMark />
          <span>ORA</span>
        </button>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <button onClick={() => jumpTo("method")}>The method</button>
          <button onClick={() => jumpTo(studioTargetId)}>{studioLabel}</button>
          <button onClick={() => jumpTo("archive")}>Voice notes</button>
        </nav>

        <div className="account-actions">
          <button className="account-chip" onClick={() => jumpTo("archive")} title="Open your history">
            <FiUser /><span><b>{user.name}</b><small>{user.role}</small></span>
          </button>
          <button className="header-cta" onClick={onStudio}>
            {ctaLabel} <FiArrowUpRight />
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
            <button onClick={() => { jumpTo(studioTargetId); onToggle(); }}>{studioLabel} <FiArrowUpRight /></button>
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
  const [viewMode, setViewMode] = useState("contour"); // "contour" | "bars"
  const [hoverData, setHoverData] = useState(null);
  const [activeSeekTime, setActiveSeekTime] = useState(null);

  const duration = Math.max(1, report?.duration || 10);
  const envelopePoints = report?.envelopePoints || generateSyntheticEnvelope(duration, report?.pauseCount || 0, 70);

  const width = 560;
  const height = compact ? 150 : 200;
  const padLeft = 46;
  const padRight = 20;
  const padTop = 26;
  const padBottom = 28;
  const graphWidth = width - padLeft - padRight;
  const graphHeight = height - padTop - padBottom;

  const pointsCount = envelopePoints.length;
  const pointGap = pointsCount > 1 ? graphWidth / (pointsCount - 1) : graphWidth;

  // Build coordinate points
  const coords = envelopePoints.map((item, index) => {
    const x = padLeft + index * pointGap;
    const y = height - padBottom - Math.max(0.04, Math.min(1, item.peak)) * graphHeight;
    const rmsY = height - padBottom - Math.max(0.02, Math.min(1, item.rms || item.peak * 0.55)) * graphHeight;
    const time = (index / Math.max(1, pointsCount - 1)) * duration;
    const db = item.peak > 0.01 ? Math.round(20 * Math.log10(item.peak)) : -40;
    return { x, y, rmsY, time, db, peak: item.peak, isPause: item.isPause };
  });

  // Find max peak point
  let maxPeakIndex = 0;
  coords.forEach((c, i) => {
    if (c.peak > coords[maxPeakIndex].peak) maxPeakIndex = i;
  });
  const maxPeakCoord = coords[maxPeakIndex];

  // Smooth curved path for contour mode
  const getSmoothPath = (pointList, yProp = "y") => {
    if (pointList.length < 2) return "";
    let d = `M ${pointList[0].x.toFixed(1)},${pointList[0][yProp].toFixed(1)}`;
    for (let i = 0; i < pointList.length - 1; i++) {
      const p0 = pointList[Math.max(0, i - 1)];
      const p1 = pointList[i];
      const p2 = pointList[i + 1];
      const p3 = pointList[Math.min(pointList.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1[yProp] + (p2[yProp] - p0[yProp]) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2[yProp] - (p3[yProp] - p1[yProp]) / 6;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2[yProp].toFixed(1)}`;
    }
    return d;
  };

  const peakCurve = getSmoothPath(coords, "y");
  const rmsCurve = getSmoothPath(coords, "rmsY");
  const baselineY = height - padBottom;
  const areaPath = `${peakCurve} L ${padLeft + graphWidth},${baselineY} L ${padLeft},${baselineY} Z`;
  const rmsAreaPath = `${rmsCurve} L ${padLeft + graphWidth},${baselineY} L ${padLeft},${baselineY} Z`;

  // Handle Mouse Move & Scrub
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    if (mouseX < padLeft || mouseX > padLeft + graphWidth) {
      setHoverData(null);
      return;
    }
    const ratio = (mouseX - padLeft) / graphWidth;
    const closestIdx = Math.max(0, Math.min(pointsCount - 1, Math.round(ratio * (pointsCount - 1))));
    const pt = coords[closestIdx];
    if (pt) {
      setHoverData({ ...pt, cursorX: mouseX });
    }
  };

  const handleMouseLeave = () => setHoverData(null);

  const handleClick = (e) => {
    if (!report?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTime = ratio * duration;
    setActiveSeekTime(seekTime);
    onSeek?.(seekTime);
  };

  // Time grid markers (0:00, 0:05, 0:10 etc.)
  const timeSteps = 4;
  const timeMarkers = Array.from({ length: timeSteps + 1 }, (_, i) => {
    const t = (i / timeSteps) * duration;
    const x = padLeft + (i / timeSteps) * graphWidth;
    return { time: formatDuration(t), x };
  });

  // dB reference lines
  const dbLines = [
    { label: "0 dB", ratio: 0.95 },
    { label: "-12 dB", ratio: 0.65 },
    { label: "-24 dB", ratio: 0.35 },
    { label: "-36 dB", ratio: 0.1 },
  ];

  return (
    <div className={`report-graph ${compact ? "is-compact" : ""}`}>
      {/* Graph Toolbar */}
      <div className="graph-label">
        <div className="graph-title-group">
          <span><FiActivity /> AMPLITUDE ENVELOPE</span>
          <span className="graph-subtitle">ACOUSTIC DYNAMICS & RMS CONTOUR</span>
        </div>
        <div className="graph-mode-controls">
          <button
            type="button"
            className={`graph-mode-btn ${viewMode === "contour" ? "is-active" : ""}`}
            onClick={() => setViewMode("contour")}
          >
            CONTOUR
          </button>
          <button
            type="button"
            className={`graph-mode-btn ${viewMode === "bars" ? "is-active" : ""}`}
            onClick={() => setViewMode("bars")}
          >
            BARS
          </button>
          {onSeek && <span className="graph-scrub-hint">CLICK TO SEEK</span>}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        className="graph-canvas-wrap"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ cursor: onSeek ? "pointer" : "default" }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Amplitude envelope graph with decibel scale and interactive time scrubbing"
        >
          <defs>
            <linearGradient id="peakEnvelopeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D7ED74" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#2038E7" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2038E7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="rmsEnvelopeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C95FF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10151B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="activeNeedleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D7ED74" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FF5A45" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Horizontal dB reference grid lines & text labels */}
          {dbLines.map(({ label, ratio }) => {
            const y = height - padBottom - ratio * graphHeight;
            return (
              <g key={label} className="grid-group">
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + graphWidth}
                  y2={y}
                  stroke="rgba(242, 237, 223, 0.16)"
                  strokeDasharray="3 4"
                />
                <text
                  x={padLeft - 7}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(242, 237, 223, 0.65)"
                  fontFamily="'DM Mono', monospace"
                  fontSize="8.5px"
                  letterSpacing="0.02em"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Baseline horizontal line */}
          <line
            x1={padLeft}
            y1={baselineY}
            x2={padLeft + graphWidth}
            y2={baselineY}
            stroke="rgba(242, 237, 223, 0.35)"
            strokeWidth="1.2"
          />

          {/* View Mode: CONTOUR */}
          {viewMode === "contour" ? (
            <>
              {/* RMS Energy Secondary Fill */}
              <path d={rmsAreaPath} fill="url(#rmsEnvelopeGrad)" />

              {/* Peak Dynamics Shaded Area */}
              <path d={areaPath} fill="url(#peakEnvelopeGrad)" />

              {/* RMS Energy Stroke */}
              <path
                d={rmsCurve}
                fill="none"
                stroke="rgba(124, 149, 255, 0.65)"
                strokeWidth="1.5"
                strokeDasharray="2 3"
              />

              {/* Main Peak Amplitude Envelope Spline */}
              <path
                d={peakCurve}
                fill="none"
                stroke="#D7ED74"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Silence and Peak Highlights */}
              {coords.map((item, idx) => {
                if (item.isPause) {
                  return (
                    <circle
                      key={idx}
                      cx={item.x}
                      cy={item.y}
                      r="3.5"
                      fill="#FF5A45"
                      stroke="#10151B"
                      strokeWidth="1.5"
                    />
                  );
                }
                return null;
              })}

              {/* Dynamic Peak Callout Badge */}
              {maxPeakCoord && (
                <g className="peak-callout-badge" transform={`translate(${maxPeakCoord.x}, ${maxPeakCoord.y - 12})`}>
                  <rect
                    x="-28"
                    y="-13"
                    width="56"
                    height="14"
                    rx="2"
                    fill="#10151B"
                    stroke="#D7ED74"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fill="#D7ED74"
                    fontFamily="'DM Mono', monospace"
                    fontSize="7.5px"
                    fontWeight="700"
                  >
                    PEAK {report?.peakDb || "-1.2dB"}
                  </text>
                  <circle cx="0" cy="12" r="3.5" fill="#D7ED74" stroke="#10151B" strokeWidth="1.5" />
                </g>
              )}
            </>
          ) : (
            /* View Mode: BARS */
            <g className="acoustic-bars-group">
              {coords.map((item, idx) => {
                const barH = Math.max(3, (height - padBottom) - item.y);
                const barW = Math.max(2, (graphWidth / pointsCount) * 0.7);
                const isHigh = item.peak > 0.65;
                const fill = item.isPause ? "#FF5A45" : isHigh ? "#D7ED74" : "#6E87FF";
                return (
                  <rect
                    key={idx}
                    x={item.x - barW / 2}
                    y={baselineY - barH}
                    width={barW}
                    height={barH}
                    rx="1"
                    fill={fill}
                    opacity={item.isPause ? 0.9 : 0.85}
                  />
                );
              })}
            </g>
          )}

          {/* Bottom Time Axis Markers */}
          {timeMarkers.map(({ time, x }) => (
            <g key={time} className="time-marker">
              <line x1={x} y1={baselineY} x2={x} y2={baselineY + 4} stroke="rgba(242, 237, 223, 0.4)" />
              <text
                x={x}
                y={baselineY + 14}
                textAnchor="middle"
                fill="rgba(242, 237, 223, 0.6)"
                fontFamily="'DM Mono', monospace"
                fontSize="8px"
                letterSpacing="0.03em"
              >
                {time}
              </text>
            </g>
          ))}

          {/* Active Playhead / Clicked Seek Line */}
          {activeSeekTime !== null && (
            <g className="seek-marker">
              <line
                x1={padLeft + (activeSeekTime / duration) * graphWidth}
                y1={padTop}
                x2={padLeft + (activeSeekTime / duration) * graphWidth}
                y2={baselineY}
                stroke="#D7ED74"
                strokeWidth="1.8"
              />
              <circle
                cx={padLeft + (activeSeekTime / duration) * graphWidth}
                cy={padTop}
                r="3.5"
                fill="#D7ED74"
              />
            </g>
          )}

          {/* Interactive Hover Needle & Crosshair */}
          {hoverData && (
            <g className="hover-needle-group">
              <line
                x1={hoverData.cursorX}
                y1={padTop}
                x2={hoverData.cursorX}
                y2={baselineY}
                stroke="url(#activeNeedleGrad)"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={hoverData.cursorX}
                cy={hoverData.y}
                r="4.5"
                fill="#D7ED74"
                stroke="#10151B"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip HUD */}
        {hoverData && (
          <div
            className="graph-hover-hud"
            style={{
              left: `${(hoverData.cursorX / width) * 100}%`,
              top: `${(hoverData.y / height) * 100}%`,
            }}
          >
            <span className="hud-time">{formatDuration(hoverData.time)}</span>
            <span className="hud-db">{hoverData.db} dB</span>
            {hoverData.isPause && <span className="hud-pause">PAUSE</span>}
          </div>
        )}
      </div>

      {/* Signal Metric Badges Legend */}
      <div className="speech-map-legend">
        <span className="legend-item">
          <b><i className="legend-dot is-acid" /> PEAK DYNAMICS</b>
          <small>{report?.peakDb || "-1.2 dB"}</small>
        </span>
        <span className="legend-item">
          <b><i className="legend-dot is-blue" /> RMS ENERGY</b>
          <small>{report?.rmsDb || "-14.8 dB"}</small>
        </span>
        <span className="legend-item">
          <b><i className="legend-dot is-white" /> DYNAMIC RANGE</b>
          <small>{report?.dynamicRangeDb || "24 dB"}</small>
        </span>
        <span className="legend-item">
          <b><i className="legend-dot is-coral" /> PAUSE SILENCES</b>
          <small>{report?.pauseCount || 0} MARKED</small>
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
  const ev = report.evaluation;

  return (
    <div className="session-detail">
      <div className="detail-head">
        <span>{session.userName || "SPEAKER TAKE"}</span>
        <strong>{report.focus.title}</strong>
      </div>
      <SessionAudio audioKey={session.audioKey} />
      
      {ev && (
        <div className="evaluation-scorecard">
          <div className="scorecard-header">
            <span>STANDARD CRITERIA</span>
            <strong>{ev.total} <small>/ 50</small></strong>
          </div>
          <div className="scorecard-grid">
            <div className="score-item"><span>Pronunciation</span><b>{ev.pronunciation}/10</b></div>
            <div className="score-item"><span>Vocabulary</span><b>{ev.vocabulary}/10</b></div>
            <div className="score-item"><span>Grammar</span><b>{ev.grammar}/10</b></div>
            <div className="score-item"><span>Fluency</span><b>{ev.fluency}/10</b></div>
            <div className="score-item"><span>Coherence</span><b>{ev.coherence}/10</b></div>
          </div>
        </div>
      )}

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
  const [practiceTopic, setPracticeTopic] = useState("Product Pitch");
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
    const cleanTopic = (practiceTopic && practiceTopic.trim()) ? practiceTopic.trim() : "Speech Practice";
    const report = buildReport(take);
    report.focus.title = cleanTopic.toUpperCase();

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
      topic: cleanTopic,
      name: cleanTopic,
      ...take,
      report,
    });
    refreshRoom();
  }, [practiceTopic, refreshRoom, user]);

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
      <div className="studio-topbar">
        <div className="studio-tabs">
          <span className="active">NEW SESSION</span>
          <span>{user.role === "leader" ? "LEADER MODE" : room ? `ROOM ${room.code}` : "PRIVATE MODE"}</span>
        </div>
        
        {/* Practice Topic Input (Directly tracks trends!) */}
        <div className="studio-topic-tag">
          <FiTag className="topic-icon" />
          <span>TOPIC:</span>
          <input
            type="text"
            value={practiceTopic}
            onChange={(e) => setPracticeTopic(e.target.value)}
            placeholder="e.g. Product Pitch, Interview, Keynote"
            title="Speech topic is used to cluster takes and measure AI Growth Trends"
          />
        </div>

        <span className="studio-status"><i className={recording || isAnalyzing ? "is-pulsing" : ""} /> {status}</span>
        <button className="dots" aria-label="More options"><FiMoreHorizontal /></button>
      </div>
      <div className="studio-stage">
        <div className="record-column">
          <div className="record-caption"><span>YOUR TURN</span><span>{room && user.role === "participant" ? `ROOM ${room.code}` : "NO SCRIPT NEEDED"}</span></div>
          <button className={`record-button ${recording && !isPaused ? "is-recording" : ""}`} onClick={recording ? stopRecording : startRecording} aria-label={recording ? "Stop recording" : "Start recording"}><span>{recording ? <FiX /> : <FiMic />}</span><b>{recording ? "STOP" : "SPEAK"}</b></button>
          {recording && <button className="pause-control" onClick={isPaused ? resumeRecording : pauseRecording}>{isPaused ? <FiPlay /> : <FiPause />}{isPaused ? "Resume take" : "Pause take"}<span>{pauseCount} pause{pauseCount === 1 ? "" : "s"}</span></button>}
          <p className="record-instruction">{recording ? (isPaused ? "The take is paused. Resume when the next thought is ready." : "Let the thought arrive. Pause when you need a beat; stop when you are done.") : "Tap once, then let the first sentence be a little messy."}</p>
          <div className="upload-row">
            <button onClick={() => inputRef.current?.click()}><FiUpload /> Bring a recording</button>
            <input
              ref={inputRef}
              type="file"
              accept="audio/*,.webm,.m4a,.mp3,.wav"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  const cleaned = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
                  if (cleaned) setPracticeTopic(cleaned);
                  analyzeFile(file);
                }
                event.target.value = "";
              }}
            />
            <span>MP3, M4A, WAV, WEBM</span>
          </div>
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

function TrendsPanel({ sessions }) {
  const [trendMode, setTrendMode] = useState("topics"); // "topics" | "timeline"
  const [analyzedGroups, setAnalyzedGroups] = useState([]);

  useEffect(() => {
    if (!sessions || sessions.length === 0) {
      setAnalyzedGroups([]);
      return;
    }

    let groupsDict = {};

    if (trendMode === "topics") {
      groupsDict = groupSimilarTakes(sessions);
    } else {
      // Overall timeline mode: cluster all takes chronologically
      groupsDict = { "Complete Practice Journey": sessions };
    }

    const results = Object.entries(groupsDict)
      .filter(([_, group]) => group && group.length >= 1)
      .map(([groupName, group]) => {
        // Chronologically sorted takes
        const sorted = [...group].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const scoreTrend = calculateTrend(sorted, "score");
        const wpmTrend = calculateTrend(sorted, "wpm");
        const durationTrend = calculateTrend(sorted, "duration");
        const wordsTrend = calculateTrend(sorted, "words");

        const isBaseline = sorted.length === 1;

        return {
          groupName: groupName.toUpperCase(),
          count: sorted.length,
          isBaseline,
          scoreTrend,
          wpmTrend,
          durationTrend,
          wordsTrend,
          takes: sorted,
          latestTake: sorted[sorted.length - 1],
        };
      });

    // Sort groups with multi-take progress first
    results.sort((a, b) => b.count - a.count);
    setAnalyzedGroups(results);
  }, [sessions, trendMode]);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="history-empty">
        <FiBarChart2 className="empty-icon" />
        <span>NO RECORDED TAKES FOUND</span>
        <p>Record takes in the Practice Studio or upload past recordings to generate your AI Growth Trends.</p>
      </div>
    );
  }

  return (
    <div className="trends-container">
      {/* Trends Controls Bar */}
      <div className="trends-toolbar">
        <div className="trends-toolbar-title">
          <span><FiTrendingUp /> AI SPEECH PROGRESSION ENGINE</span>
          <small>Tracks pace, score dynamics, and structural growth across takes</small>
        </div>

        <div className="trends-mode-switcher">
          <button
            type="button"
            className={`mode-pill-btn ${trendMode === "topics" ? "is-active" : ""}`}
            onClick={() => setTrendMode("topics")}
          >
            <FiLayers /> BY TOPIC CLUSTERS
          </button>
          <button
            type="button"
            className={`mode-pill-btn ${trendMode === "timeline" ? "is-active" : ""}`}
            onClick={() => setTrendMode("timeline")}
          >
            <FiClock /> OVERALL PRACTICE RUN ({sessions.length} TAKES)
          </button>
        </div>
      </div>

      {analyzedGroups.length === 0 ? (
        <div className="history-empty">
          <FiBarChart2 className="empty-icon" />
          <span>NO MATCHING TOPIC CLUSTERS</span>
          <p>Switch to "OVERALL PRACTICE RUN" to see progression across all takes.</p>
        </div>
      ) : (
        <div className="trends-panel-grid">
          {analyzedGroups.map((ag, idx) => {
            const scoreDelta = ag.scoreTrend.delta;
            const hasGrowth = scoreDelta > 0;
            const hasDecline = scoreDelta < 0;

            return (
              <div key={idx} className={`trend-card ${ag.isBaseline ? "is-baseline-card" : ""}`}>
                {/* Card Header */}
                <div className="trend-card-header">
                  <div className="trend-header-left">
                    <span className="trend-topic-tag">SPEECH TOPIC CLUSTER</span>
                    <h4>{ag.groupName}</h4>
                  </div>
                  <div className="trend-header-right">
                    <span className="trend-count-badge">
                      {ag.count} TAKE{ag.count > 1 ? "S" : ""}
                    </span>
                    {!ag.isBaseline ? (
                      <span className={`trend-summary-pill ${hasGrowth ? "is-growth" : hasDecline ? "is-decline" : ""}`}>
                        <FiAward /> {hasGrowth ? `+${scoreDelta}` : scoreDelta} PTS SCORE ({ag.scoreTrend.pctChange > 0 ? "+" : ""}{ag.scoreTrend.pctChange}%)
                      </span>
                    ) : (
                      <span className="trend-summary-pill is-neutral">
                        BASELINE RECORDED
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Trajectory Sparkline (Score Progression across takes) */}
                {ag.count >= 2 && (
                  <div className="trend-sparkline-box">
                    <div className="sparkline-header">
                      <span>TRAJECTORY CURVE (SCORE & WPM PROGRESSION)</span>
                      <small>START TAKE #1 → LATEST TAKE #{ag.count}</small>
                    </div>
                    <svg
                      viewBox="0 0 360 68"
                      className="trend-sparkline-svg"
                      role="img"
                      aria-label="Score progression sparkline across takes"
                    >
                      <defs>
                        <linearGradient id={`sparkGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D7ED74" stopOpacity="0.38" />
                          <stop offset="100%" stopColor="#2038E7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Reference line */}
                      <line x1="20" y1="52" x2="340" y2="52" stroke="rgba(16, 21, 27, 0.12)" strokeDasharray="2 3" />

                      {/* Draw sparkline points */}
                      {(() => {
                        const pts = ag.scoreTrend.progression;
                        const minScore = Math.min(...pts.map((p) => p.value), 25);
                        const maxScore = Math.max(...pts.map((p) => p.value), 50);
                        const scoreSpan = Math.max(5, maxScore - minScore);

                        const coords = pts.map((p, i) => {
                          const x = 24 + (i / Math.max(1, pts.length - 1)) * 312;
                          const ratio = (p.value - minScore) / scoreSpan;
                          const y = 52 - ratio * 38;
                          return { x, y, val: p.value, num: p.takeNumber };
                        });

                        const polylineStr = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
                        const polygonStr = `24,52 ${polylineStr} 336,52`;

                        return (
                          <>
                            <polygon points={polygonStr} fill={`url(#sparkGrad-${idx})`} />
                            <polyline
                              points={polylineStr}
                              fill="none"
                              stroke="#D7ED74"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {coords.map((c, i) => (
                              <g key={i}>
                                <circle cx={c.x} cy={c.y} r="3.8" fill="#10151B" stroke="#D7ED74" strokeWidth="2" />
                                <text
                                  x={c.x}
                                  y={Math.max(10, c.y - 7)}
                                  textAnchor="middle"
                                  fill="#F2EDDF"
                                  fontFamily="'DM Mono', monospace"
                                  fontSize="8px"
                                  fontWeight="700"
                                >
                                  {c.val}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                )}

                {/* Metric Delta Boxes */}
                <div className="trend-metrics">
                  <TrendMetric
                    title="OVERALL SCORE (/50)"
                    trendData={ag.scoreTrend}
                    unit="pts"
                  />
                  <TrendMetric
                    title="SPEAKING PACE (WPM)"
                    trendData={ag.wpmTrend}
                    unit="wpm"
                  />
                  <TrendMetric
                    title="RECORDING DURATION"
                    trendData={ag.durationTrend}
                    unit="sec"
                    isDuration
                  />
                  <TrendMetric
                    title="TOTAL WORD COUNT"
                    trendData={ag.wordsTrend}
                    unit="words"
                  />
                </div>

                {/* Chronological Take History Strip */}
                <div className="trend-takes-timeline">
                  <span className="timeline-title">CHRONOLOGICAL TAKE RUN:</span>
                  <div className="timeline-chips">
                    {ag.takes.map((take, tIdx) => {
                      const rep = take.report || buildReport(take);
                      const sc = rep.evaluation?.total || 40;
                      return (
                        <div key={take.id} className="timeline-chip" title={take.transcript || ""}>
                          <span className="chip-index">TAKE #{tIdx + 1}</span>
                          <strong className="chip-score">{sc}/50</strong>
                          <span className="chip-wpm">{rep.wpm || 0} WPM</span>
                          <span className="chip-time">{formatDuration(take.duration || 0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrendMetric({ title, trendData, unit, isDuration }) {
  const { trend, pctChange, delta, startValue, endValue, isBaseline } = trendData;
  const isGrowth = trend === "growth";
  const isDecline = trend === "decline";

  const formatVal = (v) => (isDuration ? formatDuration(v) : Math.round(v));

  // If this group only has 1 take, display current baseline cleanly
  if (isBaseline) {
    return (
      <div className="trend-metric-box is-baseline">
        <span className="metric-title">{title}</span>
        <div className="metric-values">
          <span className="val-new">{formatVal(endValue)}</span>
          <span className="baseline-indicator">INITIAL BASELINE</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`trend-metric-box ${isGrowth ? "is-growth" : isDecline ? "is-decline" : ""}`}>
      <span className="metric-title">{title}</span>
      <div className="metric-values">
        <span className="val-old">{formatVal(startValue)}</span>
        <FiArrowUpRight
          className={`trend-arrow ${isDecline ? "is-down" : ""}`}
          style={{ transform: isDecline ? "rotate(90deg)" : "none" }}
        />
        <span className="val-new">{formatVal(endValue)}</span>
      </div>

      <span className="metric-pct">
        {delta !== undefined && (
          <b className="metric-delta">
            {delta > 0 ? `+${delta}` : delta} {unit}{" "}
          </b>
        )}
        ({pctChange > 0 ? "+" : ""}{pctChange}%)
      </span>
    </div>
  );
}

function HistoryArchive({ user }) {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroupFilter, setActiveGroupFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const [viewMode, setViewMode] = useState("history"); // 'history' or 'trends'

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
          {viewMode === "history" && (
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
          )}

          <div className="history-filter-pills" style={{ marginLeft: viewMode === "trends" ? "auto" : 0 }}>
            <button
              className={`filter-pill ${viewMode === "history" ? "is-active" : ""}`}
              onClick={() => setViewMode("history")}
            >
              <FiMenu style={{ marginRight: 4 }} /> LIST VIEW
            </button>
            <button
              className={`filter-pill ${viewMode === "trends" ? "is-active" : ""}`}
              onClick={() => setViewMode("trends")}
            >
              <FiBarChart2 style={{ marginRight: 4 }} /> AI TRENDS
            </button>
            
            {viewMode === "history" && (
              <div style={{ width: '1px', height: '20px', background: 'var(--line)', margin: '0 8px' }} />
            )}
            
            {viewMode === "history" && (
              <>
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
              </>
            )}
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
      ) : viewMode === "trends" ? (
        <TrendsPanel sessions={sessions} />
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

                    const evalData = report.evaluation || {
                      total: 40,
                      pronunciation: 8,
                      vocabulary: 8,
                      grammar: 8,
                      fluency: 8,
                      coherence: 8,
                      max: 50,
                    };
                    const totalScore = evalData.total || 40;
                    const tierClass = totalScore >= 43 ? "is-mastery" : totalScore >= 35 ? "is-proficient" : "is-developing";
                    const tierLabel = totalScore >= 43 ? "EXCELLENT" : totalScore >= 35 ? "STRONG" : "DEVELOPING";

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
                              
                              {/* 50-Mark Standard Score Pill in Header */}
                              <span className={`card-score-pill ${tierClass}`}>
                                <FiAward /> {totalScore}/50 MARKS • {tierLabel}
                              </span>
                            </div>

                            <div className="card-main-content">
                              <div className="card-headline-row">
                                <h4 className="card-title">{report.focus.title}</h4>

                                {/* 5-Pillar Score Visual Gauge */}
                                <div className="card-score-gauge" title={`Speaking Skills: ${totalScore}/50 (Pronunciation ${evalData.pronunciation}, Vocabulary ${evalData.vocabulary}, Grammar ${evalData.grammar}, Fluency ${evalData.fluency}, Coherence ${evalData.coherence})`}>
                                  <div className="gauge-score-number">
                                    <strong>{totalScore}</strong>
                                    <small>/50</small>
                                  </div>
                                  <div className="gauge-bars-cluster">
                                    <div className="gauge-col" title={`Pronunciation: ${evalData.pronunciation}/10`}>
                                      <div className="gauge-bar-track">
                                        <div className="gauge-bar-fill" style={{ height: `${evalData.pronunciation * 10}%` }} />
                                      </div>
                                      <span>P</span>
                                    </div>
                                    <div className="gauge-col" title={`Vocabulary: ${evalData.vocabulary}/10`}>
                                      <div className="gauge-bar-track">
                                        <div className="gauge-bar-fill" style={{ height: `${evalData.vocabulary * 10}%` }} />
                                      </div>
                                      <span>V</span>
                                    </div>
                                    <div className="gauge-col" title={`Grammar: ${evalData.grammar}/10`}>
                                      <div className="gauge-bar-track">
                                        <div className="gauge-bar-fill" style={{ height: `${evalData.grammar * 10}%` }} />
                                      </div>
                                      <span>G</span>
                                    </div>
                                    <div className="gauge-col" title={`Fluency: ${evalData.fluency}/10`}>
                                      <div className="gauge-bar-track">
                                        <div className="gauge-bar-fill" style={{ height: `${evalData.fluency * 10}%` }} />
                                      </div>
                                      <span>F</span>
                                    </div>
                                    <div className="gauge-col" title={`Coherence: ${evalData.coherence}/10`}>
                                      <div className="gauge-bar-track">
                                        <div className="gauge-bar-fill" style={{ height: `${evalData.coherence * 10}%` }} />
                                      </div>
                                      <span>C</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <p className="card-cue">
                                <span>NEXT CUE:</span> {report.focus.cue}
                              </p>
                            </div>

                            <div className="card-metrics-row">
                              <span className="metric-tag score-pill-tag">
                                <FiAward /> {totalScore}/50 SCORE
                              </span>
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

function AnalystDashboard({ user }) {
  const [sessions, setSessions] = useState(() => getUserSessions(user.id));
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, filename: "", stage: "" });
  const [activeTab, setActiveTab] = useState("batch"); // "batch" | "trends" | "summary"
  const [dragActive, setDragActive] = useState(false);
  const [selectedTakeId, setSelectedTakeId] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");

  const folderInputRef = useRef(null);
  const filesInputRef = useRef(null);

  const refresh = useCallback(() => {
    setSessions(getUserSessions(user.id));
  }, [user.id]);

  useEffect(() => {
    refresh();
    return subscribeToStore(refresh);
  }, [refresh]);

  // Process array of audio files sequentially
  const processFilesBatch = async (files) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: files.length, filename: "", stage: "Preparing files..." });

    const { uploadAudio } = await import("./api/audioApi");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({
        current: i + 1,
        total: files.length,
        filename: file.name,
        stage: `Transcribing & analyzing (${i + 1}/${files.length})...`,
      });

      try {
        const response = await uploadAudio(file);

        // Build authentic report with full 50-mark standard criteria
        const report = buildReport({
          transcript: response.transcript || "",
          duration: response.duration || 0,
          language: response.language || "Detected automatically",
          pauseCount: 0,
        });

        // Set clean title from filename for grouping
        const cleanTitle = file.name
          .replace(/\.(mp3|wav|m4a|webm|flac|ogg)$/i, "")
          .replace(/[_-]+/g, " ")
          .trim();
        report.focus.title = cleanTitle.toUpperCase();

        const audioKey = await saveAudioBlob(file).catch(() => null);

        saveSession({
          id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date(file.lastModified || Date.now()).toISOString(),
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          audioKey,
          topic: cleanTitle,
          name: cleanTitle,
          transcript: response.transcript || "No words recognized in this take.",
          language: response.language || "en",
          duration: response.duration || 0,
          report,
        });
      } catch (err) {
        console.error("Failed to process:", file.name, err);
      }
    }

    setIsProcessing(false);
    setProgress({ current: 0, total: 0, filename: "", stage: "" });
    refresh();
    window.dispatchEvent(new Event("storage"));
  };

  const handleFolderUpload = (event) => {
    const files = Array.from(event.target.files).filter(
      (f) => f.type.startsWith("audio/") || f.name.match(/\.(mp3|wav|m4a|webm|flac|ogg)$/i)
    );
    processFilesBatch(files);
    event.target.value = "";
  };

  const handleFilesUpload = (event) => {
    const files = Array.from(event.target.files);
    processFilesBatch(files);
    event.target.value = "";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type.startsWith("audio/") || f.name.match(/\.(mp3|wav|m4a|webm|flac|ogg)$/i)
      );
      processFilesBatch(files);
    }
  };

  // Instant Demo Cohort Generator
  const loadDemoCohort = () => {
    const demoItems = [
      {
        name: "Product Pitch Take 1",
        transcript: "Welcome everyone. Today I want to introduce our new product that changes how teams collaborate on voice notes. It saves time and helps communicate clearly.",
        duration: 26,
        language: "en",
        dateOffset: 4 * 86400000,
      },
      {
        name: "Product Pitch Take 2",
        transcript: "Good morning team. Today we are launching our next generation speech workspace. By transforming raw voice takes into measurable amplitude envelopes and standard evaluations, every speaker can recognize their authentic voice.",
        duration: 32,
        language: "en",
        dateOffset: 1 * 86400000,
      },
      {
        name: "Executive Brief Draft",
        transcript: "In this quarter we saw great improvements across our primary user retention metrics. But we need to keep pushing forward on the customer onboarding flow.",
        duration: 22,
        language: "en",
        dateOffset: 3 * 86400000,
      },
      {
        name: "Executive Brief Final",
        transcript: "In this quarter our user retention increased significantly across key segments. By refining our onboarding path and providing immediate acoustic feedback, we accelerated team adoption.",
        duration: 29,
        language: "en",
        dateOffset: 0,
      },
    ];

    demoItems.forEach((item) => {
      const rep = buildReport({
        transcript: item.transcript,
        duration: item.duration,
        language: item.language,
        pauseCount: 1,
      });
      rep.focus.title = item.name.toUpperCase();

      saveSession({
        id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date(Date.now() - item.dateOffset).toISOString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        audioKey: null,
        name: item.name,
        topic: item.name,
        transcript: item.transcript,
        language: item.language,
        duration: item.duration,
        report: rep,
      });
    });

    refresh();
    window.dispatchEvent(new Event("storage"));
  };

  const clearBatch = () => {
    if (!window.confirm("Are you sure you want to clear all analyzed takes in this analyst workspace?")) return;
    sessions.forEach((s) => {
      deleteSession(s.id);
      if (s.audioKey) deleteAudioBlob(s.audioKey).catch(() => undefined);
    });
    refresh();
    window.dispatchEvent(new Event("storage"));
  };

  const exportBatchCSV = () => {
    if (sessions.length === 0) return;
    const headers = ["Take ID", "Title", "Created At", "Duration (s)", "Words", "WPM", "Total Score (/50)", "Pronunciation", "Vocabulary", "Grammar", "Fluency", "Coherence", "Transcript"];
    const rows = sessions.map((s) => {
      const rep = s.report || buildReport(s);
      const ev = rep.evaluation || {};
      return [
        s.id,
        `"${(rep.focus?.title || s.name || "").replace(/"/g, '""')}"`,
        s.createdAt,
        s.duration || 0,
        rep.words || 0,
        rep.wpm || 0,
        ev.total || 0,
        ev.pronunciation || 0,
        ev.vocabulary || 0,
        ev.grammar || 0,
        ev.fluency || 0,
        ev.coherence || 0,
        `"${(s.transcript || "").replace(/"/g, '""')}"`,
      ].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ora-analyst-batch-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cohort Analytics Summary
  const totalTakes = sessions.length;
  const avgScore = totalTakes > 0
    ? (sessions.reduce((acc, s) => acc + ((s.report?.evaluation?.total) || 40), 0) / totalTakes).toFixed(1)
    : "—";
  const avgWpm = totalTakes > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.report?.wpm || 120), 0) / totalTakes)
    : "—";
  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  const filteredSessions = sessions.filter((s) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const title = (s.report?.focus?.title || s.name || "").toLowerCase();
    const transcript = (s.transcript || "").toLowerCase();
    return title.includes(q) || transcript.includes(q);
  });

  return (
    <section className="analyst-workstation" id="analyst-suite">
      {/* Signature ORA Section Banner */}
      <div className="section-number dark-number analyst-section-num">
        <span>02</span>
        <span>SPEAK ANALYST WORKSTATION</span>
      </div>

      {/* Station Header */}
      <div className="analyst-header-shell">
        <div className="analyst-title-area">
          <span className="eyebrow"><i /> SPEAK ANALYST INTELLIGENCE SUITE</span>
          <h2>BULK AUDIO INGESTION<br /><i>& COHORT GRADING.</i></h2>
          <p>
            Batch-ingest folders of voice notes. ORA automatically executes speech-to-text, maps acoustic amplitude contours, grades against the 50-mark standard speaking rubric, and extracts multi-take growth trends.
          </p>
        </div>

        {/* Cohort Key Metric Tiles */}
        <div className="analyst-metrics-strip">
          <div className="metric-tile">
            <span>TOTAL TAKES</span>
            <strong>{totalTakes}</strong>
            <small>INGESTED AUDIO FILES</small>
          </div>
          <div className="metric-tile is-accent">
            <span>COHORT MEAN</span>
            <strong>{avgScore} <small>/ 50</small></strong>
            <small>5-PILLAR STANDARD EVAL</small>
          </div>
          <div className="metric-tile">
            <span>AVERAGE PACE</span>
            <strong>{avgWpm} <small>WPM</small></strong>
            <small>TARGET: 130–160 WPM</small>
          </div>
          <div className="metric-tile">
            <span>RECORDED RUNTIME</span>
            <strong>{formatDuration(totalDuration)}</strong>
            <small>AUDIO ACCUMULATED</small>
          </div>
        </div>
      </div>

      {/* Seamless Drag & Drop Ingestion Zone */}
      <div
        className={`analyst-dropzone ${dragActive ? "is-drag-active" : ""} ${isProcessing ? "is-busy" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Hidden inputs */}
        <input
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple
          ref={folderInputRef}
          style={{ display: "none" }}
          onChange={handleFolderUpload}
        />
        <input
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.m4a,.webm,.flac,.ogg"
          ref={filesInputRef}
          style={{ display: "none" }}
          onChange={handleFilesUpload}
        />

        <div className="dropzone-center-content">
          <div className="dropzone-icon-circle">
            <FiFolder />
          </div>
          <div className="dropzone-text-group">
            <h3>DRAG & DROP AUDIO FOLDER HERE</h3>
            <p>Or ingest audio files directly from your system to run instant cohort evaluations.</p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="dropzone-actions-cluster">
            <button
              type="button"
              className="action-btn is-primary"
              onClick={() => folderInputRef.current?.click()}
              disabled={isProcessing}
            >
              <FiFolder /> SELECT FOLDER
            </button>
            <button
              type="button"
              className="action-btn is-secondary"
              onClick={() => filesInputRef.current?.click()}
              disabled={isProcessing}
            >
              <FiUpload /> CHOOSE AUDIO FILES
            </button>
            <button
              type="button"
              className="action-btn is-ghost"
              onClick={loadDemoCohort}
              disabled={isProcessing}
              title="Loads 4 realistic multi-take speech samples"
            >
              <FiTrendingUp /> LOAD DEMO COHORT
            </button>
          </div>

          <span className="dropzone-format-pill">
            SUPPORTED: MP3 • WAV • M4A • WEBM • FLAC • OGG • DIRECTORY INGESTION
          </span>
        </div>

        {/* Real-time Ingestion Processing HUD */}
        {isProcessing && (
          <div className="ingestion-progress-hud">
            <div className="hud-status-bar">
              <div className="hud-spinner" />
              <span>{progress.stage}</span>
              <strong className="hud-counter">
                {progress.current} / {progress.total}
              </strong>
            </div>
            <div className="hud-track">
              <div
                className="hud-fill"
                style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
              />
            </div>
            <div className="hud-footer">
              <small>ACTIVE: {progress.filename || "Preparing next audio stream..."}</small>
              <small>WHISPER AI PIPELINE + 50-POINT ACOUSTIC SCORER</small>
            </div>
          </div>
        )}
      </div>

      {/* Workstation View Tabs & Controls */}
      <div className="analyst-view-toolbar">
        <div className="toolbar-left-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "batch" ? "is-active" : ""}`}
            onClick={() => setActiveTab("batch")}
          >
            <FiLayers /> BATCH INTELLIGENCE ({sessions.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "trends" ? "is-active" : ""}`}
            onClick={() => setActiveTab("trends")}
          >
            <FiTrendingUp /> COHORT GROWTH TRENDS
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "summary" ? "is-active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            <FiAward /> COHORT BENCHMARKS
          </button>
        </div>

        <div className="toolbar-right-actions">
          {activeTab === "batch" && (
            <div className="analyst-search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Filter batch takes..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
              {filterQuery && (
                <button type="button" onClick={() => setFilterQuery("")}><FiX /></button>
              )}
            </div>
          )}

          {sessions.length > 0 && (
            <>
              <button
                type="button"
                className="tool-action-btn"
                onClick={exportBatchCSV}
                title="Export batch data as CSV"
              >
                <FiDownload /> EXPORT CSV
              </button>
              <button
                type="button"
                className="tool-action-btn is-danger"
                onClick={clearBatch}
                title="Clear all batch takes"
              >
                <FiTrash2 /> CLEAR WORKSPACE
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab 1: Batch Intelligence View */}
      {activeTab === "batch" && (
        <div className="analyst-tab-content">
          {filteredSessions.length === 0 ? (
            <div className="analyst-empty-state">
              <FiBarChart2 className="empty-icon" />
              <span>NO INGESTED TAKES IN WORKSPACE</span>
              <p>Upload a folder of recordings above or click "LOAD DEMO COHORT" to immediately inspect batch speech intelligence and growth trends.</p>
              <button type="button" onClick={loadDemoCohort} className="action-btn is-primary">
                <FiTrendingUp /> LOAD DEMO COHORT
              </button>
            </div>
          ) : (
            <div className="analyst-takes-grid">
              {filteredSessions.map((session, idx) => {
                const report = session.report || buildReport(session);
                const ev = report.evaluation || {
                  total: 40,
                  pronunciation: 8,
                  vocabulary: 8,
                  grammar: 8,
                  fluency: 8,
                  coherence: 8,
                };
                const totalScore = ev.total || 40;
                const isSelected = selectedTakeId === session.id;
                const tierClass = totalScore >= 43 ? "is-mastery" : totalScore >= 35 ? "is-proficient" : "is-developing";
                const tierLabel = totalScore >= 43 ? "EXCELLENT" : totalScore >= 35 ? "STRONG" : "DEVELOPING";

                return (
                  <article key={session.id} className={`analyst-take-card ${isSelected ? "is-open" : ""}`}>
                    <div
                      className="take-card-summary"
                      onClick={() => setSelectedTakeId(isSelected ? null : session.id)}
                    >
                      <div className="take-card-head">
                        <div className="take-meta-strip">
                          <span className="take-num">TAKE #{String(idx + 1).padStart(2, "0")}</span>
                          <span className="take-date"><FiCalendar /> {formatRelativeDate(session.createdAt)}</span>
                          <span className="take-lang">{session.language || "EN"}</span>
                        </div>
                        <span className={`take-score-pill ${tierClass}`}>
                          <FiAward /> {totalScore}/50 MARKS • {tierLabel}
                        </span>
                      </div>

                      <div className="take-body-strip">
                        <h4 className="take-title">{report.focus.title}</h4>
                        <div className="take-score-gauge-mini" title={`Score breakdown: P:${ev.pronunciation} V:${ev.vocabulary} G:${ev.grammar} F:${ev.fluency} C:${ev.coherence}`}>
                          <div className="mini-pillar" title={`Pronunciation: ${ev.pronunciation}/10`}>
                            <div className="mini-pillar-fill" style={{ height: `${ev.pronunciation * 10}%` }} />
                            <span>P</span>
                          </div>
                          <div className="mini-pillar" title={`Vocabulary: ${ev.vocabulary}/10`}>
                            <div className="mini-pillar-fill" style={{ height: `${ev.vocabulary * 10}%` }} />
                            <span>V</span>
                          </div>
                          <div className="mini-pillar" title={`Grammar: ${ev.grammar}/10`}>
                            <div className="mini-pillar-fill" style={{ height: `${ev.grammar * 10}%` }} />
                            <span>G</span>
                          </div>
                          <div className="mini-pillar" title={`Fluency: ${ev.fluency}/10`}>
                            <div className="mini-pillar-fill" style={{ height: `${ev.fluency * 10}%` }} />
                            <span>F</span>
                          </div>
                          <div className="mini-pillar" title={`Coherence: ${ev.coherence}/10`}>
                            <div className="mini-pillar-fill" style={{ height: `${ev.coherence * 10}%` }} />
                            <span>C</span>
                          </div>
                        </div>
                      </div>

                      <div className="take-metrics-footer">
                        <span className="metric-chip"><FiClock /> {formatDuration(session.duration)}</span>
                        <span className="metric-chip">{report.words} WORDS</span>
                        <span className="metric-chip">{report.wpm || 0} WPM</span>
                        <span className="expand-indicator">
                          {isSelected ? "COLLAPSE" : "INSPECT"} {isSelected ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Deep Acoustic & Evaluation Breakdown */}
                    {isSelected && (
                      <div className="take-expanded-panel">
                        <div className="take-expanded-header">
                          <span className="eyebrow"><i /> COMPLETE ACOUSTIC & RUBRIC PROFILE</span>
                          <strong>{report.focus.title}</strong>
                        </div>

                        {session.audioKey && (
                          <div className="take-player-wrap">
                            <SessionAudio audioKey={session.audioKey} />
                          </div>
                        )}

                        {/* Standard 50-mark Scorecard */}
                        <div className="evaluation-scorecard">
                          <div className="scorecard-header">
                            <span>STANDARD SPEAKING SKILLS CRITERIA</span>
                            <strong>{totalScore} <small>/ 50 MARKS</small></strong>
                          </div>
                          <div className="scorecard-grid">
                            <div className="score-item"><span>Pronunciation</span><b>{ev.pronunciation}/10</b></div>
                            <div className="score-item"><span>Vocabulary</span><b>{ev.vocabulary}/10</b></div>
                            <div className="score-item"><span>Grammar</span><b>{ev.grammar}/10</b></div>
                            <div className="score-item"><span>Fluency</span><b>{ev.fluency}/10</b></div>
                            <div className="score-item"><span>Coherence</span><b>{ev.coherence}/10</b></div>
                          </div>
                        </div>

                        {/* Reworked Report Graph */}
                        <div className="take-graph-wrap">
                          <ReportGraph report={report} compact />
                        </div>

                        {/* Transcript reader */}
                        <details className="transcript-details" open>
                          <summary>FULL SPEECH TRANSCRIPT ({report.words} WORDS) <FiChevronRight /></summary>
                          <p className="detail-transcript-text">{session.transcript}</p>
                        </details>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Cohort Growth Trends */}
      {activeTab === "trends" && (
        <div className="analyst-tab-content">
          <div className="trends-tab-header">
            <span className="eyebrow"><i /> AUTOMATED TOPIC CLUSTERING & PROGRESSION</span>
            <h3>COHORT MULTI-TAKE GROWTH</h3>
            <p>Similar file naming conventions (e.g. Take 1 vs Take 2, Draft vs Final) are dynamically clustered to measure progression in pace, score, and duration.</p>
          </div>
          <TrendsPanel sessions={sessions} />
        </div>
      )}

      {/* Tab 3: Cohort Benchmarks & Evaluation Distribution */}
      {activeTab === "summary" && (
        <div className="analyst-tab-content">
          <div className="benchmark-summary-shell">
            <div className="benchmark-header">
              <span className="eyebrow"><i /> 5-PILLAR EVALUATION RUBRIC BENCHMARKS</span>
              <h3>COHORT PERFORMANCE DISTRIBUTION</h3>
              <p>Mean competence distribution across standard speaking criteria for all {totalTakes} takes in this workspace.</p>
            </div>

            <div className="benchmark-cards-grid">
              {[
                { title: "PRONUNCIATION", key: "pronunciation", max: 10, desc: "Acoustic clarity & phoneme precision" },
                { title: "VOCABULARY", key: "vocabulary", max: 10, desc: "Lexical diversity & expression depth" },
                { title: "GRAMMAR", key: "grammar", max: 10, desc: "Structural syntax & clause formation" },
                { title: "FLUENCY", key: "fluency", max: 10, desc: "Speech velocity (WPM) & filler elimination" },
                { title: "CONTENT & COHERENCE", key: "coherence", max: 10, desc: "Rhetorical pacing & thought structure" },
              ].map((pillar) => {
                const avg = totalTakes > 0
                  ? (sessions.reduce((acc, s) => acc + (s.report?.evaluation?.[pillar.key] || 8), 0) / totalTakes).toFixed(1)
                  : "8.0";
                const pct = (parseFloat(avg) / pillar.max) * 100;
                return (
                  <div key={pillar.title} className="benchmark-card">
                    <div className="card-top">
                      <span className="pillar-name">{pillar.title}</span>
                      <strong className="pillar-score">{avg} <small>/{pillar.max}</small></strong>
                    </div>
                    <div className="pillar-progress-track">
                      <div className="pillar-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="pillar-desc">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="benchmark-export-box">
              <div>
                <h4>READY TO DISTRIBUTE COHORT REPORT?</h4>
                <p>Download structured data with full transcripts, 50-mark evaluations, and acoustic timestamps.</p>
              </div>
              <button type="button" className="action-btn is-primary" onClick={exportBatchCSV}>
                <FiDownload /> DOWNLOAD COMPLETE CSV REPORT
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
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
    <section className="login-panel"><button className="login-brand" onClick={() => window.location.reload()}><TinyMark /> ORA</button><div className="login-copy"><span className="eyebrow"><i /> BEGIN YOUR PRACTICE</span><h1>COME IN<br /><i>AS YOU ARE.</i></h1><p>A private space to hear how your speech moves — with no score attached.</p></div><form onSubmit={submit}><label>What should we call you?<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name for your voice notes" autoComplete="name" /></label><fieldset><legend>How are you practicing today?</legend><button type="button" className={role === "participant" ? "is-selected" : ""} onClick={() => setRole("participant")}><FiMic /><span><b>Speaker</b><small>Practice privately or send a completed take to a room.</small></span><FiCheck /></button><button type="button" className={role === "leader" ? "is-selected" : ""} onClick={() => setRole("leader")}><FiUsers /><span><b>Leader</b><small>Open a room and receive your speakers’ takes.</small></span><FiCheck /></button><button type="button" className={role === "analyst" ? "is-selected" : ""} onClick={() => setRole("analyst")}><FiBarChart2 /><span><b>Speak Analyst</b><small>Upload folders of audio to analyze historical growth trends.</small></span><FiCheck /></button></fieldset>{error && <p className="login-error">{error}</p>}<button className="login-submit" type="submit">Enter ORA <FiArrowUpRight /></button></form><small className="login-note">Your speech map and history stay in this browser, separated by name.</small></section>
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
  const goStudio = () => { setMenuOpen(false); jumpTo(user?.role === "analyst" ? "analyst-suite" : "studio"); };
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
        
        {user.role === "analyst" ? (
          <AnalystDashboard user={user} />
        ) : (
          <>
            <Studio user={user} onUserChange={updateUser} />
            <PracticeCards />
          </>
        )}
        
        <Archive user={user} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
