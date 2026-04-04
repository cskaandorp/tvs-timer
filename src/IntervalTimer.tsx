"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { computePhase, type Phase } from "./computePhase";
import { Stepper } from "./Stepper";
import { defaultBeep } from "./audio";
import { DEFAULT_LABELS } from "./types";
import type { TimerConfig, TimerPreset, TimerLabels, TimerCallbacks } from "./types";

type TimerState = "idle" | "countdown" | "running" | "paused" | "done";

const RING_SIZE = 200;
const OUTER_STROKE = 6;
const INNER_STROKE = 8;
const OUTER_RADIUS = (RING_SIZE - OUTER_STROKE) / 2;
const INNER_RADIUS = OUTER_RADIUS - OUTER_STROKE / 2 - 6 - INNER_STROKE / 2;
const OUTER_CIRCUMFERENCE = 2 * Math.PI * OUTER_RADIUS;
const INNER_CIRCUMFERENCE = 2 * Math.PI * INNER_RADIUS;

function formatMMSS(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Inline SVG icons to avoid lucide-react dependency
const IconPlay = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>;
const IconPause = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
const IconBack = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
const IconBookmark = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>;
const IconTrash = () => <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>;

export interface IntervalTimerProps extends TimerCallbacks {
  config?: TimerConfig;
  labels?: Partial<TimerLabels>;
  userId?: string;
}

export function IntervalTimer({
  config,
  labels: labelOverrides,
  userId,
  onBeep,
  onClose,
  onFetchPresets,
  onSaveConfig,
  onSavePreset,
  onDeletePreset,
  onScheduleNotifications,
  onCancelNotifications,
}: IntervalTimerProps) {
  const t: TimerLabels = { ...DEFAULT_LABELS, ...labelOverrides };
  const beep = onBeep ?? defaultBeep;

  const [work, setWork] = useState(config?.work ?? 7);
  const [rest, setRest] = useState(config?.rest ?? 3);
  const [rounds, setRounds] = useState(config?.rounds ?? 6);
  const [sets, setSets] = useState(config?.sets ?? 1);
  const [pauseDuration, setPauseDuration] = useState(config?.pause ?? 180);
  const [countdownDuration, setCountdownDuration] = useState(config?.countdown ?? 5);

  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState("");

  const fetchPresets = useCallback(async () => {
    if (!onFetchPresets) return;
    try {
      const result = await onFetchPresets();
      setPresets(result);
    } catch { /* ignore */ }
  }, [onFetchPresets]);

  useEffect(() => { fetchPresets(); }, [fetchPresets]);

  const savePreset = async () => {
    const name = presetName.trim();
    if (!name || !onSavePreset) return;
    setSavingPreset(true);
    try {
      const config = { work, rest, rounds, sets, pause: pauseDuration, countdown: countdownDuration };
      const ok = await onSavePreset(name, config);
      if (ok) {
        setPresetName("");
        if (onSaveConfig) {
          onSaveConfig(config);
        } else {
          fetchPresets();
          start();
        }
      }
    } catch { /* ignore */ }
    setSavingPreset(false);
  };

  const deletePreset = async (id: string) => {
    if (!onDeletePreset) return;
    try {
      const ok = await onDeletePreset(id);
      if (ok) setPresets((p) => p.filter((pr) => pr.id !== id));
    } catch { /* ignore */ }
  };

  const loadPreset = (preset: TimerPreset) => {
    setWork(preset.config.work);
    setRest(preset.config.rest);
    setRounds(preset.config.rounds);
    setSets(preset.config.sets);
    setPauseDuration(preset.config.pause);
    setCountdownDuration(preset.config.countdown ?? 5);
  };

  const [state, setState] = useState<TimerState>("idle");
  const [phase, setPhase] = useState<Phase>("work");
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSet, setCurrentSet] = useState(1);
  const [displayTime, setDisplayTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [innerTransition, setInnerTransition] = useState(true);
  const [countdownValue, setCountdownValue] = useState(countdownDuration);

  const startedAtRef = useRef(0);
  const pausedElapsedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(0 as unknown as ReturnType<typeof setInterval>);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(0 as unknown as ReturnType<typeof setInterval>);
  const lastPhaseRef = useRef<string>("");

  const workMs = work * 1000;
  const restMs = rest * 1000;
  const pauseMs = pauseDuration * 1000;

  const getNotifSchedule = useCallback(() => ({
    workMs, restMs, rounds, pauseMs, sets,
    workLabel: t.work,
    restLabel: t.rest,
    pauseLabel: t.pausePhase,
    doneLabel: t.done,
  }), [workMs, restMs, rounds, pauseMs, sets, t]);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startedAtRef.current + pausedElapsedRef.current;
    const result = computePhase(elapsed, workMs, restMs, rounds, pauseMs, sets);

    if (result.done) {
      clearInterval(intervalRef.current);
      setState("done");
      setPhase("work");
      setDisplayTime(0);
      setProgress(1);
      setTotalProgress(1);
      setCurrentRound(rounds);
      setCurrentSet(sets);
      beep("done");
      return;
    }

    const phaseKey = `${result.set}-${result.round}-${result.phase}`;
    if (lastPhaseRef.current && lastPhaseRef.current !== phaseKey) {
      beep(result.phase === "work" ? "work" : "rest");
      setInnerTransition(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setInnerTransition(true));
      });
    }
    lastPhaseRef.current = phaseKey;

    setPhase(result.phase);
    setCurrentRound(result.round);
    setCurrentSet(result.set);
    setDisplayTime(Math.ceil(result.remaining / 1000));
    setProgress(result.progress);
    setTotalProgress(result.totalProgress);
  }, [workMs, restMs, rounds, pauseMs, sets, beep]);

  const startRunning = useCallback(() => {
    startedAtRef.current = Date.now();
    pausedElapsedRef.current = 0;
    lastPhaseRef.current = "";
    setState("running");
    setDisplayTime(work);
    setPhase("work");
    setCurrentRound(1);
    setCurrentSet(1);
    setProgress(0);
    setTotalProgress(0);
    beep("work");
    onScheduleNotifications?.(getNotifSchedule(), 0);
    intervalRef.current = setInterval(tick, 50);
  }, [tick, work, onBeep, onScheduleNotifications, getNotifSchedule]);

  const start = useCallback(() => {
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);

    setCountdownValue(countdownDuration);
    setState("countdown");
    setPhase("work");
    setProgress(0);
    setTotalProgress(0);
    beep("work");

    let count = countdownDuration;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownValue(count);
        beep(count === 1 ? "go" : "work");
      } else {
        clearInterval(countdownRef.current);
        startRunning();
      }
    }, 1000);
  }, [startRunning, onBeep, countdownDuration]);

  const handlePause = useCallback(() => {
    clearInterval(intervalRef.current);
    pausedElapsedRef.current += Date.now() - startedAtRef.current;
    setState("paused");
    onCancelNotifications?.();
  }, [onCancelNotifications]);

  const resumeTimer = useCallback(() => {
    startedAtRef.current = Date.now();
    setState("running");
    onScheduleNotifications?.(getNotifSchedule(), pausedElapsedRef.current);
    intervalRef.current = setInterval(tick, 50);
  }, [tick, onScheduleNotifications, getNotifSchedule]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
    setState("idle");
    setPhase("work");
    setCurrentRound(1);
    setCurrentSet(1);
    setDisplayTime(0);
    setProgress(0);
    setTotalProgress(0);
    pausedElapsedRef.current = 0;
    lastPhaseRef.current = "";
    onCancelNotifications?.();
  }, [onCancelNotifications]);

  // Visibility change: restart interval loop on resume
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && state === "running") {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(tick, 50);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [state, tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
      onCancelNotifications?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const outerOffset = OUTER_CIRCUMFERENCE * totalProgress;
  const innerOffset = INNER_CIRCUMFERENCE * (1 - progress);
  const COLOR_ACTIVE = "var(--intensity, #ef4444)";
  const COLOR_REST = "var(--recovery, #22c55e)";
  const COLOR_PAUSE = "#A78BFA";
  const COLOR_OVERALL = "#34D399";

  const ringColor =
    phase === "work" ? COLOR_ACTIVE :
    phase === "rest" ? COLOR_REST :
    COLOR_PAUSE;

  const phaseLabel =
    phase === "work" ? t.work :
    phase === "rest" ? t.rest :
    t.pausePhase;

  const btnBase = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors h-10 px-4 select-none";
  const btnPrimary = `${btnBase} bg-primary text-primary-foreground hover:bg-primary/90`;
  const btnOutline = `${btnBase} border border-border bg-background hover:bg-muted`;
  const btnIcon = `${btnBase} h-10 w-10 px-0 border border-border bg-background hover:bg-muted`;

  // Setup mode
  if (state === "idle") {
    const myPresets = presets.filter((p) => p.owner_id === userId);
    const coachPresets = presets.filter((p) => p.owner_id !== userId);

    return (
      <div className="flex flex-col gap-3 min-w-0">
        {presets.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {myPresets.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.myPresets}</p>
                <div className="flex flex-wrap gap-1.5">
                  {myPresets.map((p) => (
                    <div key={p.id} className="flex items-center gap-0.5">
                      <button
                        type="button"
                        className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted active:bg-muted transition-colors"
                        onClick={() => loadPreset(p)}
                      >
                        {p.name}
                      </button>
                      <button
                        type="button"
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => deletePreset(p.id)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {coachPresets.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.coachPresets}</p>
                <div className="flex flex-wrap gap-1.5">
                  {coachPresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted active:bg-muted transition-colors"
                      onClick={() => loadPreset(p)}
                    >
                      {p.name}
                      {p.owner_name && <span className="text-muted-foreground ml-1">· {p.owner_name}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 mb-2">
          <Stepper label={t.work} value={work} onChange={setWork} min={1} max={600} step={1} unit="s" />
          <Stepper label={t.rest} value={rest} onChange={setRest} min={0} max={600} step={1} unit="s" />
          <Stepper label={t.rounds} value={rounds} onChange={setRounds} min={1} max={99} step={1} unit="" />
          <Stepper label={t.sets} value={sets} onChange={setSets} min={1} max={20} step={1} unit="" />
          {sets > 1 && (
            <Stepper label={t.pause} value={pauseDuration} onChange={setPauseDuration} min={0} max={1800} step={15} unit="" formatValue={formatMMSS} />
          )}
          <Stepper label={t.countdown} value={countdownDuration} onChange={setCountdownDuration} min={3} max={60} step={1} unit="s" />
        </div>

        {onSavePreset && (
          <div className="flex gap-2 min-w-0">
            <input
              type="text"
              className="flex-1 min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              placeholder={t.presetName}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && presetName.trim()) savePreset(); }}
            />
            <button className={btnOutline} disabled={!presetName.trim() || savingPreset} onClick={savePreset}>
              <IconBookmark />
              {savingPreset ? "..." : t.savePreset}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onSaveConfig ? (
            <>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={start}
              >
                {t.tryTimer}
              </button>
              <div className="flex-1" />
              <button className={btnPrimary} onClick={() => onSaveConfig({ work, rest, rounds, sets, pause: pauseDuration, countdown: countdownDuration })}>
                {t.done}
              </button>
            </>
          ) : (
            <button className={`${btnPrimary} flex-1`} onClick={start}>
              <IconPlay />
              {t.start}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Countdown mode
  if (state === "countdown") {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={OUTER_RADIUS} fill="none" stroke={COLOR_OVERALL} strokeWidth={OUTER_STROKE} opacity={0.15} />
            <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={INNER_RADIUS} fill="none" stroke={COLOR_ACTIVE} strokeWidth={INNER_STROKE} opacity={0.15} />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLOR_ACTIVE }}>
              {t.countdown}
            </span>
            <span className="text-5xl font-bold tabular-nums">{countdownValue}</span>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <button className={`${btnOutline} flex-1`} onClick={reset}>
            <IconBack />
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  // Done mode
  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={OUTER_RADIUS} fill="none" stroke={COLOR_OVERALL} strokeWidth={OUTER_STROKE} />
            <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={INNER_RADIUS} fill="none" stroke={COLOR_OVERALL} strokeWidth={INNER_STROKE} />
          </svg>
          <span className="absolute text-2xl font-bold">{t.done}</span>
        </div>
        <div className="flex gap-3 w-full">
          <button className={`${btnOutline} flex-1`} onClick={reset}>
            <IconBack />
            {t.back}
          </button>
          <button className={`${btnOutline} flex-1`} onClick={start}>
            <IconPlay />
            {t.redo}
          </button>
          <button className={`${btnPrimary} flex-1`} onClick={onClose}>
            {t.close}
          </button>
        </div>
      </div>
    );
  }

  // Running / Paused mode
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={OUTER_RADIUS} fill="none" stroke={COLOR_OVERALL} strokeWidth={OUTER_STROKE} opacity={0.15} />
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={OUTER_RADIUS} fill="none"
            stroke={COLOR_OVERALL} strokeWidth={OUTER_STROKE} strokeLinecap="round"
            strokeDasharray={OUTER_CIRCUMFERENCE} strokeDashoffset={outerOffset}
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={INNER_RADIUS} fill="none" stroke={ringColor} strokeWidth={INNER_STROKE} opacity={0.15} />
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={INNER_RADIUS} fill="none"
            stroke={ringColor} strokeWidth={INNER_STROKE} strokeLinecap="round"
            strokeDasharray={INNER_CIRCUMFERENCE} strokeDashoffset={innerOffset}
            style={{ transition: innerTransition ? "stroke-dashoffset 0.1s linear, stroke 0.2s" : "none" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ringColor }}>
            {phaseLabel}
          </span>
          <span className="text-4xl font-bold tabular-nums">{displayTime}</span>
          <span className="text-xs text-muted-foreground">
            {sets > 1 && `${t.set} ${currentSet}/${sets} · `}
            {t.round} {currentRound}/{rounds}
          </span>
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <button className={`${btnOutline} flex-1`} onClick={reset}>
          <IconBack />
          {t.back}
        </button>
        {state === "running" ? (
          <button className={`${btnPrimary} flex-1`} onClick={handlePause}>
            <IconPause />
            {t.pauseTimer}
          </button>
        ) : (
          <button className={`${btnPrimary} flex-1`} onClick={resumeTimer}>
            <IconPlay />
            {t.resume}
          </button>
        )}
      </div>
    </div>
  );
}
