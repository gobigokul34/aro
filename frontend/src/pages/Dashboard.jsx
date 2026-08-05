import Recorder from "../components/Recorder";
import Waveform from "../components/Waveform";
import AnalyticsGrid from "../components/AnalyticsGrid";
import CoachFeedback from "../components/CoachFeedback";

export default function Dashboard() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">

      <div className="grid lg:grid-cols-2 gap-6">

        <Recorder />

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Transcript
          </h2>

          {/* We'll move TranscriptPanel here next */}
        </div>

      </div>

      <Waveform />

      {/* Analytics */}

      {/* Feedback */}

    </section>
  );
}