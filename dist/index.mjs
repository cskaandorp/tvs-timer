"use client";

// src/IntervalTimer.tsx
import { useState as useState2, useRef as useRef3, useCallback as useCallback2, useEffect as useEffect2 } from "react";

// src/computePhase.ts
function computePhase(elapsed, workMs, restMs, rounds, pauseMs, sets) {
  const roundMs = workMs + restMs;
  const setMs = roundMs * rounds;
  const setWithPauseMs = setMs + pauseMs;
  const totalMs = sets > 1 ? setWithPauseMs * (sets - 1) + setMs : setMs;
  if (elapsed >= totalMs) {
    return { done: true, phase: "work", remaining: 0, progress: 1, totalProgress: 1, round: rounds, set: sets, totalMs, phaseDuration: 0 };
  }
  const totalProgress = elapsed / totalMs;
  let set;
  let setElapsed;
  if (setWithPauseMs > 0 && sets > 1) {
    set = Math.min(Math.floor(elapsed / setWithPauseMs), sets - 1);
    setElapsed = elapsed - set * setWithPauseMs;
  } else {
    set = 0;
    setElapsed = elapsed;
  }
  if (pauseMs > 0 && set < sets - 1 && setElapsed >= setMs) {
    const pauseElapsed = setElapsed - setMs;
    const remaining2 = pauseMs - pauseElapsed;
    return { done: false, phase: "pause", remaining: remaining2, progress: pauseElapsed / pauseMs, totalProgress, round: rounds, set: set + 1, totalMs, phaseDuration: pauseMs };
  }
  const inSetElapsed = Math.min(setElapsed, setMs);
  const round = Math.min(Math.floor(inSetElapsed / roundMs), rounds - 1);
  const roundElapsed = inSetElapsed - round * roundMs;
  const isWork = restMs === 0 || roundElapsed < workMs;
  const phase = isWork ? "work" : "rest";
  const phaseTime = isWork ? roundElapsed : roundElapsed - workMs;
  const phaseDuration = isWork ? workMs : restMs;
  const remaining = Math.max(0, phaseDuration - phaseTime);
  return { done: false, phase, remaining, progress: phaseTime / phaseDuration, totalProgress, round: round + 1, set: set + 1, totalMs, phaseDuration };
}

// src/Stepper.tsx
import { useState, useRef as useRef2 } from "react";

// src/useHoldRepeat.ts
import { useRef, useCallback, useEffect } from "react";
function useHoldRepeat(callback, deps) {
  const timerRef = useRef(0);
  const intervalRef = useRef(0);
  const speedRef = useRef(300);
  const cb = useCallback(callback, deps);
  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    speedRef.current = 300;
  }, []);
  const start = useCallback(() => {
    cb();
    speedRef.current = 300;
    const schedule = () => {
      intervalRef.current = setInterval(() => {
        cb();
        if (speedRef.current > 50) {
          clearInterval(intervalRef.current);
          speedRef.current = Math.max(50, speedRef.current - 50);
          schedule();
        }
      }, speedRef.current);
    };
    timerRef.current = setTimeout(schedule, 400);
  }, [cb]);
  useEffect(() => stop, [stop]);
  return { start, stop };
}

// src/Stepper.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function Stepper({ label, value, onChange, min, max, step, unit, formatValue }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef2(null);
  const valueRef = useRef2(value);
  valueRef.current = value;
  const decrement = useHoldRepeat(
    () => onChange(Math.max(min, valueRef.current - step)),
    [onChange, min, step]
  );
  const increment = useHoldRepeat(
    () => onChange(Math.min(max, valueRef.current + step)),
    [onChange, max, step]
  );
  const startEdit = () => {
    setEditValue(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };
  const commitEdit = () => {
    setEditing(false);
    const n = parseInt(editValue);
    if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground active:bg-muted select-none",
          onPointerDown: decrement.start,
          onPointerUp: decrement.stop,
          onPointerLeave: decrement.stop,
          children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) })
        }
      ),
      editing ? /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          type: "number",
          inputMode: "numeric",
          className: "w-16 text-center tabular-nums font-semibold bg-transparent border-b border-primary outline-none",
          value: editValue,
          onChange: (e) => setEditValue(e.target.value),
          onBlur: commitEdit,
          onKeyDown: (e) => {
            if (e.key === "Enter") commitEdit();
          }
        }
      ) : /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "w-16 text-center tabular-nums font-semibold",
          onClick: startEdit,
          children: formatValue ? formatValue(value) : `${value}${unit}`
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground active:bg-muted select-none",
          onPointerDown: increment.start,
          onPointerUp: increment.stop,
          onPointerLeave: increment.stop,
          children: /* @__PURE__ */ jsxs("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
            /* @__PURE__ */ jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
            /* @__PURE__ */ jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
          ] })
        }
      )
    ] })
  ] });
}

