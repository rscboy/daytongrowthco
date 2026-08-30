import { AnimatePresence, motion } from "framer-motion";
import { useInterval } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type AnimatedHeroPhraseProps = {
  phrases: string[];
  suffix?: string;
  className?: string;
  ariaHidden?: boolean;
};

export function AnimatedHeroPhrase({ phrases, suffix = ".", className, ariaHidden = false }: AnimatedHeroPhraseProps) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const firstPhrase = phrases[0] ?? "";

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduceMotion(query.matches);
      if (query.matches) setIndex(0);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useInterval(
    () => {
      setIndex((current) => (current + 1) % phrases.length);
    },
    reduceMotion || !pageVisible || phrases.length < 2 ? null : 2800,
  );

  return (
    <span className={cn("animated-hero-phrase", className)} aria-hidden={ariaHidden || undefined}>
      {ariaHidden ? null : <span className="sr-only">{firstPhrase}{suffix}</span>}
      <span className="animated-hero-phrase-sizer" aria-hidden="true">
        {phrases.map((phrase) => <span key={phrase}>{phrase}{suffix}</span>)}
      </span>
      <span className="animated-hero-phrase-viewport" aria-hidden="true">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={phrases[index] ?? firstPhrase}
            initial={reduceMotion ? false : { opacity: 0, y: "0.18em" }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: "-0.18em",
                    transition: { duration: 0.24, ease: [0.4, 0, 1, 1] },
                  }
            }
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {phrases[index] ?? firstPhrase}
            {suffix}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
