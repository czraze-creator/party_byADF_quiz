export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,184,212,0.55), transparent)",
          animation: "var(--animate-float-1)",
        }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(20,229,154,0.35), transparent)",
          animation: "var(--animate-float-2)",
        }}
      />
      <div
        className="absolute -bottom-48 left-1/4 h-[640px] w-[640px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,184,212,0.4), transparent)",
          animation: "var(--animate-float-3)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
