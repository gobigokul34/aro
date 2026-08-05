export default function UploadAudio({ onUpload }) {

  const handleFile = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    onUpload(file);

  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 mt-6">

      <h2 className="text-xl font-semibold mb-4">
        Upload Audio
      </h2>

      <input
        type="file"
        accept=".mp3,.wav,.m4a,.webm"
        onChange={handleFile}
      />

    </div>
  );
}