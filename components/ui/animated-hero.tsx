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
      <AnimatePresence initial={false}>
        <motion.span
          key={phrases[index]}
          initial={reduceMotion ? false : { opacity: 0, y: "0.12em" }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "-0.08em" }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {phrases[index]}
          {suffix}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
