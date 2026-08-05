const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "actually",
  "basically",
  "you know",
  "so",
];

export function getWordCount(text = "") {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getFillerCount(text = "") {
  const words = text.toLowerCase().split(/\s+/);

  let count = 0;

  words.forEach((word) => {
    if (FILLER_WORDS.includes(word)) {
      count++;
    }
  });

  return count;
}

export function getWPM(wordCount, durationSeconds) {
  if (!durationSeconds) return 0;

  return Math.round(wordCount / (durationSeconds / 60));
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);

  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}