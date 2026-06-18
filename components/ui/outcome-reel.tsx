import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type OutcomeReelItem = {
  quote: string;
  author: string;
};

type OutcomeReelProps = {
  items: OutcomeReelItem[];
  className?: string;
};

export function OutcomeReel({ items, className }: OutcomeReelProps) {
  return (
    <div className={cn("outcome-reel", className)} aria-label="DaytonGrowthCo outcomes">
      {items.map((item, index) => (
        <motion.article
          className="outcome-reel-card"
          key={item.author}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.42, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>&ldquo;{item.quote}&rdquo;</p>
          <span>{item.author}</span>
        </motion.article>
      ))}
    </div>
  );
}
