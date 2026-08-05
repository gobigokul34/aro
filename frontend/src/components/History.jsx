import { useEffect, useState } from "react";
import TranscriptModal from "./TranscriptModal";

export default function History() {
  const [history, setHistory] = useState([]);
  const [selectedSpeech, setSelectedSpeech] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data =
      JSON.parse(localStorage.getItem("speechHistory")) || [];

    setHistory(data);
  };

  const deleteSpeech = (id) => {
    const updated = history.filter(
      (speech) => speech.id !== id
    );

    localStorage.setItem(
      "speechHistory",
      JSON.stringify(updated)
    );

    setHistory(updated);
  };

  if (history.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 mt-6">
        <h2 className="text-2xl font-bold mb-4">
          🎤 Speech History
        </h2>

        <p className="text-gray-400">
          No speeches yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-900 rounded-xl p-6 mt-6">
        <h2 className="text-2xl font-bold mb-6">
          🎤 Speech History
        </h2>

        {history.map((item, index) => (
          <div
            key={item.id}
            className="bg-slate-800 rounded-xl p-5 mb-5 border border-slate-700 hover:border-cyan-500 transition"
          >
            <div className="flex justify-between items-start">

              <div>
                <h3 className="text-lg font-semibold text-cyan-400">
                  Speech #{history.length - index}
                </h3>

                <p className="text-gray-400 text-sm">
                  {item.date}
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => setSelectedSpeech(item)}
                  className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg"
                >
                  View
                </button>

                <button
                  onClick={() => deleteSpeech(item.id)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                >
                  Delete
                </button>

              </div>

            </div>

            <div className="grid grid-cols-3 gap-4 mt-5">

              <div>
                <p className="text-gray-400 text-sm">
                  Language
                </p>

                <p className="font-semibold">
                  {item.language}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">
                  Duration
                </p>

                <p className="font-semibold">
                  {Math.round(item.duration || 0)} sec
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">
                  Words
                </p>

                <p className="font-semibold">
                  {item.transcript
                    ? item.transcript.split(/\s+/).length
                    : 0}
                </p>
              </div>

            </div>

            <div className="mt-5 bg-slate-700 rounded-lg p-4">

              <p className="text-gray-300 line-clamp-3">
                {item.transcript}
              </p>

            </div>

          </div>
        ))}
      </div>

      <TranscriptModal
        speech={selectedSpeech}
        onClose={() => setSelectedSpeech(null)}
      />
    </>
  );
}