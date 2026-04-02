import * as react_jsx_runtime from 'react/jsx-runtime';

interface TimerConfig {
    work: number;
    rest: number;
    rounds: number;
    sets?: number;
    pause?: number;
    countdown?: number;
}
interface TimerPreset {
    id: string;
    owner_id: string;
    owner_name?: string;
    name: string;
    config: {
        work: number;
        rest: number;
        rounds: number;
        sets: number;
        pause: number;
        countdown: number;
    };
    created_at: string;
}
type BeepType = "work" | "rest" | "go" | "done";
interface TimerLabels {
    work: string;
    rest: string;
    rounds: string;
    round: string;
    sets: string;
    set: string;
    pause: string;
    pausePhase: string;
    start: string;
    pauseTimer: string;
    resume: string;
    done: string;
    redo: string;
    close: string;
    savePreset: string;
    presetName: string;
    myPresets: string;
    coachPresets: string;
    deletePreset: string;
    presetSaved: string;
    presetDeleted: string;
    countdown: string;
    tryTimer: string;
    back: string;
}
declare const DEFAULT_LABELS: TimerLabels;
interface TimerCallbacks {
    onBeep?: (type: BeepType) => void;
    onClose: () => void;
    onSaveConfig?: (config: TimerConfig) => void;
    onFetchPresets?: () => Promise<TimerPreset[]>;
    onSavePreset?: (name: string, config: TimerPreset["config"]) => Promise<boolean>;
    onDeletePreset?: (id: string) => Promise<boolean>;
    onScheduleNotifications?: (schedule: NotificationSchedule, elapsedMs: number) => void;
    onCancelNotifications?: () => void;
}
interface NotificationSchedule {
    workMs: number;
    restMs: number;
    rounds: number;
    pauseMs: number;
    sets: number;
    workLabel: string;
    restLabel: string;
    pauseLabel: string;
    doneLabel: string;
}

interface IntervalTimerProps extends TimerCallbacks {
    config?: TimerConfig;
    labels?: Partial<TimerLabels>;
    userId?: string;
}
declare function IntervalTimer({ config, labels: labelOverrides, userId, onBeep, onClose, onFetchPresets, onSaveConfig, onSavePreset, onDeletePreset, onScheduleNotifications, onCancelNotifications, }: IntervalTimerProps): react_jsx_runtime.JSX.Element;

interface StepperProps {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step: number;
    unit: string;
    formatValue?: (v: number) => string;
}
declare function Stepper({ label, value, onChange, min, max, step, unit, formatValue }: StepperProps): react_jsx_runtime.JSX.Element;

type Phase = "work" | "rest" | "pause";
interface PhaseResult {
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
declare function computePhase(elapsed: number, workMs: number, restMs: number, rounds: number, pauseMs: number, sets: number): PhaseResult;

declare function useHoldRepeat(callback: () => void, deps: React.DependencyList): {
    start: () => void;
    stop: () => void;
};

declare function defaultBeep(type: string): void;

export { type BeepType, DEFAULT_LABELS, IntervalTimer, type IntervalTimerProps, type NotificationSchedule, type Phase, type PhaseResult, Stepper, type TimerCallbacks, type TimerConfig, type TimerLabels, type TimerPreset, computePhase, defaultBeep, useHoldRepeat };
