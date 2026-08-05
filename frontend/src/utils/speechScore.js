export function calculateSpeechScore({
  words,
  fillers,
  wpm,
}) {
  let score = 100;

  // Too short
  if (words < 20) score -= 20;

  // Too many fillers
  score -= fillers * 5;

  // Speaking pace
  if (wpm < 90) score -= 10;
  if (wpm > 170) score -= 10;

  return Math.max(score, 0);
}