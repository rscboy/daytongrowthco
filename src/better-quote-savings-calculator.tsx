"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { calculateBetterQuoteSavings } from "./better-quote-pricing";
import styles from "./better-quote-savings-calculator.module.css";

const QUOTE_STATE_KEY = "dgc:better-quote-estimate";

function amount(value: string) {
  return Math.max(0, Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0);
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function cleanAmount(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole = "", ...decimalParts] = cleaned.split(".");
  if (decimalParts.length === 0) return whole;
  return `${whole}.${decimalParts.join("").slice(0, 2)}`;
}

function formatAmount(value: string) {
  if (!value.trim()) return "";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount(value));
}

/** A light, standalone explainer for the homepage, intentionally not part of the quote funnel. */
export function BetterQuoteSavingsCalculator() {
  const [current, setCurrent] = useState("10000");
  const [alternative, setAlternative] = useState("7000");
  const [announcement, setAnnouncement] = useState("");
  const currentId = useId();
  const alternativeId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(QUOTE_STATE_KEY);
      if (!saved) return;
      const values = JSON.parse(saved) as { current?: string; alternative?: string };
      if (typeof values.current === "string") setCurrent(cleanAmount(values.current));
      if (typeof values.alternative === "string") setAlternative(cleanAmount(values.alternative));
    } catch {
      /* The estimator remains fully usable when storage is unavailable. */
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(QUOTE_STATE_KEY, JSON.stringify({ current, alternative }));
    } catch {
      /* Persistence is a convenience, never a requirement. */
    }
  }, [current, alternative]);

  const currentAmount = amount(current);
  const alternativeAmount = amount(alternative);
  const hasCurrent = current.trim().length > 0 && currentAmount > 0;
  const hasAlternative = alternative.trim().length > 0;
  const hasComparison = hasCurrent && hasAlternative;
  const hasSavings = hasComparison && alternativeAmount < currentAmount;
  const result = calculateBetterQuoteSavings(currentAmount, alternativeAmount);
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeOut" as const };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!hasComparison) {
        setAnnouncement("Enter both quote amounts to estimate your savings.");
      } else if (!hasSavings) {
        setAnnouncement("Enter a lower comparable quote to estimate savings.");
      } else {
        setAnnouncement(`Your estimated net savings are ${money(result.netSavings)}.`);
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [hasComparison, hasSavings, result.netSavings]);

  const resultKey = hasSavings ? money(result.netSavings) : hasComparison ? "no-savings" : "empty";

  return (
    <section className={styles.section} aria-labelledby="bq-savings-title">
      <div className={styles.shell}>
        <header className={styles.intro}>
          <span className={styles.eyebrow}>Better Quote calculator</span>
          <h2 id="bq-savings-title">See what a better quote could save.</h2>
          <p className={styles.introCopy}>
            Compare your current quote with a legitimate lower option to see the fee and your estimated net savings.
          </p>
          <p className={styles.trustCue}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m5.5 10.2 2.7 2.7 6.3-6.4" />
            </svg>
            Real people review every eligible comparison.
          </p>
        </header>

        <div className={styles.calculator}>
          <header className={styles.panelHeader}>
            <span>Quote comparison</span>
            <h3>Estimate your savings</h3>
            <p>Enter two comparable written quotes.</p>
          </header>

          <fieldset className={styles.quoteGroup}>
            <legend className={styles.srOnly}>Quote amounts</legend>
            <div className={styles.inputs}>
              <label className={styles.field} htmlFor={currentId}>
                <span className={styles.fieldLabel}>Current quote</span>
                <span className={styles.inputShell}>
                  <span className={styles.currency} aria-hidden="true">$</span>
                  <input
                    id={currentId}
                    aria-label="Current quote amount"
                    aria-describedby={`${currentId}-help`}
                    inputMode="decimal"
                    autoComplete="off"
                    value={current}
                    onChange={(event) => setCurrent(cleanAmount(event.target.value))}
                    onBlur={() => setCurrent(formatAmount(current))}
                  />
                </span>
                <small id={`${currentId}-help`}>What you would pay today</small>
              </label>

              <span className={styles.comparisonMark} aria-hidden="true">vs</span>

              <label className={styles.field} htmlFor={alternativeId}>
                <span className={styles.fieldLabel}>Comparable lower quote</span>
                <span className={styles.inputShell}>
                  <span className={styles.currency} aria-hidden="true">$</span>
                  <input
                    id={alternativeId}
                    aria-label="Comparable lower quote amount"
                    aria-describedby={`${alternativeId}-help`}
                    inputMode="decimal"
                    autoComplete="off"
                    value={alternative}
                    onChange={(event) => setAlternative(cleanAmount(event.target.value))}
                    onBlur={() => setAlternative(formatAmount(alternative))}
                  />
                </span>
                <small id={`${alternativeId}-help`}>The legitimate lower option</small>
              </label>
            </div>
          </fieldset>

          <div className={styles.results} data-ready={hasSavings ? "true" : "false"}>
            <div className={styles.primaryResult}>
              <span>Your estimated net savings</span>
              <motion.strong
                key={resultKey}
                initial={reduceMotion ? false : { opacity: 0.58, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
              >
                {hasSavings ? money(result.netSavings) : "—"}
              </motion.strong>
              <p className={styles.resultStatus}>
                {!hasComparison
                  ? "Enter both quote amounts to see the estimate."
                  : hasSavings
                    ? "Estimated amount you keep after the success fee."
                    : "Enter a lower comparable quote to estimate savings."}
              </p>
              <div
                className={styles.savingsScale}
                aria-label={hasSavings ? `Estimated net savings retain ${Math.round((result.netSavings / result.grossSavings) * 100)} percent of the quote difference after the success fee.` : "Savings comparison will appear after two qualifying quotes are entered."}
              >
                <span
                  className={styles.savingsFill}
                  style={{ transform: `scaleX(${hasSavings && result.grossSavings > 0 ? Math.max(0, Math.min(1, result.netSavings / result.grossSavings)) : 0})` }}
                />
              </div>
            </div>

            <dl className={styles.breakdown} aria-label="Savings calculation">
              <div>
                <dt>Difference between quotes</dt>
                <dd>{hasSavings ? money(result.grossSavings) : money(0)}</dd>
              </div>
              <div>
                <dt>Success fee</dt>
                <dd>{result.fee > 0 && hasSavings ? `−${money(result.fee)}` : money(0)}</dd>
              </div>
              <div className={styles.netResult}>
                <dt>Estimated net savings</dt>
                <dd>{hasSavings ? money(result.netSavings) : money(0)}</dd>
              </div>
            </dl>
          </div>

          <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
            {announcement}
          </span>

          <div className={styles.footer}>
            <p className={styles.note}>
              <strong>No savings, no fee.</strong> Illustrative estimate.{" "}
              <a href="/quote/pricing">View the fee schedule.</a>
            </p>
            <a className={styles.action} href="/quote/start/">
              Start a conversation
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
