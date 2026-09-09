"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { isService, type ServiceId } from "./catalog";
import { schedulerEvent, serviceFromHash } from "./entry";
import styles from "./scheduler.module.css";

const Scheduler = dynamic(() => import("./scheduler"), { loading: () => <div className={styles.loadingShell} role="status"><span>Making room for your next step…</span><div className={styles.skeleton} /></div> });

export function SchedulingSection() {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [entry, setEntry] = useState<{ service?: ServiceId; sequence: number }>({ sequence: 0 });
  useEffect(() => {
    const open = (event: Event) => {
      const service = (event as CustomEvent<{ service?: unknown }>).detail?.service;
      setReady(true); setEntry(current => ({ service: isService(service) ? service : undefined, sequence: current.sequence + 1 }));
    };
    const hash = () => {
      if (!window.location.hash.startsWith("#schedule")) return;
      setReady(true); setEntry(current => ({ service: serviceFromHash(window.location.hash), sequence: current.sequence + 1 }));
      root.current?.scrollIntoView({ block: "start", behavior: "auto" });
      document.getElementById("scheduler-heading")?.focus({ preventScroll: true });
    };
    window.addEventListener(schedulerEvent, open); window.addEventListener("hashchange", hash); hash();
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); } }, { rootMargin: "350px" });
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); window.removeEventListener(schedulerEvent, open); window.removeEventListener("hashchange", hash); };
  }, []);
  return <section className={`${styles.section} homepage-component`} id="schedule" data-scheduler="true" ref={root} aria-labelledby="scheduler-heading">
    <div className={styles.shell}>
      <header className={styles.sectionHeading}><div><span className={styles.eyebrow}>A useful first conversation</span><h2 id="scheduler-heading" tabIndex={-1}>What could<br />work better?</h2></div><div><p className={styles.promise}>Bring one challenge.<br />Leave with a clear next step.</p><p>Choose what’s on your mind. We’ll make room for it.</p></div></header>
      {ready ? <Scheduler entry={entry} /> : <div className={styles.loadingShell}><button className={styles.primary} type="button" onClick={() => setReady(true)}>Find a time <span aria-hidden="true">↗</span></button></div>}
      <noscript><p>To schedule, enable JavaScript or <a href="mailto:help@daytongrowth.co">email help@daytongrowth.co</a>. Existing booking routes are available for <a href="/website/#assessment">website migration</a>, <a href="/google-reviews/book-call/">review growth</a>, and <a href="/appointrelay/">AppointRelay</a>.</p></noscript>
    </div>
  </section>;
}
