import {
  downloadTXT,
  downloadDOCX,
} from "../utils/download";

import {
  getWordCount,
  getFillerCount,
  getWPM,
  formatDuration,
} from "../utils/analytics";

import { calculateSpeechScore } from "../utils/speechScore";

export default function DownloadButtons({
  transcript,
  duration,
}) {
  if (!transcript) return null;

  const words = getWordCount(transcript);

  const fillers = getFillerCount(transcript);

  const wpm = getWPM(words, duration);

  const score = calculateSpeechScore({
    words,
    fillers,
    wpm,
  });

  return (
    <div className="flex gap-4 mt-4">

      <button
        onClick={() => downloadTXT(transcript)}
        className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg"
      >
        📄 TXT
      </button>

      <button
        onClick={() =>
          downloadDOCX({
            transcript,
            duration: formatDuration(duration),
            words,
            wpm,
            fillers,
            score,
          })
        }
        className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg"
      >
        📄 DOCX
      </button>

    </div>
  );
}