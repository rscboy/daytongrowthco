"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

type ClearInputBaseProps = {
  wrapperClassName?: string;
  endAdornment?: React.ReactNode;
  clearLabel?: string;
  inputRef?: React.Ref<HTMLInputElement>;
};

type ControlledClearInputProps = ClearInputBaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    value: string;
    onValueChange: (value: string) => void;
  };

type NativeClearInputProps = ClearInputBaseProps & React.InputHTMLAttributes<HTMLInputElement>;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function msVar(styles: CSSStyleDeclaration, name: string, fallback: number) {
  const value = styles.getPropertyValue(name).trim();
  if (!value) return fallback;
  if (value.endsWith("ms")) return Number.parseFloat(value) || fallback;
  if (value.endsWith("s")) return (Number.parseFloat(value) || fallback / 1000) * 1000;
  return Number.parseFloat(value) || fallback;
}

function numberVar(styles: CSSStyleDeclaration, name: string, fallback: number) {
  const value = Number.parseFloat(styles.getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

function runClearAnimation(
  wrap: HTMLDivElement,
  mirror: HTMLDivElement,
  placeholder: HTMLDivElement,
  glow: HTMLDivElement,
  value: string,
  onMidpoint: () => void,
  onDone: () => void,
) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !value.trim()) {
    onMidpoint();
    onDone();
    return;
  }

  const styles = getComputedStyle(wrap);
  const duration = msVar(styles, "--clear-dur", 1000);
  const outFly = numberVar(styles, "--clear-out-fly", 12);
  const inFly = numberVar(styles, "--clear-in-fly", 12);
  const blur = numberVar(styles, "--clear-blur", 2);
  const glowDelay = msVar(styles, "--glow-delay", 50);
  const glowPeakAt = numberVar(styles, "--glow-peak-at", 0.15);
  const glowOpacity = numberVar(styles, "--glow-opacity", 0.42);
  const glowSpread = numberVar(styles, "--glow-spread", 1.5);
  const rect = wrap.getBoundingClientRect();
  const words = value.trim().split(/\s+/).slice(0, 7);
  const measure = document.createElement("canvas").getContext("2d");
  if (measure) {
    const inputStyles = getComputedStyle(wrap.querySelector("input") ?? wrap);
    measure.font = `${inputStyles.fontWeight} ${inputStyles.fontSize} ${inputStyles.fontFamily}`;
  }
  const totalTextWidth =
    measure?.measureText(value).width || Math.max(40, Math.min(rect.width * 0.72, value.length * 8));
  let cursor = Math.max(16, Number.parseFloat(styles.paddingLeft) || 14);
  const wordPositions = words.map((word) => {
    const width = measure?.measureText(word).width || word.length * 8;
    const position = {
      x: Math.min(rect.width - 12, cursor + width / 2),
      y: rect.height / 2,
      r: Math.max(18, width * 0.42 * glowSpread),
    };
    cursor += width + Math.max(5, totalTextWidth / Math.max(12, value.length));
    return position;
  });

  let cleared = false;
  let frame = 0;
  const started = performance.now();
  wrap.classList.add("is-clearing");

  const tick = (now: number) => {
    const elapsed = now - started;
    const progress = Math.min(1, elapsed / duration);
    const outProgress = Math.min(1, progress / 0.46);
    const inProgress = Math.min(1, Math.max(0, (progress - 0.28) / 0.48));
    const outEase = easeOut(outProgress);
    const inEase = easeOut(inProgress);

    if (!cleared && progress >= 0.2) {
      cleared = true;
      onMidpoint();
    }

    mirror.style.opacity = `${1 - outEase}`;
    mirror.style.transform = `translateY(${-outFly * outEase}px)`;
    mirror.style.filter = `blur(${blur * outEase}px)`;
    placeholder.style.opacity = `${inEase}`;
    placeholder.style.transform = `translateY(${inFly * (1 - inEase)}px)`;
    placeholder.style.filter = `blur(${blur * (1 - inEase)}px)`;

    const glowProgress = Math.max(0, Math.min(1, (elapsed - glowDelay) / (duration * 0.5)));
    const glowEnvelope =
      glowProgress <= glowPeakAt
        ? glowProgress / Math.max(0.01, glowPeakAt)
        : Math.max(0, 1 - (glowProgress - glowPeakAt) / Math.max(0.01, 1 - glowPeakAt));
    glow.style.opacity = `${glowEnvelope * glowOpacity}`;
    glow.style.background = wordPositions
      .map((word, index) => {
        const rise = easeOut(Math.max(0, glowProgress - index * 0.045));
        const y = word.y - rise * 18;
        return `radial-gradient(circle at ${word.x}px ${y}px, rgba(240, 208, 176, 0.7) 0, rgba(42, 40, 128, 0.22) ${word.r * 0.38}px, transparent ${word.r}px)`;
      })
      .join(",");

    if (progress < 1) {
      frame = window.requestAnimationFrame(tick);
      return;
    }

    window.cancelAnimationFrame(frame);
    mirror.style.opacity = "";
    mirror.style.transform = "";
    mirror.style.filter = "";
    placeholder.style.opacity = "";
    placeholder.style.transform = "";
    placeholder.style.filter = "";
    glow.style.opacity = "";
    glow.style.background = "";
    wrap.classList.remove("is-clearing");
    onDone();
  };

  frame = window.requestAnimationFrame(tick);
}

