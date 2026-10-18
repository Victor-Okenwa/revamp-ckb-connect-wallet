import { useEffect, useState } from "react";

const words = ["compose", "style", "format"];

export function HeroTitle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
      <span className="hero-line">A CKB connect wallet you</span>{" "}
      <span key={words[index]} className="hero-word">
        {words[index]}
      </span>{" "}
      <span className="hero-line hero-line-delay">yourself.</span>
    </h1>
  );
}
