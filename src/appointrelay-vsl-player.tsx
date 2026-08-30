"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Expand, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { captureAttribution, getFunnelSessionId, trackFunnelEvent } from "@/src/funnel-analytics";
import styles from "./appointrelay-vsl-player.module.css";

const leadStorageKey = "dgc_appointrelay_vsl_lead";
const reviewLeadStorageKey = "dgc_google_review_program_vsl_lead";

export type AppointRelayVslLead = { name: string; email: string; phone: string };

export function readAppointRelayVslLead(): Partial<AppointRelayVslLead> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.sessionStorage.getItem(leadStorageKey) || "{}"); }
  catch { return {}; }
}

export function readGoogleReviewProgramVslLead(): Partial<AppointRelayVslLead> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.sessionStorage.getItem(reviewLeadStorageKey) || "{}"); }
  catch { return {}; }
}

function timeLabel(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  return `${minutes}:${Math.floor(value % 60).toString().padStart(2, "0")}`;
}

export function AppointRelayVslPlayer({ src, captions, gateAt = 60, mode = "appointrelay" }: { src: string; captions?: string; gateAt?: number; mode?: "appointrelay" | "google-review-program" }) {
  const reviewProgram = mode === "google-review-program";
  const funnel = reviewProgram ? "google-review-program" : "appointrelay";
  const eventPrefix = reviewProgram ? "google_review" : "appointrelay";
  const storageKey = reviewProgram ? reviewLeadStorageKey : leadStorageKey;
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasHeard = useRef(false);
  const lockTriggered = useRef(false);
  const pausedAt = useRef(gateAt);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const milestones = useRef(new Set<number>());
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [needsSound, setNeedsSound] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [speed, setSpeed] = useState(1);
  const [lead, setLead] = useState<AppointRelayVslLead>({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [gateError, setGateError] = useState("");

  function wakeControls() {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing && !gateOpen) hideTimer.current = setTimeout(() => setControlsVisible(false), 2500);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const attempt = video.play();
    attempt?.then(() => {
      setPlaying(true);
      setAutoplayBlocked(false);
      if (!hasHeard.current) setNeedsSound(true);
      trackFunnelEvent(funnel, `${eventPrefix}_vsl_started`);
    }).catch(() => {
      setPlaying(false);
      setAutoplayBlocked(true);
      setControlsVisible(true);
    });
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [eventPrefix, funnel]);

  async function startWithSound() {
    const video = videoRef.current;
    if (!video) return;
    hasHeard.current = true;
    video.currentTime = 0;
    video.muted = false;
    setMuted(false);
    setNeedsSound(false);
    setAutoplayBlocked(false);
    try { await video.play(); setPlaying(true); wakeControls(); }
    catch { video.muted = true; setMuted(true); setAutoplayBlocked(true); }
  }

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { try { await video.play(); setPlaying(true); } catch { setAutoplayBlocked(true); } }
    else { video.pause(); setPlaying(false); }
    wakeControls();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      hasHeard.current = true;
      video.muted = false;
      setMuted(false);
      setNeedsSound(false);
    } else {
      video.muted = true;
      setMuted(true);
    }
    wakeControls();
  }

  function seekBy(delta: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
  }

  function cycleSpeed() {
    const video = videoRef.current;
    if (!video) return;
    const speeds = [1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    video.playbackRate = next;
    setSpeed(next);
  }

  async function fullscreen() {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) await video.requestFullscreen();
    else (video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setGateError("");
    try {
      const response = await fetch("/api/funnel-lead", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          funnel, qualification: "manual-review", sessionId: getFunnelSessionId(funnel),
          ...lead,
          source: reviewProgram ? "Managed Google Review Program VSL unlock" : "AppointRelay VSL unlock",
          goal: reviewProgram ? "Reviewing The HVAC Google Review Growth Program presentation" : "Reviewing the AppointRelay workflow presentation",
          attribution: captureAttribution(reviewProgram ? "google_review_program" : "appointrelay"),
        }),
      });
      if (!response.ok) throw new Error("Lead capture failed");
      try { window.sessionStorage.setItem(storageKey, JSON.stringify(lead)); } catch { /* Prefill is optional. */ }
      trackFunnelEvent(funnel, `${eventPrefix}_vsl_lead_captured`);
      const video = videoRef.current;
      setUnlocked(true); setGateOpen(false); setSubmitting(false);
      if (video) { video.currentTime = pausedAt.current; await video.play(); setPlaying(true); }
      wakeControls();
    } catch { setGateError("I couldn’t save that yet. Please try again."); setSubmitting(false); }
  }

  function updateBuffered(video: HTMLVideoElement) {
    if (!video.duration || !video.buffered.length) return;
    setBuffered(video.buffered.end(video.buffered.length - 1));
  }

  return <div className={`${styles.player} ${controlsVisible ? styles.controlsVisible : ""}`} onMouseMove={wakeControls} onTouchStart={wakeControls} onFocusCapture={wakeControls}>
    <video
      ref={videoRef}
      className={styles.video}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      controlsList="nodownload"
      aria-label={reviewProgram ? "The HVAC Google Review Growth Program presentation" : "AppointRelay Controlled Relay Method presentation"}
      onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      onProgress={(event) => updateBuffered(event.currentTarget)}
      onPlay={() => { setPlaying(true); wakeControls(); }}
      onPause={() => { setPlaying(false); setControlsVisible(true); }}
      onEnded={() => { setPlaying(false); trackFunnelEvent(funnel, `${eventPrefix}_vsl_completed`); }}
      onTimeUpdate={(event) => {
        const video = event.currentTarget;
        setCurrentTime(video.currentTime);
        if (video.duration > 0) {
          const percent = Math.floor((video.currentTime / video.duration) * 100);
          [25, 50, 75].forEach((milestone) => {
            if (percent >= milestone && !milestones.current.has(milestone)) {
              milestones.current.add(milestone);
              trackFunnelEvent(funnel, `${eventPrefix}_vsl_progress`, { percent: milestone });
            }
          });
        }
        if (!unlocked && !video.muted && video.currentTime >= gateAt && !lockTriggered.current) {
          lockTriggered.current = true;
          pausedAt.current = video.currentTime;
          video.pause();
          setGateOpen(true);
          trackFunnelEvent(funnel, `${eventPrefix}_vsl_gate_viewed`, { gate_second: gateAt });
        }
      }}
    >
      {captions ? <track default kind="captions" src={captions} srcLang="en" label="English" /> : null}
    </video>
    <div className={styles.shade} />
    {needsSound && !autoplayBlocked ? <button className={styles.sound} type="button" onClick={startWithSound}><Volume2 aria-hidden="true" /> Tap for sound · restarts at 0:00</button> : null}
    {autoplayBlocked ? <button className={styles.fallback} type="button" onClick={startWithSound}><Play aria-hidden="true" fill="currentColor" /><strong>Play the presentation</strong><span>Starts from the beginning with sound</span></button> : null}
    {!unlocked ? <div className={styles.preControls} aria-label="Video controls"><button className={styles.control} type="button" onClick={toggleMute} aria-label={muted ? "Unmute video" : "Mute video"}>{muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}</button></div> : null}
    {unlocked ? <div className={styles.fullControls} aria-label="Full video controls"><button className={styles.control} type="button" onClick={togglePlay} aria-label={playing ? "Pause video" : "Play video"}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button><button className={styles.control} type="button" onClick={() => seekBy(-10)} aria-label="Back 10 seconds"><RotateCcw aria-hidden="true" /></button><button className={styles.control} type="button" onClick={() => seekBy(10)} aria-label="Forward 10 seconds"><RotateCw aria-hidden="true" /></button><div className={styles.timelineWrap} onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setHoverTime(Math.max(0, Math.min(duration, ((event.clientX - rect.left) / rect.width) * duration))); }} onMouseLeave={() => setHoverTime(null)}><div className={styles.timelineTrack}><i className={styles.timelineBuffered} style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }} /><i className={styles.timelinePlayed} style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} /></div><input className={styles.timeline} type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={(event) => { const video = videoRef.current; if (video) video.currentTime = Number(event.target.value); }} aria-label="Video position" />{hoverTime !== null ? <span className={styles.timelineTooltip} style={{ left: `${duration ? (hoverTime / duration) * 100 : 0}%` }}>{timeLabel(hoverTime)}</span> : null}</div><span className={styles.time}>{timeLabel(currentTime)} / {timeLabel(duration)}</span><button className={styles.control} type="button" onClick={cycleSpeed} aria-label="Change playback speed">{speed}×</button><button className={styles.control} type="button" onClick={toggleMute} aria-label={muted ? "Unmute video" : "Mute video"}>{muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}</button><button className={styles.control} type="button" onClick={fullscreen} aria-label="View fullscreen"><Expand aria-hidden="true" /></button></div> : null}
    {gateOpen ? <div className={styles.gate} role="dialog" aria-modal="true" aria-labelledby="vsl-gate-title"><form className={styles.gateCard} onSubmit={unlock}><span>KEEP WATCHING</span><h3 id="vsl-gate-title">{reviewProgram ? "Where should I send the program notes?" : "Where should I send the workflow notes?"}</h3><p>Enter your business contact details. The video resumes from this exact point.</p><div className={styles.gateFields}><label>Name<input required autoComplete="name" value={lead.name} onChange={(event) => setLead({ ...lead, name: event.target.value })} /></label><label>Work email<input required type="email" autoComplete="email" value={lead.email} onChange={(event) => setLead({ ...lead, email: event.target.value })} /></label><label>Mobile phone<input required type="tel" autoComplete="tel" value={lead.phone} onChange={(event) => setLead({ ...lead, phone: event.target.value })} /></label></div><button className={styles.gateSubmit} type="submit" disabled={submitting}>{submitting ? "Saving…" : "Continue the presentation"}</button>{gateError ? <p className={styles.gateError} role="alert">{gateError}</p> : null}<p className={styles.gatePrivacy}>No customer data. By continuing, you agree to be contacted about this {reviewProgram ? "program" : "workflow"} review. <a href={reviewProgram ? "/google-reviews/terms/" : "/appointrelay/terms/"}>Terms</a> · <a href={reviewProgram ? "/google-reviews/privacy/" : "/appointrelay/privacy/"}>Privacy</a></p></form></div> : null}
  </div>;
}
