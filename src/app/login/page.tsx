"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Butterfly SVG path
function Butterfly({ x, y, scale, opacity, flip }: { x: number; y: number; scale: number; opacity: number; flip: boolean }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -scale : scale}, ${scale})`} opacity={opacity}>
      {/* Left wing */}
      <path
        d="M0,0 C-30,-40 -70,-35 -60,-10 C-50,10 -20,15 0,0"
        fill="#86efac"
        stroke="#4ade80"
        strokeWidth="0.5"
      />
      {/* Right wing */}
      <path
        d="M0,0 C30,-40 70,-35 60,-10 C50,10 20,15 0,0"
        fill="#a7f3d0"
        stroke="#34d399"
        strokeWidth="0.5"
      />
      {/* Lower left wing */}
      <path
        d="M0,0 C-25,10 -45,35 -30,40 C-15,45 -5,25 0,0"
        fill="#6ee7b7"
        stroke="#4ade80"
        strokeWidth="0.5"
      />
      {/* Lower right wing */}
      <path
        d="M0,0 C25,10 45,35 30,40 C15,45 5,25 0,0"
        fill="#a7f3d0"
        stroke="#34d399"
        strokeWidth="0.5"
      />
      {/* Body */}
      <ellipse cx="0" cy="10" rx="2" ry="12" fill="#065f46" />
      {/* Antennae */}
      <line x1="0" y1="0" x2="-12" y2="-18" stroke="#065f46" strokeWidth="0.8" />
      <circle cx="-12" cy="-18" r="1.5" fill="#065f46" />
      <line x1="0" y1="0" x2="12" y2="-18" stroke="#065f46" strokeWidth="0.8" />
      <circle cx="12" cy="-18" r="1.5" fill="#065f46" />
    </g>
  );
}

function ButterflyCanvas() {
  const [dims, setDims] = useState({ w: 1200, h: 800 });
  const posRef = useRef<{ x: number; y: number; speedX: number; speedY: number; flip: boolean; scale: number; opacity: number }[]>([]);
  const [positions, setPositions] = useState<typeof posRef.current>([]);
  const frameRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setDims({ w, h });

    posRef.current = Array.from({ length: 14 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.6,
      scale: 0.4 + Math.random() * 0.5,
      opacity: 0.35 + Math.random() * 0.45,
      flip: Math.random() > 0.5,
    }));
    setPositions(posRef.current.map(p => ({ ...p })));
    setMounted(true);

    const update = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      setDims({ w: cw, h: ch });
      posRef.current = posRef.current.map(p => {
        let { x, y, speedX, speedY, flip, scale, opacity } = p;
        x += speedX;
        y += speedY;
        if (x < -80) x = cw + 80;
        if (x > cw + 80) x = -80;
        if (y < -80) y = ch + 80;
        if (y > ch + 80) y = -80;
        if (speedX < 0) flip = true;
        if (speedX > 0) flip = false;
        return { x, y, speedX, speedY, flip, scale, opacity };
      });
      setPositions(posRef.current.map(p => ({ ...p })));
      frameRef.current = requestAnimationFrame(update);
    };
    frameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  if (!mounted) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${dims.w} ${dims.h}`} preserveAspectRatio="none">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)">
        {positions.map((p, i) => (
          <Butterfly key={i} x={p.x} y={p.y} scale={p.scale} opacity={p.opacity} flip={p.flip} />
        ))}
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid username or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Animated pastel green gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 animate-pulse" style={{ animationDuration: "4s" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(134,239,172,0.5)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(167,243,208,0.4)_0%,transparent_60%)]" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />

      {/* Butterflies */}
      <ButterflyCanvas />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-2xl shadow-green-200/50 p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center leading-none font-black text-6xl select-none drop-shadow-sm mb-1">
              <span className="text-[#f37021]">G</span>
              <span className="text-[#22c55e]">7</span>
              <span className="text-red-500">R</span>
              <span className="text-blue-600">R</span>
            </div>
            <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Point of Sale</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 tracking-wide">Username</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 tracking-wide">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center bg-red-50 rounded-lg py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 transition shadow-lg shadow-emerald-200 mt-2"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
