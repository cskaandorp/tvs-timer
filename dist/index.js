"use client";
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  IntervalTimer: () => IntervalTimer,
  Stepper: () => Stepper,
  computePhase: () => computePhase,
  useHoldRepeat: () => useHoldRepeat
});
module.exports = __toCommonJS(index_exports);

// src/IntervalTimer.tsx
var import_react3 = require("react");

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
var import_react2 = require("react");

// src/useHoldRepeat.ts
var import_react = require("react");
function useHoldRepeat(callback, deps) {
  const timerRef = (0, import_react.useRef)(0);
  const intervalRef = (0, import_react.useRef)(0);
  const speedRef = (0, import_react.useRef)(300);
  const cb = (0, import_react.useCallback)(callback, deps);
  const stop = (0, import_react.useCallback)(() => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    speedRef.current = 300;
  }, []);
  const start = (0, import_react.useCallback)(() => {
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
  (0, import_react.useEffect)(() => stop, [stop]);
  return { start, stop };
}

// src/Stepper.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function Stepper({ label, value, onChange, min, max, step, unit, formatValue }) {
  const [editing, setEditing] = (0, import_react2.useState)(false);
  const [editValue, setEditValue] = (0, import_react2.useState)("");
  const inputRef = (0, import_react2.useRef)(null);
  const valueRef = (0, import_react2.useRef)(value);
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-medium", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: "flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground active:bg-muted select-none",
          onPointerDown: decrement.start,
          onPointerUp: decrement.stop,
          onPointerLeave: decrement.stop,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) })
        }
      ),
      editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
      ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: "w-16 text-center tabular-nums font-semibold",
          onClick: startEdit,
          children: formatValue ? formatValue(value) : `${value}${unit}`
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: "flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground active:bg-muted select-none",
          onPointerDown: increment.start,
          onPointerUp: increment.stop,
          onPointerLeave: increment.stop,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
          ] })
        }
      )
    ] })
  ] });
}

