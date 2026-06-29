import { AnimatePresence, motion } from "framer-motion";
import { useInterval } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type AnimatedHeroPhraseProps = {
  phrases: string[];
  suffix?: string;
  className?: string;
};

export function AnimatedHeroPhrase({ phrases, suffix = ".", className }: AnimatedHeroPhraseProps) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useInterval(
    () => {
      setIndex((current) => (current + 1) % phrases.length);
    },
    reduceMotion ? null : 2600,
  );

  return (
    <span className={cn("animated-hero-phrase", className)}>
      <span className="sr-only">{phrases[0]}{suffix}</span>
      <span aria-hidden="true">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={phrases[index]}
            initial={reduceMotion ? false : { opacity: 0, y: "0.5em" }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: "-0.5em",
                    // Departing text builds momentum with an ease-in curve.
                    transition: { duration: 0.42, ease: [0.4, 0, 1, 1] },
                  }
            }
            transition={{ duration: reduceMotion ? 0.2 : 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {phrases[index]}
            {suffix}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
