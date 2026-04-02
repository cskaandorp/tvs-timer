export interface TimerConfig {
  work: number;
  rest: number;
  rounds: number;
  sets?: number;
  pause?: number;
  countdown?: number;
}

export interface TimerPreset {
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

export type BeepType = "work" | "rest" | "go" | "done";

export interface TimerLabels {
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

export const DEFAULT_LABELS: TimerLabels = {
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
  savePreset: "Save preset",
  presetName: "Preset name",
  myPresets: "My presets",
  coachPresets: "Coach presets",
  deletePreset: "Delete preset",
  presetSaved: "Preset saved!",
  presetDeleted: "Preset deleted",
  countdown: "Get ready",
  tryTimer: "Start",
  back: "Back",
};

export interface TimerCallbacks {
  onBeep?: (type: BeepType) => void;
  onClose: () => void;
  onSaveConfig?: (config: TimerConfig) => void;
  onFetchPresets?: () => Promise<TimerPreset[]>;
  onSavePreset?: (name: string, config: TimerPreset["config"]) => Promise<boolean>;
  onDeletePreset?: (id: string) => Promise<boolean>;
  onScheduleNotifications?: (schedule: NotificationSchedule, elapsedMs: number) => void;
  onCancelNotifications?: () => void;
}

export interface NotificationSchedule {
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
