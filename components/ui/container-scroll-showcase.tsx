import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef } from "react";

type ContainerScrollShowcaseProps = {
  title: string;
  text: string;
  children: ReactNode;
  className?: string;
};

export function ContainerScrollShowcase({ title, text, children, className }: ContainerScrollShowcaseProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 82%", "end 35%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [22, 0]);

  return (
    <section ref={ref} className={cn("container-showcase", className)} aria-labelledby="system-showcase-heading">
      <div className="container-showcase-copy">
        <h2 id="system-showcase-heading">{title}</h2>
        <p>{text}</p>
      </div>
      <motion.div className="container-showcase-frame" style={{ scale, y }}>
        {children}
      </motion.div>
    </section>
  );
}
