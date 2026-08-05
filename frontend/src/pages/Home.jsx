import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Recorder from "../components/Recorder";
import Waveform from "../components/Waveform";
import Transcript from "../components/Transcript";
import Stats from "../components/Stats";
import History from "../components/History";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <Hero />

      <main className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-2 gap-8">

        <div className="space-y-6">
          <Recorder />
          <History />
          <Waveform recording={true} />
        </div>

        <div className="space-y-6">
          <Transcript />
          <Stats />
        </div>

      </main>
    </div>
  );
}