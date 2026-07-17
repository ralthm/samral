import { useEffect } from "react";

export default function PlanMyTrip() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Points Travel Plan";
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const loadEmbeds = () => {
      // @ts-expect-error Tally global
      window.Tally?.loadEmbeds?.();
    };

    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://tally.so/widgets/embed.js"]'
    );
    if (!script) {
      script = document.createElement("script");
      script.src = "https://tally.so/widgets/embed.js";
      script.async = true;
      script.onload = loadEmbeds;
      document.body.appendChild(script);
    } else {
      loadEmbeds();
    }

    return () => {
      document.title = prevTitle;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <iframe
      data-tally-src="https://tally.so/r/WOBWyL"
      src="https://tally.so/r/WOBWyL"
      loading="lazy"
      width="100%"
      height="100%"
      frameBorder={0}
      marginHeight={0}
      marginWidth={0}
      title="Points Travel Plan"
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, border: 0, width: "100%", height: "100%" }}
    />
  );
}
