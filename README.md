# @teevs/timer

Shared interval timer component for TVS Coach and TVS Athlete apps.

## Install

```bash
npm install github:cskaandorp/tvs-timer
```

### Tailwind CSS setup

The package uses Tailwind utility classes. You need to tell Tailwind to scan the package's dist files.

**Tailwind CSS 4** (e.g., tvs-coach) — add to `globals.css`:

```css
@source "../node_modules/@teevs/timer/dist";
```

**Tailwind CSS 3** (e.g., tvs-athlete) — add to `tailwind.config.js`:

```js
content: [
  "./app/**/*.{ts,tsx}",
  "./node_modules/@teevs/timer/dist/**/*.{js,mjs}",
]
```

## Usage

### Minimal (all defaults)

All props except `onClose` are optional. English labels and Web Audio beeps are built in!

```tsx
import { IntervalTimer } from "@teevs/timer";

<IntervalTimer onClose={() => setOpen(false)} />
```

### Coach app (configure timer for a block)

Pass `onSaveConfig` to enable config-only mode: "Done" saves the config, "Start" lets the coach try it out.

```tsx
<IntervalTimer
  config={existingTimerConfig}
  labels={{ work: t('timerWork'), ... }}
  userId={user.id}
  onClose={() => setDialogOpen(false)}
  onSaveConfig={(config) => {
    setTimerConfig(config);
    setDialogOpen(false);
  }}
  onFetchPresets={async () => {
    const res = await fetch("/api/timer-presets");
    return res.ok ? res.json() : [];
  }}
  onSavePreset={async (name, config) => {
    const res = await fetch("/api/timer-presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, config }),
    });
    return res.ok;
  }}
  onDeletePreset={async (id) => {
    const res = await fetch(`/api/timer-presets/${id}`, { method: "DELETE" });
    return res.ok;
  }}
/>
```

### Athlete app (run the timer)

Without `onSaveConfig`, the component shows the full timer experience: configure, start, run with beeps.

Override `onBeep` for native audio on mobile (e.g., Capacitor):

```tsx
<IntervalTimer
  config={{ work: 7, rest: 3, rounds: 6 }}
  userId={user.id}
  onClose={() => setOpen(false)}
  onBeep={(type) => nativeAudioBeep(type)}
  onScheduleNotifications={(schedule, elapsedMs) => scheduleNative(schedule, elapsedMs)}
  onCancelNotifications={() => cancelNative()}
  onFetchPresets={...}
  onSavePreset={...}
  onDeletePreset={...}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onClose` | `() => void` | Yes | Called when user clicks close (done state) |
| `config` | `TimerConfig` | No | Initial timer configuration |
| `labels` | `Partial<TimerLabels>` | No | Override any UI string (defaults to English) |
| `userId` | `string` | No | Current user ID (distinguishes own vs shared presets) |
| `onSaveConfig` | `(config: TimerConfig) => void` | No | Enables config-only mode (coach). Called when user clicks "Done" |
| `onBeep` | `(type: BeepType) => void` | No | Override beep sounds. Defaults to Web Audio |
| `onFetchPresets` | `() => Promise<TimerPreset[]>` | No | Fetch saved presets |
| `onSavePreset` | `(name, config) => Promise<boolean>` | No | Save a new preset |
| `onDeletePreset` | `(id) => Promise<boolean>` | No | Delete a preset |
| `onScheduleNotifications` | `(schedule, elapsedMs) => void` | No | Schedule native notifications |
| `onCancelNotifications` | `() => void` | No | Cancel scheduled notifications |

## Beep types

| Type | Frequency | When |
|------|-----------|------|
| `work` | 880Hz | Work phase starts, countdown ticks |
| `rest` | 440Hz | Rest/pause phase starts |
| `go` | 1760Hz | Final countdown second (1 sec before start) |
| `done` | 880-880-1100Hz | Timer completed |

## Timer config

```typescript
interface TimerConfig {
  work: number;      // Active phase (seconds)
  rest: number;      // Rest phase (seconds)
  rounds: number;    // Rounds per set
  sets?: number;     // Number of sets (default 1)
  pause?: number;    // Rest between sets (seconds)
  countdown?: number; // Countdown before start (default 5, min 3)
}
```

Sequence: `[work -> rest] x rounds -> pause -> ... x sets` (no pause after last set)

## Exports

- `IntervalTimer` — main component
- `Stepper` — number stepper with hold-to-repeat
- `computePhase()` — pure function for phase computation
- `useHoldRepeat()` — hold-to-repeat hook
- `defaultBeep()` — built-in Web Audio beep function
- `DEFAULT_LABELS` — default English labels
- Types: `TimerConfig`, `TimerPreset`, `TimerLabels`, `BeepType`, `NotificationSchedule`

## Development

```bash
npm run build    # Build dist (must run before committing)
npm run dev      # Watch mode
```

After making changes, run `npm run build` and commit the `dist/` folder — consuming apps install from GitHub and need the pre-built files.

## Requirements

- React 18+
- Tailwind CSS (uses utility classes and CSS variables: `--intensity`, `--recovery`)
