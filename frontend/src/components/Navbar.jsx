export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">

      <div className="max-w-7xl mx-auto flex justify-between items-center p-5">

        <h1 className="text-2xl font-bold text-cyan-400">
          SpeakAI
        </h1>

        <div className="hidden md:flex gap-8 text-slate-300">

          <a href="#">Home</a>

          <a href="#">Dashboard</a>

          <a href="#">About</a>

        </div>

      </div>

    </nav>
  );
}