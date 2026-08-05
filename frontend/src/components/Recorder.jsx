import useRecorder from "../hooks/useRecorder";
import { FaMicrophone, FaStop } from "react-icons/fa";
import AnalyticsGrid from "./AnalyticsGrid";
import CoachFeedback from "./CoachFeedback";
import DownloadButtons from "./DownloadButtons";
import UploadAudio from "./UploadAudio";

export default function Recorder() {
  const {
    recording,
    audioURL,
    transcript,
    language,
    duration,
    startRecording,
    stopRecording,
    analyzeFile,
  } = useRecorder();

  return (
    <div className="bg-slate-900 rounded-xl p-6">

      <h2 className="text-xl font-semibold mb-5">
        Speech Session
      </h2>

      {!recording ? (
        <button
          onClick={startRecording}
          className="bg-cyan-500 px-6 py-3 rounded-lg flex gap-3 items-center hover:bg-cyan-600"
        >
          <FaMicrophone />
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="bg-red-500 px-6 py-3 rounded-lg flex gap-3 items-center hover:bg-red-600"
        >
          <FaStop />
          Stop Recording
        </button>
      )}

      {audioURL && (
        <div className="mt-6 bg-slate-800 rounded-lg p-4">
          <audio controls src={audioURL} className="w-full" />
        </div>
      )}

      <UploadAudio onUpload={analyzeFile} />

      {transcript && (
        <>
          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Transcript
            </h3>

            <div className="bg-slate-700 rounded-lg p-4 h-40 overflow-y-auto">
              <p className="text-gray-300 whitespace-pre-wrap">
                {transcript}
              </p>
            </div>

            <DownloadButtons
              transcript={transcript}
              duration={duration}
            />
          </div>

          <AnalyticsGrid
            transcript={transcript}
            duration={duration}
            language={language}
          />

          <CoachFeedback
            transcript={transcript}
          />
        </>
      )}

    </div>
  );
}