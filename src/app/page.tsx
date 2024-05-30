import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-wrap gap-4">
        <Link href="/timelapse">Timelapse Demo </Link>
        <Link href="/artcritic">Art Critic Demo </Link>
        <Link href="/exploration">Exploration</Link>
        <Link href="/experts">Experts Demo </Link>
        <Link href="/whatsthis">What is This?</Link>
        <Link href="/realtime">Realtime image generation</Link>
        <Link href="/debate">Debate Simulator</Link>
        <Link href="/agents">Agent Simulator</Link>
        <Link href="/panorama">Panorama Viewer</Link>
        <Link href="/drawing">Sketch to Image</Link>
        <Link href="/speech">Speech to Text</Link>
        <Link href="/exploration/start">Start Exploration</Link>
      </div>
    </main>
  );
}