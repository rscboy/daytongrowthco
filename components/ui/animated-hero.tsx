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
    <span className={cn("animated-hero-phrase", className)} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={phrases[index]}
          initial={reduceMotion ? false : { opacity: 0, y: "0.28em", filter: "blur(6px)" }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "-0.18em", filter: "blur(5px)" }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          {phrases[index]}
          {suffix}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
