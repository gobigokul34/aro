import { buildReport } from "./report";

const COACHING_PHRASES = [
  "keep the spacious pace",
  "trade fillers for a breath",
  "give the idea more air",
  "carry the thought forward",
  "place one intentional pause"
];

// Calculate Levenshtein distance between two strings
export function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

// Clean title of versioning suffixes, dates, numbers, extensions
export function cleanTitle(title) {
  if (!title) return "";
  return title
    .replace(/\.(mp3|wav|m4a|webm|flac|ogg|aac)$/i, "")
    .replace(/[_-]?(take\s*#?\d+|take\b|v\d+|part\s*\d+|draft|final|rev\d+|\d{4}[-_]\d{2}[-_]\d{2}).*$/i, "")
    .replace(/#\d+/g, "")
    .replace(/\s+\d+$/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

// Extract true topic from session, avoiding generic coaching advice
export function getSessionTopic(session) {
  if (session.topic && session.topic.trim()) return session.topic.trim();
  if (session.name && session.name.trim()) return session.name.trim();
  if (session.title && session.title.trim()) return session.title.trim();

  const focusTitle = (session.report?.focus?.title || "").toLowerCase().trim();
  const isCoachingPhrase = COACHING_PHRASES.some((phrase) => focusTitle.includes(phrase));

  if (session.report?.focus?.title && !isCoachingPhrase) {
    return session.report.focus.title.trim();
  }

  // Infer from beginning of transcript if available
  if (session.transcript && session.transcript.trim()) {
    const words = session.transcript.trim().split(/\s+/).slice(0, 4);
    if (words.length > 0) {
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }

  return "Speech Practice";
}

// Safe similarity checker between two cleaned topic strings
function isSimilarTopic(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;

  const minLen = Math.min(a.length, b.length);
  const maxLen = Math.max(a.length, b.length);

  // Substring inclusion with length proportion check
  if (minLen >= 4 && (a.includes(b) || b.includes(a)) && (minLen / maxLen) >= 0.55) {
    return true;
  }

  // Normalized Levenshtein distance
  const dist = levenshtein(a, b);
  if (maxLen <= 4) return dist === 0;
  if (maxLen <= 7) return dist <= 1;
  const similarity = 1 - dist / maxLen;
  return similarity >= 0.72;
}

// Group sessions based on similar speech topics
export function groupSimilarTakes(sessions) {
  const groups = {};

  if (!sessions || sessions.length === 0) return groups;

  sessions.forEach((session) => {
    const rawTopic = getSessionTopic(session);
    const cleaned = cleanTitle(rawTopic) || "speech practice";

    let matchedGroup = null;

    for (const groupKey of Object.keys(groups)) {
      if (isSimilarTopic(cleaned, groupKey)) {
        matchedGroup = groupKey;
        break;
      }
    }

    if (matchedGroup) {
      groups[matchedGroup].push(session);
    } else {
      groups[cleaned] = [session];
    }
  });

  return groups;
}

// Safe metric extractor resolving top-level and nested report properties
export function getSessionMetric(obj, path) {
  if (!obj) return 0;
  const report = obj.report || buildReport(obj);

  switch (path) {
    case "score":
    case "report.evaluation.total":
    case "evaluation.total":
      return report.evaluation?.total || 40;

    case "wpm":
    case "report.wpm":
      if (report.wpm) return Math.round(report.wpm);
      if (obj.duration > 0 && report.words > 0) {
        return Math.round(report.words / (obj.duration / 60));
      }
      return 0;

    case "words":
    case "report.words":
      return report.words || (obj.transcript ? obj.transcript.trim().split(/\s+/).filter(Boolean).length : 0);

    case "duration":
    case "report.duration":
      return Math.round(obj.duration || report.duration || 0);

    case "pronunciation":
    case "report.evaluation.pronunciation":
      return report.evaluation?.pronunciation || 8;

    case "vocabulary":
    case "report.evaluation.vocabulary":
      return report.evaluation?.vocabulary || 8;

    case "grammar":
    case "report.evaluation.grammar":
      return report.evaluation?.grammar || 8;

    case "fluency":
    case "report.evaluation.fluency":
      return report.evaluation?.fluency || 8;

    case "coherence":
    case "report.evaluation.coherence":
      return report.evaluation?.coherence || 8;

    default:
      const val = path
        .split(".")
        .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), { ...obj, report });
      return typeof val === "number" ? val : parseFloat(val) || 0;
  }
}

// Calculate the growth trend across chronologically sorted sessions
export function calculateTrend(group, metricKey) {
  const sorted = [...group].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (sorted.length === 0) {
    return {
      metric: metricKey,
      trend: "neutral",
      isBaseline: true,
      pctChange: 0,
      delta: 0,
      startValue: 0,
      endValue: 0,
      progression: [],
    };
  }

  const progression = sorted.map((s, idx) => {
    const val = getSessionMetric(s, metricKey);
    return {
      takeNumber: idx + 1,
      date: s.createdAt,
      value: val,
      takeName: s.topic || s.name || s.report?.focus?.title || `Take #${idx + 1}`,
    };
  });

  const startValue = progression[0].value;
  const endValue = progression[progression.length - 1].value;
  const delta = endValue - startValue;

  if (sorted.length === 1) {
    return {
      metric: metricKey,
      trend: "neutral",
      isBaseline: true,
      count: 1,
      pctChange: 0,
      delta: 0,
      startValue,
      endValue,
      progression,
    };
  }

  let pctChange = 0;
  if (startValue === 0 && endValue > 0) {
    pctChange = 100;
  } else if (startValue > 0) {
    pctChange = parseFloat((((endValue - startValue) / startValue) * 100).toFixed(1));
  }

  let trend = "neutral";
  if (pctChange > 1.5 || (metricKey.includes("score") && delta >= 1)) trend = "growth";
  else if (pctChange < -1.5 || (metricKey.includes("score") && delta <= -1)) trend = "decline";

  return {
    metric: metricKey,
    trend,
    isBaseline: false,
    count: sorted.length,
    startValue,
    endValue,
    delta: parseFloat(delta.toFixed(1)),
    pctChange,
    progression,
  };
}