// src/IntervalTimer.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
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
var IconPlay = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "5,3 19,12 5,21" }) });
var IconPause = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", children: [
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "6", y: "4", width: "4", height: "16" }),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "14", y: "4", width: "4", height: "16" })
] });
var IconReset = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M1 4v6h6" }),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })
] });
var IconBookmark = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" }) });
var IconTrash = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { className: "h-3 w-3", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M3 6h18" }),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
] });
function IntervalTimer({
  config,
  labels: t,
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
  const [work, setWork] = (0, import_react3.useState)(config?.work ?? 7);
  const [rest, setRest] = (0, import_react3.useState)(config?.rest ?? 3);
  const [rounds, setRounds] = (0, import_react3.useState)(config?.rounds ?? 6);
  const [sets, setSets] = (0, import_react3.useState)(config?.sets ?? 1);
  const [pauseDuration, setPauseDuration] = (0, import_react3.useState)(config?.pause ?? 180);
  const [countdownDuration, setCountdownDuration] = (0, import_react3.useState)(config?.countdown ?? 5);
  const [presets, setPresets] = (0, import_react3.useState)([]);
  const [savingPreset, setSavingPreset] = (0, import_react3.useState)(false);
  const [showSaveInput, setShowSaveInput] = (0, import_react3.useState)(false);
  const [presetName, setPresetName] = (0, import_react3.useState)("");
  const saveInputRef = (0, import_react3.useRef)(null);
  const fetchPresets = (0, import_react3.useCallback)(async () => {
    if (!onFetchPresets) return;
    try {
      const result = await onFetchPresets();
      setPresets(result);
    } catch {
    }
  }, [onFetchPresets]);
  (0, import_react3.useEffect)(() => {
    fetchPresets();
  }, [fetchPresets]);
  const savePreset = async () => {
    const name = presetName.trim();
    if (!name || !onSavePreset) return;
    setSavingPreset(true);
    try {
      const ok = await onSavePreset(name, { work, rest, rounds, sets, pause: pauseDuration, countdown: countdownDuration });
      if (ok) {
        setShowSaveInput(false);
        setPresetName("");
        fetchPresets();
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
  const [state, setState] = (0, import_react3.useState)("idle");
  const [phase, setPhase] = (0, import_react3.useState)("work");
  const [currentRound, setCurrentRound] = (0, import_react3.useState)(1);
  const [currentSet, setCurrentSet] = (0, import_react3.useState)(1);
  const [displayTime, setDisplayTime] = (0, import_react3.useState)(0);
  const [progress, setProgress] = (0, import_react3.useState)(0);
  const [totalProgress, setTotalProgress] = (0, import_react3.useState)(0);
  const [innerTransition, setInnerTransition] = (0, import_react3.useState)(true);
  const [countdownValue, setCountdownValue] = (0, import_react3.useState)(countdownDuration);
  const startedAtRef = (0, import_react3.useRef)(0);
  const pausedElapsedRef = (0, import_react3.useRef)(0);
  const intervalRef = (0, import_react3.useRef)(0);
  const countdownRef = (0, import_react3.useRef)(0);
  const lastPhaseRef = (0, import_react3.useRef)("");
  const workMs = work * 1e3;
  const restMs = rest * 1e3;
  const pauseMs = pauseDuration * 1e3;
  const getNotifSchedule = (0, import_react3.useCallback)(() => ({
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
  const tick = (0, import_react3.useCallback)(() => {
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
      onBeep?.("done");
      return;
    }
    const phaseKey = `${result.set}-${result.round}-${result.phase}`;
    if (lastPhaseRef.current && lastPhaseRef.current !== phaseKey) {
      onBeep?.(result.phase === "work" ? "work" : "rest");
      setInnerTransition(false);
      setTimeout(() => setInnerTransition(true), 0);
    }
    lastPhaseRef.current = phaseKey;
    setPhase(result.phase);
    setCurrentRound(result.round);
    setCurrentSet(result.set);
    setDisplayTime(Math.ceil(result.remaining / 1e3));
    setProgress(result.progress);
    setTotalProgress(result.totalProgress);
  }, [workMs, restMs, rounds, pauseMs, sets, onBeep]);
  const startRunning = (0, import_react3.useCallback)(() => {
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
    onBeep?.("work");
    onScheduleNotifications?.(getNotifSchedule(), 0);
    intervalRef.current = setInterval(tick, 50);
  }, [tick, work, onBeep, onScheduleNotifications, getNotifSchedule]);
  const start = (0, import_react3.useCallback)(() => {
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
    setCountdownValue(countdownDuration);
    setState("countdown");
    setPhase("work");
    setProgress(0);
    setTotalProgress(0);
    onBeep?.("work");
    let count = countdownDuration;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownValue(count);
        onBeep?.(count === 1 ? "go" : "work");
      } else {
        clearInterval(countdownRef.current);
        startRunning();
      }
    }, 1e3);
  }, [startRunning, onBeep, countdownDuration]);
  const handlePause = (0, import_react3.useCallback)(() => {
    clearInterval(intervalRef.current);
    pausedElapsedRef.current += Date.now() - startedAtRef.current;
    setState("paused");
    onCancelNotifications?.();
  }, [onCancelNotifications]);
  const resumeTimer = (0, import_react3.useCallback)(() => {
    startedAtRef.current = Date.now();
    setState("running");
    onScheduleNotifications?.(getNotifSchedule(), pausedElapsedRef.current);
    intervalRef.current = setInterval(tick, 50);
  }, [tick, onScheduleNotifications, getNotifSchedule]);
  const reset = (0, import_react3.useCallback)(() => {
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
  (0, import_react3.useEffect)(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && state === "running") {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(tick, 50);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [state, tick]);
  (0, import_react3.useEffect)(() => {
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
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex flex-col gap-5", children: [
      presets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-2 max-h-40 overflow-y-auto", children: [
        myPresets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-xs font-medium text-muted-foreground mb-1", children: t.myPresets }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex flex-wrap gap-1.5", children: myPresets.map((p) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-0.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted active:bg-muted transition-colors",
                onClick: () => loadPreset(p),
                children: p.name
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "p-1 text-muted-foreground hover:text-destructive transition-colors",
                onClick: () => deletePreset(p.id),
                children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconTrash, {})
              }
            )
          ] }, p.id)) })
        ] }),
        coachPresets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-xs font-medium text-muted-foreground mb-1", children: t.coachPresets }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex flex-wrap gap-1.5", children: coachPresets.map((p) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "button",
            {
              type: "button",
              className: "rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted active:bg-muted transition-colors",
              onClick: () => loadPreset(p),
              children: [
                p.name,
                p.owner_name && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "text-muted-foreground ml-1", children: [
                  "\xB7 ",
                  p.owner_name
                ] })
              ]
            },
            p.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Stepper, { label: t.work, value: work, onChange: setWork, min: 1, max: 600, step: 1, unit: "s" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Stepper, { label: t.rest, value: rest, onChange: setRest, min: 0, max: 600, step: 1, unit: "s" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Stepper, { label: t.rounds, value: rounds, onChange: setRounds, min: 1, max: 99, step: 1, unit: "" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Stepper, { label: t.sets, value: sets, onChange: setSets, min: 1, max: 20, step: 1, unit: "" }),
        sets > 1 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Stepper, { label: t.pause, value: pauseDuration, onChange: setPauseDuration, min: 0, max: 1800, step: 15, unit: "", formatValue: formatMMSS }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Stepper, { label: t.countdown, value: countdownDuration, onChange: setCountdownDuration, min: 3, max: 60, step: 1, unit: "s" })
      ] }),
      showSaveInput && onSavePreset && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            ref: saveInputRef,
            type: "text",
            className: "flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring",
            placeholder: t.presetName,
            value: presetName,
            onChange: (e) => setPresetName(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") savePreset();
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: btnPrimary, disabled: !presetName.trim() || savingPreset, onClick: savePreset, children: savingPreset ? "..." : t.savePreset })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex gap-2", children: [
        onSavePreset && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            className: btnIcon,
            onClick: () => {
              setShowSaveInput((v) => !v);
              if (!showSaveInput) setTimeout(() => saveInputRef.current?.focus(), 0);
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconBookmark, {})
          }
        ),
        onSaveConfig ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: `${btnPrimary} flex-1`, onClick: () => onSaveConfig({ work, rest, rounds, sets, pause: pauseDuration, countdown: countdownDuration }), children: t.done }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: `${btnPrimary} flex-1`, onClick: start, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconPlay, {}),
          t.start
        ] })
      ] })
    ] });
  }
  if (state === "countdown") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex flex-col items-center gap-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "relative flex items-center justify-center", style: { width: RING_SIZE, height: RING_SIZE }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: RING_SIZE, height: RING_SIZE, className: "-rotate-90", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: OUTER_RADIUS, fill: "none", stroke: COLOR_OVERALL, strokeWidth: OUTER_STROKE, opacity: 0.15 }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: INNER_RADIUS, fill: "none", stroke: COLOR_ACTIVE, strokeWidth: INNER_STROKE, opacity: 0.15 })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "absolute flex flex-col items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-xs font-semibold uppercase tracking-wider", style: { color: COLOR_ACTIVE }, children: t.countdown }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-5xl font-bold tabular-nums", children: countdownValue })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex gap-3 w-full", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: `${btnOutline} flex-1`, onClick: reset, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconReset, {}),
        t.reset
      ] }) })
    ] });
  }
  if (state === "done") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex flex-col items-center gap-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "relative flex items-center justify-center", style: { width: RING_SIZE, height: RING_SIZE }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: RING_SIZE, height: RING_SIZE, className: "-rotate-90", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: OUTER_RADIUS, fill: "none", stroke: COLOR_OVERALL, strokeWidth: OUTER_STROKE }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: INNER_RADIUS, fill: "none", stroke: COLOR_OVERALL, strokeWidth: INNER_STROKE })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "absolute text-2xl font-bold", children: t.done })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex gap-3 w-full", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: `${btnOutline} flex-1`, onClick: reset, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconReset, {}),
          t.reset
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: `${btnOutline} flex-1`, onClick: start, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconPlay, {}),
          t.redo
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: `${btnPrimary} flex-1`, onClick: onClose, children: t.close })
      ] })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex flex-col items-center gap-5", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "relative flex items-center justify-center", style: { width: RING_SIZE, height: RING_SIZE }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: RING_SIZE, height: RING_SIZE, className: "-rotate-90", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: OUTER_RADIUS, fill: "none", stroke: COLOR_OVERALL, strokeWidth: OUTER_STROKE, opacity: 0.15 }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: RING_SIZE / 2, cy: RING_SIZE / 2, r: INNER_RADIUS, fill: "none", stroke: ringColor, strokeWidth: INNER_STROKE, opacity: 0.15 }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "absolute flex flex-col items-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-xs font-semibold uppercase tracking-wider", style: { color: ringColor }, children: phaseLabel }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-4xl font-bold tabular-nums", children: displayTime }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "text-xs text-muted-foreground", children: [
          sets > 1 && `${t.set} ${currentSet}/${sets} \xB7 `,
          t.round,
          " ",
          currentRound,
          "/",
          rounds
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex gap-3 w-full", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: `${btnOutline} flex-1`, onClick: reset, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconReset, {}),
        t.reset
      ] }),
      state === "running" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: `${btnPrimary} flex-1`, onClick: handlePause, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconPause, {}),
        t.pauseTimer
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: `${btnPrimary} flex-1`, onClick: resumeTimer, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconPlay, {}),
        t.resume
      ] })
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IntervalTimer,
  Stepper,
  computePhase,
  useHoldRepeat
});
