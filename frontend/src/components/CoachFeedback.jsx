export default function CoachFeedback({ transcript }) {
  if (!transcript) return null;

  const feedback = [];

  const words = transcript.trim().split(/\s+/).length;

  if (words < 20) {
    feedback.push("⚠ Your speech is very short. Try speaking for at least 30 seconds.");
  } else {
    feedback.push("✅ Good speech length.");
  }

  if (transcript.includes("um") || transcript.includes("uh")) {
    feedback.push("⚠ Filler words detected. Try pausing instead.");
  } else {
    feedback.push("✅ No filler words detected.");
  }

  if (words > 150) {
    feedback.push("⚠ Long speech. Consider shorter sentences.");
  }

  feedback.push("✅ Transcript generated successfully.");

  return (
    <div className="bg-slate-900 rounded-xl p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">
        AI Coach Feedback
      </h2>

      <ul className="space-y-3">
        {feedback.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}