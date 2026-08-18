import { useState } from "react";
import styles from "./brand-wordmark.module.css";

type BrandWordmarkProps = {
  className?: string;
  interactive?: boolean;
  onDark?: boolean;
  onDarkGrowthOnly?: boolean;
};

/** The selectable, text-based DaytonGrowthCo. wordmark used across the site. */
export function BrandWordmark({ className = "", interactive = false, onDark = false, onDarkGrowthOnly = false }: BrandWordmarkProps) {
  const [isCondensed, setIsCondensed] = useState(false);
  const classes = [styles.wordmark, interactive ? styles.interactive : "", isCondensed ? styles.isCondensed : "", onDark ? styles.onDark : "", onDarkGrowthOnly ? styles.onDarkGrowthOnly : "", className]
    .filter(Boolean)
    .join(" ");

  const fullWordmark = (
    <span className={interactive ? styles.full : ""}>
      <span className={styles.dayton}>Dayton</span>
      <span className={styles.growth}>Growth</span>
      <span className={styles.co}>Co.</span>
    </span>
  );

  return (
    <span
      className={classes}
      onPointerEnter={interactive ? (event) => event.pointerType === "mouse" && setIsCondensed(true) : undefined}
      onPointerLeave={interactive ? (event) => event.pointerType === "mouse" && setIsCondensed(false) : undefined}
    >
      {fullWordmark}
      {interactive ? (
        <span className={styles.short} aria-hidden="true">
          <span className={styles.dayton}>D</span><span>G</span><span>C</span>
        </span>
      ) : null}
    </span>
  );
}