function ClearChrome({
  value,
  placeholder,
  clearLabel = "Clear field",
  wrapperClassName,
  endAdornment,
  input,
  onClear,
}: ClearInputBaseProps & {
  value: string;
  placeholder?: string;
  input: React.ReactNode;
  onClear: (input: HTMLInputElement) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [mirrorValue, setMirrorValue] = useState(value);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!isClearing) setMirrorValue(value);
  }, [isClearing, value]);

  const hasValue = value.length > 0;
  const classes = useMemo(
    () =>
      [
        "t-clear",
        hasValue ? "has-value" : "",
        isClearing ? "is-clearing" : "",
        endAdornment ? "has-end-adornment" : "",
        wrapperClassName ?? "",
      ]
        .filter(Boolean)
        .join(" "),
    [endAdornment, hasValue, isClearing, wrapperClassName],
  );

  const clear = () => {
    const wrap = wrapRef.current;
    const mirror = mirrorRef.current;
    const placeholderEl = placeholderRef.current;
    const glow = glowRef.current;
    const inputEl = wrap?.querySelector("input");
    if (!wrap || !mirror || !placeholderEl || !glow || !inputEl || !value) return;

    setMirrorValue(value);
    setIsClearing(true);
    runClearAnimation(
      wrap,
      mirror,
      placeholderEl,
      glow,
      value,
      () => onClear(inputEl),
      () => {
        setIsClearing(false);
        inputEl.focus();
      },
    );
  };

  return (
    <div className={classes} ref={wrapRef}>
      {input}
      <div className="t-clear-mirror" aria-hidden="true" ref={mirrorRef}>
        {mirrorValue}
      </div>
      <div className="t-clear-placeholder" aria-hidden="true" ref={placeholderRef}>
        {placeholder}
      </div>
      <div className="t-clear-glow" aria-hidden="true" ref={glowRef} />
      {endAdornment}
      {hasValue || isClearing ? (
        <button type="button" className="t-clear-btn" aria-label={clearLabel} onClick={clear}>
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export function ClearInput({ value, onValueChange, wrapperClassName, endAdornment, clearLabel, ...props }: ControlledClearInputProps) {
  const { inputRef, ...inputProps } = props;
  return (
    <ClearChrome
      value={value}
      placeholder={typeof inputProps.placeholder === "string" ? inputProps.placeholder : undefined}
      wrapperClassName={wrapperClassName}
      endAdornment={endAdornment}
      clearLabel={clearLabel}
      onClear={() => onValueChange("")}
      input={
        <input
          {...inputProps}
          ref={inputRef}
          value={value}
          onChange={(event) => onValueChange(event.currentTarget.value)}
        />
      }
    />
  );
}

export function ClearableNativeInput({ wrapperClassName, endAdornment, clearLabel, onInput, onChange, ...props }: NativeClearInputProps) {
  const { inputRef: forwardedInputRef, ...inputProps } = props;
  const [value, setValue] = useState(String(inputProps.defaultValue ?? inputProps.value ?? ""));

  useEffect(() => {
    if (inputProps.value !== undefined) setValue(String(inputProps.value));
  }, [inputProps.value]);

  const syncValue = (event: React.FormEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
    (onInput as React.FormEventHandler<HTMLInputElement> | undefined)?.(event);
  };

  const clearNative = (input: HTMLInputElement) => {
    input.value = "";
    setValue("");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <ClearChrome
      value={value}
      placeholder={typeof inputProps.placeholder === "string" ? inputProps.placeholder : undefined}
      wrapperClassName={wrapperClassName}
      endAdornment={endAdornment}
      clearLabel={clearLabel}
      onClear={clearNative}
      input={
        <input
          {...inputProps}
          ref={forwardedInputRef}
          onInput={syncValue}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            onChange?.(event);
          }}
        />
      }
    />
  );
}
