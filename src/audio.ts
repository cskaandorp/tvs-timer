let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playBeep(frequency: number, durationMs: number): void {
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
    osc.stop(ac.currentTime + durationMs / 1000);
  } catch {
    // Web Audio not available
  }
}

export function defaultBeep(type: string): void {
  switch (type) {
    case "work": playBeep(880, 200); break;
    case "rest": playBeep(440, 300); break;
    case "go": playBeep(1760, 300); break;
    case "warn": playBeep(660, 100); break;
    case "done":
      playBeep(880, 150);
      setTimeout(() => playBeep(880, 150), 200);
      setTimeout(() => playBeep(1100, 300), 400);
      break;
  }
}