// src/audio.ts
var ctx = null;
function getContext() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}
function playBeep(frequency, durationMs) {
  try {
    const ac = getContext();
    if (ac.state === "suspended") ac.resume();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + durationMs / 1e3);
  } catch {
  }
}
function defaultBeep(type) {
  switch (type) {
    case "work":
      playBeep(880, 200);
      break;
    case "rest":
      playBeep(440, 300);
      break;
    case "go":
      playBeep(1760, 300);
      break;
    case "done":
      playBeep(880, 150);
      setTimeout(() => playBeep(880, 150), 200);
      setTimeout(() => playBeep(1100, 300), 400);
      break;
  }
}

// src/types.ts
var DEFAULT_LABELS = {
  work: "Active",
  rest: "Rest",
  rounds: "Rounds",
  round: "Round",
  sets: "Sets",
  set: "Set",
  pause: "Rest between sets",
  pausePhase: "Pause",
  start: "Start",
  pauseTimer: "Pause",
  resume: "Resume",
  done: "Done",
  redo: "Redo",
  close: "Close",
  savePreset: "Save",
  presetName: "Preset name",
  myPresets: "My presets",
  coachPresets: "Coach presets",
  deletePreset: "Delete preset",
  presetSaved: "Preset saved!",
  presetDeleted: "Preset deleted",
  countdown: "Get ready",
  tryTimer: "Start",
  back: "Back"
};

