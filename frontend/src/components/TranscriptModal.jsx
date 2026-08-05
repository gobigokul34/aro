export default function TranscriptModal({
  speech,
  onClose,
}) {
  if (!speech) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div className="bg-slate-900 w-11/12 max-w-3xl rounded-xl p-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-cyan-400">
            Speech Details
          </h2>

          <button
            onClick={onClose}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Close
          </button>

        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">

          <div>
            <p className="text-gray-400">Language</p>
            <p>{speech.language}</p>
          </div>

          <div>
            <p className="text-gray-400">Duration</p>
            <p>{Math.round(speech.duration)} sec</p>
          </div>

          <div>
            <p className="text-gray-400">Words</p>
            <p>{speech.transcript.split(/\s+/).length}</p>
          </div>

        </div>

        <div className="bg-slate-800 rounded-lg p-4 h-80 overflow-y-auto">

          <p className="whitespace-pre-wrap text-gray-300">
            {speech.transcript}
          </p>

        </div>

      </div>

    </div>
  );
}