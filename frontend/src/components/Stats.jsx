const stats = [
  { title: "Grammar", value: "98%" },
  { title: "WPM", value: "145" },
  { title: "Emotion", value: "😊 Happy" },
  { title: "Confidence", value: "91%" },
  { title: "Eye Contact", value: "89%" },
  { title: "Filler Words", value: "2" },
];

export default function Stats() {
  return (
    <div className="grid grid-cols-2 gap-4">

      {stats.map((item) => (
        <div
          key={item.title}
          className="bg-slate-900 rounded-xl p-5"
        >
          <p className="text-slate-400">{item.title}</p>

          <h2 className="text-2xl font-bold mt-2">

            {item.value}

          </h2>

        </div>
      ))}

    </div>
  );
}