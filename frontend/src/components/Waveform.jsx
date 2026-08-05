import { useEffect, useRef } from "react";

export default function Waveform({ recording }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!recording) return;

    let audioContext;
    let analyser;
    let animationId;

    async function startVisualizer() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      audioContext = new AudioContext();

      const source = audioContext.createMediaStreamSource(stream);

      analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;

      source.connect(analyser);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function draw() {
        animationId = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / bufferLength;

        dataArray.forEach((value, i) => {
          const height = value;

          ctx.fillStyle = "#22d3ee";

          ctx.fillRect(
            i * barWidth,
            canvas.height - height,
            barWidth - 1,
            height
          );
        });
      }

      draw();
    }

    startVisualizer();

    return () => {
      cancelAnimationFrame(animationId);
      if (audioContext) audioContext.close();
    };
  }, [recording]);

  return (
    <div className="bg-slate-900 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">
        Live Waveform
      </h2>

      <canvas
        ref={canvasRef}
        width={700}
        height={180}
        className="w-full bg-slate-800 rounded-lg"
      />
    </div>
  );
}