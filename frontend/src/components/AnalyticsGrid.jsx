import {
  getWordCount,
  getFillerCount,
  getWPM,
  formatDuration,
} from "../utils/analytics";
import { calculateSpeechScore } from "../utils/speechScore";

export default function AnalyticsGrid({
  transcript,
  duration,
  language,
}) {
  const words = getWordCount(transcript);

  const fillers = getFillerCount(transcript);

  const wpm = duration > 0 ? getWPM(words, duration) : "N/A";

  const score = calculateSpeechScore({
  words,
  fillers,
  wpm,
});

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">

      <Card
        title="Duration"
        value={duration > 0 ? formatDuration(duration) : "Unknown"}
      />

      <Card
        title="Words"
        value={words}
      />

      <Card
        title="WPM"
        value={wpm}
      />

      <Card
        title="Language"
        value={language || "Unknown"}
      />

      <Card
        title="Fillers"
        value={fillers}
      />
      <Card
        title="Score"
        value={`${score}/100`}
      />

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 text-center border border-slate-700 hover:border-cyan-500 transition duration-300">
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2 text-cyan-400">
        {value}
      </h2>
    </div>
  );
}