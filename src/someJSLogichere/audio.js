let audioCtx;

let lastToneTime = 0;

const minToneHz = 180;
const maxToneHz = 1100;

const initAudio = () => {
  if (audioCtx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audioCtx = new Ctx();
};

export const primeAudio = () => {
  initAudio();
  if (audioCtx?.state === "suspended") {
    audioCtx.resume();
  }
};

export const playTone = (value) => {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  if (now - lastToneTime < 0.015) return;
  lastToneTime = now;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const norm = Math.min(Math.max((value - 10) / 90, 0), 1);
  const freq = minToneHz + norm * (maxToneHz - minToneHz);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
};