// src/IntervalTimer.tsx
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var RING_SIZE = 200;
var OUTER_STROKE = 6;
var INNER_STROKE = 8;
var OUTER_RADIUS = (RING_SIZE - OUTER_STROKE) / 2;
var INNER_RADIUS = OUTER_RADIUS - OUTER_STROKE / 2 - 6 - INNER_STROKE / 2;
var OUTER_CIRCUMFERENCE = 2 * Math.PI * OUTER_RADIUS;
var INNER_CIRCUMFERENCE = 2 * Math.PI * INNER_RADIUS;
function formatMMSS(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
var IconPlay = () => /* @__PURE__ */ jsx2("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx2("polygon", { points: "5,3 19,12 5,21" }) });
var IconPause = () => /* @__PURE__ */ jsxs2("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", children: [
  /* @__PURE__ */ jsx2("rect", { x: "6", y: "4", width: "4", height: "16" }),
  /* @__PURE__ */ jsx2("rect", { x: "14", y: "4", width: "4", height: "16" })
] });
var IconBack = () => /* @__PURE__ */ jsxs2("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("path", { d: "m12 19-7-7 7-7" }),
  /* @__PURE__ */ jsx2("path", { d: "M19 12H5" })
] });
var IconBookmark = () => /* @__PURE__ */ jsx2("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx2("path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" }) });
var IconTrash = () => /* @__PURE__ */ jsxs2("svg", { className: "h-3 w-3", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("path", { d: "M3 6h18" }),
  /* @__PURE__ */ jsx2("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
  /* @__PURE__ */ jsx2("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
] });
function IntervalTimer({
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
  onCancelNotifications
}) {
  const t = { ...DEFAULT_LABELS, ...labelOverrides };
  const beep = onBeep ?? defaultBeep;
  const [work, setWork] = useState2(config?.work ?? 7);
  const [rest, setRest] = useState2(config?.rest ?? 3);
  const [rounds, setRounds] = useState2(config?.rounds ?? 6);
  const [sets, setSets] = useState2(config?.sets ?? 1);
  const [pauseDuration, setPauseDuration] = useState2(config?.pause ?? 180);
  const [countdownDuration, setCountdownDuration] = useState2(config?.countdown ?? 5);
  const [presets, setPresets] = useState2([]);
  const [savingPreset, setSavingPreset] = useState2(false);
  const [presetName, setPresetName] = useState2("");
  const fetchPresets = useCallback2(async () => {
    if (!onFetchPresets) return;
    try {
      const result = await onFetchPresets();
      setPresets(result);
    } catch {
    }
  }, [onFetchPresets]);
  useEffect2(() => {
    fetchPresets();
  }, [fetchPresets]);
  const savePreset = async () => {
    const name = presetName.trim();
    if (!name || !onSavePreset) return;
    setSavingPreset(true);
    try {
      const config2 = { work, rest, rounds, sets, pause: pauseDuration, countdown: countdownDuration };
      const ok = await onSavePreset(name, config2);
      if (ok) {
        setPresetName("");
        if (onSaveConfig) {
          onSaveConfig(config2);
        } else {
          fetchPresets();
          start();
        }
      }
    } catch {
    }
    setSavingPreset(false);
  };
  const deletePreset = async (id) => {
    if (!onDeletePreset) return;
    try {
      const ok = await onDeletePreset(id);
      if (ok) setPresets((p) => p.filter((pr) => pr.id !== id));
    } catch {
    }
  };
  const loadPreset = (preset) => {
    setWork(preset.config.work);
    setRest(preset.config.rest);
    setRounds(preset.config.rounds);
    setSets(preset.config.sets);
    setPauseDuration(preset.config.pause);
    setCountdownDuration(preset.config.countdown ?? 5);
  };
  const [state, setState] = useState2("idle");
  const [phase, setPhase] = useState2("work");
  const [currentRound, setCurrentRound] = useState2(1);
  const [currentSet, setCurrentSet] = useState2(1);
  const [displayTime, setDisplayTime] = useState2(0);
  const [progress, setProgress] = useState2(0);
  const [totalProgress, setTotalProgress] = useState2(0);
  const [innerTransition, setInnerTransition] = useState2(true);
  const [countdownValue, setCountdownValue] = useState2(countdownDuration);
  const startedAtRef = useRef3(0);
  const pausedElapsedRef = useRef3(0);
  const intervalRef = useRef3(0);
  const countdownRef = useRef3(0);
  const lastPhaseRef = useRef3("");
  const workMs = work * 1e3;
  const restMs = rest * 1e3;
  const pauseMs = pauseDuration * 1e3;
  const getNotifSchedule = useCallback2(() => ({
    workMs,
    restMs,
    rounds,
    pauseMs,
    sets,
    workLabel: t.work,
    restLabel: t.rest,
    pauseLabel: t.pausePhase,
    doneLabel: t.done
  }), [workMs, restMs, rounds, pauseMs, sets, t]);
  const tick = useCallback2(() => {
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
    setDisplayTime(Math.ceil(result.remaining / 1e3));
    setProgress(result.progress);
    setTotalProgress(result.totalProgress);
  }, [workMs, restMs, rounds, pauseMs, sets, beep]);
  const startRunning = useCallback2(() => {
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
  const start = useCallback2(() => {
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
    }, 1e3);
  }, [startRunning, onBeep, countdownDuration]);
  const handlePause = useCallback2(() => {
    clearInterval(intervalRef.current);
    pausedElapsedRef.current += Date.now() - startedAtRef.current;
    setState("paused");
    onCancelNotifications?.();
  }, [onCancelNotifications]);
  const resumeTimer = useCallback2(() => {
    startedAtRef.current = Date.now();
    setState("running");
    onScheduleNotifications?.(getNotifSchedule(), pausedElapsedRef.current);
    intervalRef.current = setInterval(tick, 50);
  }, [tick, onScheduleNotifications, getNotifSchedule]);
  const reset = useCallback2(() => {
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
  useEffect2(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && state === "running") {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(tick, 50);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [state, tick]);
  useEffect2(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
      onCancelNotifications?.();
    };
  }, []);
  const outerOffset = OUTER_CIRCUMFERENCE * totalProgress;
  const innerOffset = INNER_CIRCUMFERENCE * (1 - progress);
  const COLOR_ACTIVE = "var(--intensity, #ef4444)";
  const COLOR_REST = "var(--recovery, #22c55e)";
  const COLOR_PAUSE = "#A78BFA";
  const COLOR_OVERALL = "#34D399";
  const ringColor = phase === "work" ? COLOR_ACTIVE : phase === "rest" ? COLOR_REST : COLOR_PAUSE;
  const phaseLabel = phase === "work" ? t.work : phase === "rest" ? t.rest : t.pausePhase;
  const btnBase = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors h-10 px-4 select-none";
  const btnPrimary = `${btnBase} bg-primary text-primary-foreground hover:bg-primary/90`;
  const btnOutline = `${btnBase} border border-border bg-background hover:bg-muted`;
  const btnIcon = `${btnBase} h-10 w-10 px-0 border border-border bg-background hover:bg-muted`;
  if (state === "idle") {
    const myPresets = presets.filter((p) => p.owner_id === userId);
    const coachPresets = presets.filter((p) => p.owner_id !== userId);
    return /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-3 min-w-0", children: [
      presets.length > 0 && /* @__PURE__ */ jsxs2("div", { className: "space-y-2 max-h-40 overflow-y-auto", children: [
        myPresets.length > 0 && /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsx2("p", { className: "text-xs font-medium text-muted-foreground mb-1", children: t.myPresets }),
          /* @__PURE__ */ jsx2("div", { className: "flex flex-wrap gap-1.5", children: myPresets.map((p) => /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-0.5", children: [
            /* @__PURE__ */ jsx2(
              "button",
              {
                type: "button",
                className: "rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted active:bg-muted transition-colors",
                onClick: () => loadPreset(p),
                children: p.name
              }
            ),
            /* @__PURE__ */ jsx2(
              "button",
              {
                type: "button",
                className: "p-1 text-muted-foreground hover:text-destructive transition-colors",
                onClick: () => deletePreset(p.id),
                children: /* @__PURE__ */ jsx2(IconTrash, {})
              }
            )
          ] }, p.id)) })
        ] }),
        coachPresets.length > 0 && /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsx2("p", { className: "text-xs font-medium text-muted-foreground mb-1", children: t.coachPresets }),
          /* @__PURE__ */ jsx2("div", { className: "flex flex-wrap gap-1.5", children: coachPresets.map((p) => /* @__PURE__ */ jsxs2(
            "button",
            {
              type: "button",
              className: "rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted active:bg-muted transition-colors",
              onClick: () => loadPreset(p),
              children: [
                p.name,
                p.owner_name && /* @__PURE__ */ jsxs2("span", { className: "text-muted-foreground ml-1", children: [
                  "\xB7 ",
                  p.owner_name
                ] })
              ]
            },
            p.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "space-y-4 mb-2", children: [
        /* @__PURE__ */ jsx2(Stepper, { label: t.work, value: work, onChange: setWork, min: 1, max: 600, step: 1, unit: "s" }),
        /* @__PURE__ */ jsx2(Stepper, { label: t.rest, value: rest, onChange: setRest, min: 0, max: 600, step: 1, unit: "s" }),
        /* @__PURE__ */ jsx2(Stepper, { label: t.rounds, value: rounds, onChange: setRounds, min: 1, max: 99, step: 1, unit: "" }),
        /* @__PURE__ */ jsx2(Stepper, { label: t.sets, value: sets, onChange: setSets, min: 1, max: 20, step: 1, unit: "" }),
        sets > 1 && /* @__PURE__ */ jsx2(Stepper, { label: t.pause, value: pauseDuration, onChange: setPauseDuration, min: 0, max: 1800, step: 15, unit: "", formatValue: formatMMSS }),
        /* @__PURE__ */ jsx2(Stepper, { label: t.countdown, value: countdownDuration, onChange: setCountdownDuration, min: 3, max: 60, step: 1, unit: "s" })
      ] }),
      onSavePreset && /* @__PURE__ */ jsxs2("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx2(
          "input",
          {
            type: "text",
            className: "flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring",
            placeholder: t.presetName,
            value: presetName,
            onChange: (e) => setPresetName(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" && presetName.trim()) savePreset();
            }
          }
        ),
        /* @__PURE__ */ jsxs2("button", { className: btnOutline, disabled: !presetName.trim() || savingPreset, onClick: savePreset, children: [
          /* @__PURE__ */ jsx2(IconBookmark, {}),
          savingPreset ? "..." : t.savePreset
        ] })
      ] }),
      /* @__PURE__ */ jsx2("div", { className: "flex items-center gap-2", children: onSaveConfig ? /* @__PURE__ */ jsxs2(Fragment, { children: [
        /* @__PURE__ */ jsx2(
          "button",
          {
            type: "button",
            className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
            onClick: start,
            children: t.tryTimer
          }
        ),
        /* @__PURE__ */ jsx2("div", { className: "flex-1" }),
        /* @__PURE__ */ jsx2("button", { className: btnPrimary, onClick: () => onSaveConfig({ work, rest, rounds, sets, pause: pauseDuration, countdown: countdownDuration }), children: t.done })
      ] }) : /* @__PURE__ */ jsxs2("button", { className: `${btnPrimary} flex-1`, onClick: start, children: [
        /* @__PURE__ */ jsx2(IconPlay, {}),
        t.start
      ] }) })
    ] });
  }
  if (state === "countdown") {
    return /* @__PURE__ */ jsxs2("div", { className: "flex flex-col items-center gap-8", children: [
      /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center justify-center", style: { width: RING_SIZE, height: RING_SIZE }, children: [
        /* @__PURE__ */ jsxs2("svg", { width: RING_SIZE, height: RING_SIZE, style: { transform: "rotate(-90deg)" }, children: [
          /* @__PURE__ */ jsx2("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: OUTER_RADIUS, fill: "none", stroke: COLOR_OVERALL, strokeWidth: OUTER_STROKE, opacity: 0.15 }),
          /* @__PURE__ */ jsx2("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: INNER_RADIUS, fill: "none", stroke: COLOR_ACTIVE, strokeWidth: INNER_STROKE, opacity: 0.15 })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "absolute flex flex-col items-center", children: [
          /* @__PURE__ */ jsx2("span", { className: "text-xs font-semibold uppercase tracking-wider", style: { color: COLOR_ACTIVE }, children: t.countdown }),
          /* @__PURE__ */ jsx2("span", { className: "text-5xl font-bold tabular-nums", children: countdownValue })
        ] })
      ] }),
      /* @__PURE__ */ jsx2("div", { className: "flex gap-3 w-full", children: /* @__PURE__ */ jsxs2("button", { className: `${btnOutline} flex-1`, onClick: reset, children: [
        /* @__PURE__ */ jsx2(IconBack, {}),
        t.back
      ] }) })
    ] });
  }
  if (state === "done") {
    return /* @__PURE__ */ jsxs2("div", { className: "flex flex-col items-center gap-8", children: [
      /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center justify-center", style: { width: RING_SIZE, height: RING_SIZE }, children: [
        /* @__PURE__ */ jsxs2("svg", { width: RING_SIZE, height: RING_SIZE, style: { transform: "rotate(-90deg)" }, children: [
          /* @__PURE__ */ jsx2("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: OUTER_RADIUS, fill: "none", stroke: COLOR_OVERALL, strokeWidth: OUTER_STROKE }),
          /* @__PURE__ */ jsx2("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: INNER_RADIUS, fill: "none", stroke: COLOR_OVERALL, strokeWidth: INNER_STROKE })
        ] }),
        /* @__PURE__ */ jsx2("span", { className: "absolute text-2xl font-bold", children: t.done })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "flex gap-3 w-full", children: [
        /* @__PURE__ */ jsxs2("button", { className: `${btnOutline} flex-1`, onClick: reset, children: [
          /* @__PURE__ */ jsx2(IconBack, {}),
          t.back
        ] }),
        /* @__PURE__ */ jsxs2("button", { className: `${btnOutline} flex-1`, onClick: start, children: [
          /* @__PURE__ */ jsx2(IconPlay, {}),
          t.redo
        ] }),
        /* @__PURE__ */ jsx2("button", { className: `${btnPrimary} flex-1`, onClick: onClose, children: t.close })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs2("div", { className: "flex flex-col items-center gap-8", children: [
    /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center justify-center", style: { width: RING_SIZE, height: RING_SIZE }, children: [
      /* @__PURE__ */ jsxs2("svg", { width: RING_SIZE, height: RING_SIZE, style: { transform: "rotate(-90deg)" }, children: [
        /* @__PURE__ */ jsx2("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: OUTER_RADIUS, fill: "none", stroke: COLOR_OVERALL, strokeWidth: OUTER_STROKE, opacity: 0.15 }),
        /* @__PURE__ */ jsx2(
          "circle",
          {
            cx: RING_SIZE / 2,
            cy: RING_SIZE / 2,
            r: OUTER_RADIUS,
            fill: "none",
            stroke: COLOR_OVERALL,
            strokeWidth: OUTER_STROKE,
            strokeLinecap: "round",
            strokeDasharray: OUTER_CIRCUMFERENCE,
            strokeDashoffset: outerOffset,
            style: { transition: "stroke-dashoffset 0.1s linear" }
          }
        ),
        /* @__PURE__ */ jsx2("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: INNER_RADIUS, fill: "none", stroke: ringColor, strokeWidth: INNER_STROKE, opacity: 0.15 }),
        /* @__PURE__ */ jsx2(
          "circle",
          {
            cx: RING_SIZE / 2,
            cy: RING_SIZE / 2,
            r: INNER_RADIUS,
            fill: "none",
            stroke: ringColor,
            strokeWidth: INNER_STROKE,
            strokeLinecap: "round",
            strokeDasharray: INNER_CIRCUMFERENCE,
            strokeDashoffset: innerOffset,
            style: { transition: innerTransition ? "stroke-dashoffset 0.1s linear, stroke 0.2s" : "none" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "absolute flex flex-col items-center", children: [
        /* @__PURE__ */ jsx2("span", { className: "text-xs font-semibold uppercase tracking-wider", style: { color: ringColor }, children: phaseLabel }),
        /* @__PURE__ */ jsx2("span", { className: "text-4xl font-bold tabular-nums", children: displayTime }),
        /* @__PURE__ */ jsxs2("span", { className: "text-xs text-muted-foreground", children: [
          sets > 1 && `${t.set} ${currentSet}/${sets} \xB7 `,
          t.round,
          " ",
          currentRound,
          "/",
          rounds
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "flex gap-3 w-full", children: [
      /* @__PURE__ */ jsxs2("button", { className: `${btnOutline} flex-1`, onClick: reset, children: [
        /* @__PURE__ */ jsx2(IconBack, {}),
        t.back
      ] }),
      state === "running" ? /* @__PURE__ */ jsxs2("button", { className: `${btnPrimary} flex-1`, onClick: handlePause, children: [
        /* @__PURE__ */ jsx2(IconPause, {}),
        t.pauseTimer
      ] }) : /* @__PURE__ */ jsxs2("button", { className: `${btnPrimary} flex-1`, onClick: resumeTimer, children: [
        /* @__PURE__ */ jsx2(IconPlay, {}),
        t.resume
      ] })
    ] })
  ] });
}
export {
  DEFAULT_LABELS,
  IntervalTimer,
  Stepper,
  computePhase,
  defaultBeep,
  useHoldRepeat
};
