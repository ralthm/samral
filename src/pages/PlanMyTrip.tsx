import { useEffect } from "react";

export default function PlanMyTrip() {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://tally.so/widgets/embed.js"]'
    );
    if (existing) {
      // @ts-expect-error Tally global
      window.Tally?.loadEmbeds?.();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <main className="min-h-screen w-full bg-background">
      <iframe
        data-tally-src="https://tally.so/r/WOBWyL?transparentBackground=1"
        src="https://tally.so/r/WOBWyL?transparentBackground=1"
        loading="lazy"
        width="100%"
        height="100%"
        frameBorder={0}
        marginHeight={0}
        marginWidth={0}
        title="Points Travel Plan"
        className="block h-screen min-h-screen w-full border-0"
      />
    </main>
  );
}
