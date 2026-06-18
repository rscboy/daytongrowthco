import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type DisplayCardItem = {
  title: string;
  description: string;
  meta: string;
  icon: LucideIcon;
};

type DisplayCardsProps = {
  cards: DisplayCardItem[];
  tone?: "light" | "dark";
  className?: string;
};

export function DisplayCards({ cards, tone = "light", className }: DisplayCardsProps) {
  return (
    <div className={cn("display-cards", `display-cards-${tone}`, className)} aria-label="Workflow activity cards">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.article
            className="display-card"
            key={card.title}
            initial={{ opacity: 0, y: 18, rotate: index === 0 ? -1.5 : index === 1 ? 1.2 : -0.6 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ "--card-index": index } as CSSProperties}
          >
            <span className="display-card-icon" aria-hidden="true">
              <Icon size={16} strokeWidth={1.9} />
            </span>
            <div>
              <strong>{card.title}</strong>
              <p>{card.description}</p>
            </div>
            <small>{card.meta}</small>
          </motion.article>
        );
      })}
    </div>
  );
}
