/**
 * Utility to extract real-time and post-recording Amplitude Envelope data from audio Blobs/Buffers.
 */

// Generate realistic synthetic amplitude envelope fallback when audio decode is unavailable
export function generateSyntheticEnvelope(durationSeconds = 10, pauseCount = 0, numPoints = 80) {
  const points = [];
  const duration = Math.max(1, durationSeconds);
  const step = duration / numPoints;

  // Insert pause regions if pauseCount > 0
  const pauseInterval = pauseCount > 0 ? numPoints / (pauseCount + 1) : -1;

  for (let i = 0; i < numPoints; i++) {
    const time = i * step;
    const isNearPause = pauseCount > 0 && Math.abs((i % Math.floor(pauseInterval)) - 0) < 3 && i > 5 && i < numPoints - 5;

    let peak;
    let rms;

    if (isNearPause) {
      peak = Math.random() * 0.05 + 0.01;
      rms = peak * 0.4;
    } else {
      // Natural speech rhythm curve (sine waves + noise + envelope modulation)
      const base = 0.35 + 0.35 * Math.sin((i / numPoints) * Math.PI * 4);
      const speechPulse = 0.25 * Math.abs(Math.sin(i * 0.4)) + 0.1 * Math.sin(i * 0.8);
      const noise = (Math.random() - 0.5) * 0.15;
      
      peak = Math.min(0.98, Math.max(0.08, base + speechPulse + noise));
      rms = Math.min(peak * 0.8, Math.max(0.04, peak * 0.6 + noise * 0.3));
    }

    const db = peak > 0.01 ? Math.round(20 * Math.log10(peak)) : -40;

    points.push({
      index: i,
      time: Math.round(time * 10) / 10,
      peak: Math.round(peak * 100) / 100,
      rms: Math.round(rms * 100) / 100,
      db: Math.max(-42, db),
      isPause: peak < 0.08,
    });
  }

  return points;
}

// Extract real Amplitude Envelope from Audio Blob using Web Audio API
export async function extractAmplitudeEnvelope(audioSource, numPoints = 80) {
  if (!audioSource) {
    return generateSyntheticEnvelope(10, 0, numPoints);
  }

  try {
    let arrayBuffer;

    if (audioSource instanceof Blob) {
      arrayBuffer = await audioSource.arrayBuffer();
    } else if (typeof audioSource === "string") {
      const response = await fetch(audioSource);
      arrayBuffer = await response.arrayBuffer();
    } else {
      return generateSyntheticEnvelope(10, 0, numPoints);
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return generateSyntheticEnvelope(10, 0, numPoints);

    const context = new AudioCtx();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    
    // Close temporary decoding context
    if (context.state !== "closed") context.close();

    const channelData = audioBuffer.getChannelData(0);
    const totalSamples = channelData.length;
    const duration = audioBuffer.duration || 1;
    const samplesPerPoint = Math.floor(totalSamples / numPoints);

    if (samplesPerPoint <= 0) return generateSyntheticEnvelope(duration, 0, numPoints);

    const points = [];
    let maxGlobalPeak = 0;

    for (let i = 0; i < numPoints; i++) {
      const start = i * samplesPerPoint;
      const end = Math.min(start + samplesPerPoint, totalSamples);
      
      let maxSample = 0;
      let sumSquare = 0;
      let count = 0;

      for (let j = start; j < end; j++) {
        const val = Math.abs(channelData[j]);
        if (val > maxSample) maxSample = val;
        sumSquare += val * val;
        count++;
      }

      const rms = count > 0 ? Math.sqrt(sumSquare / count) : 0;
      if (maxSample > maxGlobalPeak) maxGlobalPeak = maxSample;

      points.push({
        index: i,
        time: (i / numPoints) * duration,
        peak: maxSample,
        rms: rms,
      });
    }

    // Normalize peaks to 0..1 range and calculate dB
    const scale = maxGlobalPeak > 0 ? 1 / maxGlobalPeak : 1;
    
    return points.map((p) => {
      const normPeak = Math.min(1, p.peak * scale);
      const normRms = Math.min(normPeak, p.rms * scale * 1.4);
      const db = normPeak > 0.005 ? Math.round(20 * Math.log10(normPeak)) : -40;
      
      return {
        ...p,
        time: Math.round(p.time * 10) / 10,
        peak: Math.round(normPeak * 100) / 100,
        rms: Math.round(normRms * 100) / 100,
        db: Math.max(-42, db),
        isPause: normPeak < 0.07,
      };
    });

  } catch (err) {
    console.warn("Could not decode audio for amplitude envelope extraction, falling back:", err);
    return generateSyntheticEnvelope(10, 0, numPoints);
  }
}
