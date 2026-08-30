"use client";

import { useEffect } from "react";

type Props = { mode: "goal" | "forecast"; clients: number; held: number; booked: number; emails: number; days: number; profit: number };

const tip: Record<string, string> = {
  "Close rate": "How many held appointments become clients.",
  "Appointment show rate": "How many booked calls actually happen.",
  "Positive reply rate": "Of people who reply, how many want to talk?",
  "Total reply rate": "Of delivered emails, how many reply at all?",
  "Emails per day": "The daily action that powers every result here.",
  "Outreach days / month": "How many days you will actually send outreach.",
};

export function useCalculatorUx({ mode, clients, held, booked, emails, days, profit }: Props) {
  useEffect(() => {
    const fields = Array.from(document.querySelectorAll<HTMLElement>(".simple-field"));
    fields.forEach(field => {
      const label = field.querySelector("label")?.textContent?.trim();
      if (!label || !tip[label] || field.querySelector(".ux-tip")) return;
      const note = document.createElement("small"); note.className = "ux-tip"; note.textContent = tip[label]; field.append(note);
    });

    const output = document.querySelector<HTMLElement>(".simple-output");
    if (!output) return;
    let change = document.querySelector<HTMLElement>("#ux-change");
    if (!change) { change = document.createElement("p"); change.id = "ux-change"; change.className = "ux-change"; output.prepend(change); }
    change.textContent = mode === "goal" ? "Move an assumption to see the work change immediately." : "Every result below is driven by your outreach inputs.";

    let checklist = document.querySelector<HTMLElement>("#ux-checklist");
    if (!checklist) { checklist = document.createElement("section"); checklist.id = "ux-checklist"; checklist.className = "ux-checklist"; output.append(checklist); }
    checklist.innerHTML = mode === "goal"
      ? `<span>Your next-step checklist</span><div><b>Send ${Math.ceil(emails / Math.max(1, days))} emails</b><small>each outreach day</small></div><div><b>Book ${booked.toFixed(1)} appointments</b><small>each month</small></div><div><b>Hold ${held.toFixed(1)} appointments</b><small>each month</small></div><div><b>Close ${clients.toFixed(1)} clients</b><small>each month</small></div>`
      : `<span>What this means</span><div><b>${clients.toFixed(1)} new clients</b><small>projected per month</small></div><div><b>$${Math.round(profit).toLocaleString()}</b><small>estimated cash profit</small></div>`;

    const listener = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.matches("input[type=range]")) return;
      const field = input.closest(".simple-field");
      const label = field?.querySelector("label")?.textContent?.trim() || "This assumption";
      change!.textContent = `${label} changed — the plan and forecast have updated.`;
    };
    document.addEventListener("input", listener);
    return () => document.removeEventListener("input", listener);
  }, [mode, clients, held, booked, emails, days, profit]);

  useEffect(() => {
    const steps = Array.from(document.querySelectorAll<HTMLElement>(".funnel-step"));
    const cleanups = steps.map(step => { const handler = () => { steps.forEach(item => item.classList.remove("ux-active-step")); step.classList.add("ux-active-step"); }; step.addEventListener("click", handler); return () => step.removeEventListener("click", handler); });
    return () => cleanups.forEach(cleanup => cleanup());
  }, [mode]);
}
