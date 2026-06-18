import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ExpandableTabItem = {
  label: string;
  icon: LucideIcon;
  description: string;
};

type ExpandableTabsProps = {
  tabs: ExpandableTabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  className?: string;
};

export function ExpandableTabs({ tabs, activeIndex, onChange, className }: ExpandableTabsProps) {
  return (
    <div className={cn("expandable-tabs", className)} role="tablist" aria-label="DaytonGrowthCo service categories">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const active = index === activeIndex;
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn("expandable-tab", active && "is-active")}
            onClick={() => onChange(index)}
          >
            {active ? <motion.span className="tab-active-bg" layoutId="active-service-tab" /> : null}
            <Icon size={15} aria-hidden="true" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
