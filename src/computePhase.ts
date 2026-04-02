export type Phase = "work" | "rest" | "pause";

export interface PhaseResult {
  done: boolean;
  phase: Phase;
  remaining: number;
  progress: number;
  totalProgress: number;
  round: number;
  set: number;
  totalMs: number;
  phaseDuration: number;
}

/**
 * Compute which phase we're in given total elapsed ms.
 * Sequence: [work/rest x rounds] → pause → [work/rest x rounds] → pause → ... x sets
 * (no pause after the last set)
 */
export function computePhase(
  elapsed: number,
  workMs: number,
  restMs: number,
  rounds: number,
  pauseMs: number,
  sets: number,
): PhaseResult {
  const roundMs = workMs + restMs;
  const setMs = roundMs * rounds;
  const setWithPauseMs = setMs + pauseMs;

  // Total duration (no pause after last set)
  const totalMs = sets > 1 ? setWithPauseMs * (sets - 1) + setMs : setMs;

  if (elapsed >= totalMs) {
    return { done: true, phase: "work", remaining: 0, progress: 1, totalProgress: 1, round: rounds, set: sets, totalMs, phaseDuration: 0 };
  }

  const totalProgress = elapsed / totalMs;

  // Which set are we in?
  let set: number;
  let setElapsed: number;
  if (setWithPauseMs > 0 && sets > 1) {
    set = Math.min(Math.floor(elapsed / setWithPauseMs), sets - 1);
    setElapsed = elapsed - set * setWithPauseMs;
  } else {
    set = 0;
    setElapsed = elapsed;
  }

  // Are we in the pause between sets?
  if (pauseMs > 0 && set < sets - 1 && setElapsed >= setMs) {
    const pauseElapsed = setElapsed - setMs;
    const remaining = pauseMs - pauseElapsed;
    return { done: false, phase: "pause", remaining, progress: pauseElapsed / pauseMs, totalProgress, round: rounds, set: set + 1, totalMs, phaseDuration: pauseMs };
  }

  // Within a set: which round?
  const inSetElapsed = Math.min(setElapsed, setMs);
  const round = Math.min(Math.floor(inSetElapsed / roundMs), rounds - 1);
  const roundElapsed = inSetElapsed - round * roundMs;

  const isWork = restMs === 0 || roundElapsed < workMs;
  const phase: Phase = isWork ? "work" : "rest";
  const phaseTime = isWork ? roundElapsed : roundElapsed - workMs;
  const phaseDuration = isWork ? workMs : restMs;
  const remaining = Math.max(0, phaseDuration - phaseTime);

  return { done: false, phase, remaining, progress: phaseTime / phaseDuration, totalProgress, round: round + 1, set: set + 1, totalMs, phaseDuration };
}
