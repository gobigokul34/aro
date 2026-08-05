export default function Transcript({ transcript = "" }) {
  return (
    <div className="bg-slate-900 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-5">
        Live Transcript
      </h2>

      <div className="bg-slate-800 rounded-lg p-4 min-h-[250px]">
        {transcript ? (
          <p className="text-gray-300">
            {transcript}
          </p>
        ) : (
          <p className="text-gray-500">
            Start speaking to see your transcript here...
          </p>
        )}
      </div>
    </div>
  );
}