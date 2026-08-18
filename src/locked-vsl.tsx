"use client";

import { Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./locked-vsl.css";

export function LockedVsl({ src, poster, title, onStart, onProgress, onComplete }: { src?: string; poster?: string; title: string; onStart?: () => void; onProgress?: (percent: 25 | 50 | 75) => void; onComplete?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const startNotified = useRef(false);
  const progressNotified = useRef<Set<number>>(new Set());
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [needsUnmute, setNeedsUnmute] = useState(true);

  function notifyStart() {
    if (startNotified.current) return;
    startNotified.current = true;
    onStart?.();
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const autoplay = video.play();
    autoplay?.then(() => {
      setStarted(true);
      setPlaying(true);
      notifyStart();
    }).catch(() => {
      setPlaying(false);
      setShowOverlay(true);
    });
  }, []);

  if (!src) return null;

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setStarted(true);
        setPlaying(true);
        notifyStart();
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
      setPlaying(false);
      setShowOverlay(true);
    }
  }

  function seekBy(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  }

  async function unmute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    try {
      await video.play();
      setStarted(true);
      setPlaying(true);
      setNeedsUnmute(false);
      setShowOverlay(false);
      notifyStart();
    } catch {
      video.muted = true;
    }
  }

  return <div className={`locked-vsl ${started ? "locked-vsl-started" : ""} ${showOverlay || !playing ? "locked-vsl-overlay-visible" : ""}`} onMouseEnter={() => setShowOverlay(true)} onMouseLeave={() => { if (playing) setShowOverlay(false); }} onFocusCapture={() => setShowOverlay(true)}>
    <video
      ref={videoRef}
      className="locked-vsl-video"
      src={src}
      poster={poster}
      playsInline
      preload="auto"
      controls={started}
      controlsList="nodownload"
      disablePictureInPicture
      tabIndex={-1}
      aria-label={title}
      onClick={togglePlayback}
      onContextMenu={(event) => event.preventDefault()}
      onPlay={() => {
        setStarted(true);
        setPlaying(true);
        notifyStart();
      }}
      onPause={() => { setPlaying(false); setShowOverlay(true); }}
      onVolumeChange={(event) => { if (!event.currentTarget.muted) setNeedsUnmute(false); }}
      onTimeUpdate={(event) => {
        const video = event.currentTarget;
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        const percent = (video.currentTime / video.duration) * 100;
        ([25, 50, 75] as const).forEach((milestone) => {
          if (percent >= milestone && !progressNotified.current.has(milestone)) {
            progressNotified.current.add(milestone);
            onProgress?.(milestone);
          }
        });
      }}
      onEnded={() => { setPlaying(false); onComplete?.(); }}
    />
    <div className="locked-vsl-transport" aria-label="Video controls">
      <button className="locked-vsl-skip" type="button" onClick={() => seekBy(-10)} aria-label="Back 10 seconds"><RotateCcw aria-hidden="true" /><span>10</span></button>
      <button className="locked-vsl-control" type="button" onClick={togglePlayback} aria-label={playing ? "Pause video" : "Start video with sound"}>
        {playing ? <Pause aria-hidden="true" fill="currentColor" /> : <Play aria-hidden="true" fill="currentColor" />}
      </button>
      <button className="locked-vsl-skip" type="button" onClick={() => seekBy(10)} aria-label="Forward 10 seconds"><RotateCw aria-hidden="true" /><span>10</span></button>
    </div>
    {needsUnmute && <button className="locked-vsl-unmute" type="button" onClick={unmute} aria-label="Unmute video"><span className="locked-vsl-volume"><Volume2 aria-hidden="true" /><i /><i /><i /></span><strong>Your video is playing</strong><span>Click to unmute</span></button>}
    <span className="sr-only" aria-live="polite">{playing ? "Video playing" : started ? "Video paused" : "Video ready to start"}</span>
  </div>;
}
