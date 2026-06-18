import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef } from "react";

type ScrollExpansionMediaProps = {
  children: ReactNode;
  className?: string;
};

export function ScrollExpansionMedia({ children, className }: ScrollExpansionMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 40%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [22, 12]);

  return (
    <motion.div ref={ref} className={cn("scroll-expansion-media", className)} style={{ scale, borderRadius }}>
      {children}
    </motion.div>
  );
}
