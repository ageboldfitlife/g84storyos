import ShotRuntimeSandbox from '@/components/ShotRuntimeSandbox';

export default function SandboxPage() {
  return (
    <div className="p-8 min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <div className="max-w-4xl mx-auto border border-zinc-800 rounded-lg p-6 bg-zinc-900">
        <h1 className="text-2xl font-bold mb-2 text-yellow-500">G84 CineOS — Core Engine Sandbox</h1>
        <p className="text-zinc-400 mb-8">Khu vực kiểm thử độc lập luồng State & Pure Functions của Shot Runtime.</p>

        {/* Mount component Sandbox của sếp vào đây */}
        <ShotRuntimeSandbox />
      </div>
    </div>
  );
}
