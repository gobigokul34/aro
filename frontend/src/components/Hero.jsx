import { FaMicrophone } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="text-center py-20 px-5">

      <h1 className="text-6xl font-bold">

        AI Public Speaking Coach

      </h1>

      <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">

        Improve your communication skills with AI-powered
        speech analysis, grammar correction, emotion detection,
        eye-contact tracking and real-time feedback.

      </p>

      <button className="mt-10 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition flex items-center gap-3 mx-auto">

        <FaMicrophone />

        Start Speaking

      </button>

    </section>
  );
}