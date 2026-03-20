export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-marble-950 overflow-hidden">
      {/* Geometric triangle decorations */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        {/* Large faint triangle – bottom-left */}
        <polygon
          points="0,900 400,500 0,400"
          className="fill-marble-900/40"
        />
        {/* Medium triangle – top-right */}
        <polygon
          points="1440,0 1050,350 1440,400"
          className="fill-marble-900/30"
        />
        {/* Small accent triangle – center-right */}
        <polygon
          points="1200,600 1350,450 1440,650"
          className="fill-golden/5"
        />
        {/* Tiny triangle – upper-left */}
        <polygon
          points="200,50 350,200 100,200"
          className="fill-marble-900/20"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
