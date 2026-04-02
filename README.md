# @teevs/timer

Shared interval timer component for TVS Coach and TVS Athlete apps.

## Install

```bash
npm install github:casperkaandorp/tvs-timer
```

## Usage

```tsx
import { IntervalTimer } from "@teevs/timer";

<IntervalTimer
  labels={timerLabels}
  userId={currentUser.id}
  onBeep={(type) => playSound(type)}
  onClose={() => setOpen(false)}
  onFetchPresets={() => fetch("/api/timer-presets").then(r => r.json())}
  onSavePreset={async (name, config) => {
    const res = await fetch("/api/timer-presets", { method: "POST", body: JSON.stringify({ name, config }) });
    return res.ok;
  }}
  onDeletePreset={async (id) => {
    const res = await fetch(`/api/timer-presets/${id}`, { method: "DELETE" });
    return res.ok;
  }}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `TimerConfig` | Optional initial timer configuration |
| `labels` | `TimerLabels` | All UI strings (i18n-agnostic) |
| `userId` | `string` | Current user ID (to distinguish own vs shared presets) |
| `onBeep` | `(type: BeepType) => void` | Called on phase transitions: `work`, `rest`, `go`, `done` |
| `onClose` | `() => void` | Called when user clicks close |
| `onFetchPresets` | `() => Promise<TimerPreset[]>` | Fetch saved presets |
| `onSavePreset` | `(name, config) => Promise<boolean>` | Save a new preset |
| `onDeletePreset` | `(id) => Promise<boolean>` | Delete a preset |
| `onScheduleNotifications` | `(schedule, elapsedMs) => void` | Schedule native notifications (optional) |
| `onCancelNotifications` | `() => void` | Cancel scheduled notifications (optional) |

## Exports

- `IntervalTimer` — main component
- `Stepper` — number stepper with hold-to-repeat
- `computePhase()` — pure function for phase computation
- `useHoldRepeat()` — hold-to-repeat hook
- Types: `TimerConfig`, `TimerPreset`, `TimerLabels`, `BeepType`, `NotificationSchedule`

## Requirements

- React 18+
- Tailwind CSS (uses utility classes and CSS variables: `--intensity`, `--recovery`)
